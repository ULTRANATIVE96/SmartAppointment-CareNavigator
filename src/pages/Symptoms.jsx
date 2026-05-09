import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, AlertCircle, History, Plus, Lightbulb, ChevronRight, User, Bot } from "lucide-react";

function Symptoms() {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hello! I'm your AI Health Assistant. I can help you understand your symptoms and suggest next steps. What's on your mind today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addEmojis = (text) => {
    let result = text;
    if (/headache/i.test(text)) result += " 🤕";
    if (/fever/i.test(text)) result += " 🌡️";
    if (/cough/i.test(text)) result += " 😷";
    return result;
  };

  const handleSend = async (customInput = null) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: "user", text: textToSend }];
    setMessages(newMessages);
    setLoading(true);
    setInput("");

    try {
      const response = await fetch(
        "https://ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com/chat?noqueue=1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": "5669a97600mshad854a322189d6fp1089ebjsn879a2472a7b1",
            "X-RapidAPI-Host": "ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com"
          },
          body: JSON.stringify({ query: textToSend })
        }
      );

      const data = await response.json();
      const botReply = data?.message || data?.output || data?.answer || "I apologize, I'm having trouble processing that right now.";

      setMessages([...newMessages, { sender: "bot", text: addEmojis(botReply) }]);
    } catch (error) {
      setMessages([...newMessages, { sender: "bot", text: "⚠️ Technical error. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    "I have a persistent headache",
    "Should I be worried about a fever?",
    "Managing seasonal allergies",
    "First aid for a minor burn"
  ];

  return (
    <div className="flex-1 flex flex-row bg-white overflow-hidden font-sans">
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 bg-slate-50 border-r border-slate-100 flex-col p-4 space-y-6">
        <button className="flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-slate-700 active:scale-95">
          <Plus size={18} className="text-primary" />
          New Consultation
        </button>

        <div className="flex-1 space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-3 px-2">History</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-white hover:shadow-sm text-sm text-slate-600 transition-all text-left">
                <History size={14} className="text-slate-400" />
                <span className="truncate">Mild fever last week</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-3 px-2">Quick Access</h3>
            <div className="space-y-1">
              {suggestedPrompts.map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(p)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white hover:shadow-sm text-xs text-slate-600 transition-all text-left group"
                >
                  <span className="truncate">{p}</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
              Not for emergencies. In case of serious symptoms, please call your local emergency number immediately.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Chat Space */}
      <div className="flex-1 flex flex-col relative bg-slate-50/30">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Care AI Agent</h2>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Secure Analysis Active
              </p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Lightbulb size={20} />
          </button>
        </header>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto w-full pb-48 lg:pb-32 custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full p-4 md:p-8 space-y-8">
            
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                  msg.sender === 'user' 
                    ? 'bg-white border-slate-200 text-slate-400' 
                    : 'bg-primary border-primary/20 text-white'
                }`}>
                  {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div className={`flex-1 space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {msg.sender === 'user' ? 'Patient' : 'Care AI'}
                  </p>
                  <div className={`inline-block text-left p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-white text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-slate-100' 
                      : 'text-slate-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 w-full animate-in fade-in">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 border border-primary/20 text-white shadow-sm">
                   <Sparkles size={18} className="animate-spin duration-3000" />
                </div>
                <div className="flex-1 pt-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: "200ms"}}></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: "400ms"}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Dock */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12 pb-28 lg:pb-24">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-sky-400 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <div className="relative bg-white border border-slate-200 rounded-[2rem] p-2 pr-3 flex items-center shadow-xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Describe your symptoms or ask a medical question..."
                  className="flex-1 p-4 bg-transparent focus:outline-none text-slate-800 font-medium"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
              AI Powered Clinical Decision Support
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Symptoms;
