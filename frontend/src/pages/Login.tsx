import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { post } from '../api/client';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await post<{token: string; user: {id: string; name: string; email: string; role: string}}>(
        '/api/auth/login',
        { email, password }
      );
      localStorage.setItem('iwr_token', response.token);
      localStorage.setItem('iwr_user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na autenticação';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
        <div className="hidden lg:flex w-1/2 bg-gray-900 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950"></div>
          <div className="relative z-10 text-center p-12">
             <h1 className="text-8xl font-serif text-white italic tracking-tighter mb-4">IWR.</h1>
             <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.3em]">Management System</p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
          <div className="w-full max-w-md space-y-12">
             <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Bem-vindo</span>
                <h2 className="text-4xl font-serif text-gray-900 mt-2">Acesso ao Sistema</h2>
             </div>
             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                   <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">Identificação</label>
                      <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 py-3 text-lg text-gray-900 outline-none focus:border-gray-900 transition-colors placeholder:text-gray-300 font-serif" placeholder="usuario@iwr.com" />
                   </div>
                   <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">Senha</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 py-3 text-lg text-gray-900 outline-none focus:border-gray-900 transition-colors placeholder:text-gray-300 font-serif" placeholder="••••••••" />
                   </div>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-gray-900 text-white py-5 px-6 flex items-center justify-between group hover:bg-gray-700 transition-all duration-300 disabled:opacity-50">
                  <span className="font-medium tracking-wide">{loading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                </button>
             </form>
          </div>
        </div>
    </div>
  );
};
