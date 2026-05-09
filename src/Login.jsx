import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, User, Lock, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

const SUPERUSER_EMAIL = 'smart@gmail.com';

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || (isSignUp && !fullName)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'patient', // Patients only — admins are added by existing admins
            }
          }
        });
        if (error) throw error;
        alert('Verification email sent! Please check your inbox.');
        setIsSignUp(false);
      } else {
        // Add a 10-second timeout to the sign-in process
        const loginPromise = signIn({ email, password });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout. Please check your Supabase URL and network connection.')), 10000)
        );

        const { error, data } = await Promise.race([loginPromise, timeoutPromise]);
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address or disable email confirmation in Supabase settings.');
          }
          throw error;
        }

        // Fetch the user's role directly from the profiles table to ensure we get the latest database-level role updates
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        const targetRole = userProfile?.role || data?.user?.user_metadata?.role;
        
        if (targetRole === 'superuser') {
          // Show role picker for the superuser
          setShowRolePicker(true);
          return;
        }
        
        if (targetRole === 'patient') {
          navigate('/patient');
        } else {
          navigate('/admin');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">

      {/* Superuser Role Picker Overlay */}
      {showRolePicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="text-primary" size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Welcome back!</h2>
              <p className="text-slate-500 text-sm">Which dashboard would you like to enter?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Shield size={22} />
                </div>
                <span className="font-bold text-slate-700 text-sm">Admin Panel</span>
              </button>
              <button
                onClick={() => navigate('/patient')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                  <User size={22} />
                </div>
                <span className="font-bold text-slate-700 text-sm">Patient View</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="bg-primary p-8 text-center relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] text-white/10 rotate-12 scale-150">
            <Activity size={120} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/30">
              <Activity className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
              Welcome to <br /> CareNav System
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-2 font-medium">Please sign in to continue</p>
          </div>
        </div>

        {/* Form */}
        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
          
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              type="button"
              onClick={() => { setIsSignUp(false); setRole('patient'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isSignUp ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isSignUp ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Patient-only sign up notice */}
          {isSignUp && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <User size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Signing up as a Patient</p>
                <p className="text-[10px] text-slate-500">Admin accounts are created by hospital staff only.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white p-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 group mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
