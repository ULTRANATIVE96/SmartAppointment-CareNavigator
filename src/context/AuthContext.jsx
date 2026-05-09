import React, { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext({})

// TOGGLE THIS TO TRUE TO BYPASS SUPABASE
const MOCK_MODE = false;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (MOCK_MODE) {
      // Use sessionStorage so it clears when tab is closed (per user request)
      const savedUser = sessionStorage.getItem('mock_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setProfile({
          full_name: parsed.email.split('@')[0],
          role: parsed.email.includes('admin') ? 'admin' : 'patient',
          avatar_url: null
        });
      }
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const timeout = setTimeout(() => { if (loading) setLoading(false); }, 3000);
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.warn('Session check failed:', err.message)
      } finally {
        clearTimeout(timeout);
        setLoading(false)
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) {
        setProfile(data)
      } else {
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          setProfile({
            id: userId,
            full_name: userData.user.user_metadata?.full_name || 'User',
            role: userData.user.user_metadata?.role || 'patient'
          })
        }
      }
    } catch (err) { console.warn('Profile fetch handled') }
  }

  const mockSignIn = async ({ email, password: providedPassword }) => {
    // Determine role from email pattern
    let role = 'patient';
    if (email.toLowerCase().includes('admin')) role = 'admin';
    else if (email.toLowerCase().includes('doctor')) role = 'doctor';
    
    // Superuser check
    const SUPERUSER_EMAIL = 'smart@gmail.com';
    if (email === SUPERUSER_EMAIL) role = 'superuser';

    // Create a consistent UUID for this email
    const mockId = email === SUPERUSER_EMAIL 
      ? '00000000-0000-0000-0000-000000000001'
      : '00000000-0000-0000-0000-' + Math.abs(email.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16).padStart(12, '0');

    // NEW: Check the database for this profile to see if they have a custom password
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', mockId)
      .single();

    if (dbProfile?.password && dbProfile.password !== providedPassword) {
      return { error: { message: "Invalid password for this fake account." }, data: null };
    }

    const mockUser = { id: mockId, email };
    sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
    setUser(mockUser);

    const name = dbProfile?.full_name || email.split('@')[0]
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const finalRole = dbProfile?.role || role;

    setProfile({
      id: mockId,
      full_name: name,
      role: finalRole,
      avatar_url: dbProfile?.avatar_url || null
    });

    return { error: null, data: { user: { id: mockId, email, user_metadata: { role: finalRole, full_name: name } } } };
  };

  const value = {
    signUp: MOCK_MODE ? mockSignIn : (data) => supabase.auth.signUp(data),
    signIn: MOCK_MODE ? mockSignIn : (data) => supabase.auth.signInWithPassword(data),
    signOut: () => {
      if (MOCK_MODE) {
        sessionStorage.removeItem('mock_user');
        setUser(null);
        setProfile(null);
        window.location.href = '/'; // Force back to login
      } else {
        supabase.auth.signOut();
      }
    },
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'doctor',
    isPatient: profile?.role === 'patient',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
