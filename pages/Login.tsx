import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        localStorage.setItem('iwr_token', 'mock_token');
        onLogin();
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex bg-atelier-bg">
       
       {/* Left: Brand / Image */}
       <div className="hidden lg:flex w-1/2 bg-atelier-black items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale mix-blend-overlay"></div>
          <div className="relative z-10 text-center p-12">
             <h1 className="text-8xl font-serif text-white italic tracking-tighter mb-4">IWR.</h1>
             <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.3em]">Management System v2.0</p>
          </div>
       </div>

       {/* Right: Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
          <div className="w-full max-w-md space-y-12 animate-enter">
             
             <div>
                <span className="text-xs font-bold uppercase tracking-widest text-atelier-secondary">Bem-vindo</span>
                <h2 className="text-4xl font-serif text-atelier-black mt-2">Acesso ao Atelier</h2>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                   <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-atelier-black mb-2">Identificação</label>
                      <input 
                        type="text" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-atelier-line py-3 text-lg text-atelier-black outline-none focus:border-atelier-black transition-colors placeholder:text-gray-300 font-serif"
                        placeholder="usuario@iwr.com"
                      />
                   </div>
                   <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-atelier-black mb-2">Senha</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-transparent border-b border-atelier-line py-3 text-lg text-atelier-black outline-none focus:border-atelier-black transition-colors placeholder:text-gray-300 font-serif"
                        placeholder="••••••••"
                      />
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-atelier-black text-white py-5 px-6 flex items-center justify-between group hover:bg-atelier-accent transition-all duration-500"
                >
                  <span className="font-medium tracking-wide">{loading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                </button>
             </form>

             <div className="pt-12 border-t border-atelier-line flex justify-between items-center text-[10px] font-mono text-atelier-secondary uppercase">
                <span>© 2026 IWR Moda</span>
                <span>Termos de Privacidade</span>
             </div>
          </div>
       </div>
    </div>
  );
};