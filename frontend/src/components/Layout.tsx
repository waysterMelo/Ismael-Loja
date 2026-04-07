import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ShoppingBag, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const pathname = location.pathname.split('/').pop() || 'dashboard';

  const allMenuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard size={20} strokeWidth={1.5} />, path: '/dashboard', adminOnly: false },
    { id: 'pos', label: 'Vendas', icon: <ShoppingBag size={20} strokeWidth={1.5} />, path: '/pos', adminOnly: false },
    { id: 'notes', label: 'Títulos e Notas', icon: <FileText size={20} strokeWidth={1.5} />, path: '/notes', adminOnly: false },
    { id: 'customers', label: 'Clientes', icon: <Users size={20} strokeWidth={1.5} />, path: '/customers', adminOnly: false },
    { id: 'audit', label: 'Auditoria', icon: <Activity size={20} strokeWidth={1.5} />, path: '/audit', adminOnly: true },
  ];

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (id: string) => pathname === id;

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
  const userRoleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Operador';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-[280px] h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-24 flex items-center px-8 border-b border-gray-100">
           <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 italic">IWR.</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 mt-1">Atelier OS</span>
           </div>
        </div>
        <nav className="flex-1 py-10 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all group relative
                ${isActive(item.id) ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}
              `}
            >
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-900 transition-all duration-300 ${isActive(item.id) ? 'opacity-100' : 'opacity-0'}`}></div>
              <span className="transition-transform">{item.icon}</span>
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-gray-100">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-serif italic text-xs">
                   {userInitial}
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-gray-900">{user?.name || 'Usuário'}</span>
                   <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{userRoleLabel}</span>
                </div>
             </div>
             <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900 transition-colors">
                <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50">
        <header className="h-24 px-10 flex items-center justify-end shrink-0">
          <span className="text-lg font-serif text-gray-900 capitalize">
            {menuItems.find(m => isActive(m.id))?.label}
          </span>
        </header>
        <div className="flex-1 overflow-y-auto px-10 pb-10 scroll-smooth">
           <div className="max-w-[1600px] mx-auto">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};
