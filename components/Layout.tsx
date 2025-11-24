import React from 'react';
import { LayoutDashboard, Users, FileText, ShoppingCart, LogOut, Bell, Search, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard size={22} /> },
    { id: 'pos', label: 'Nova Venda', icon: <ShoppingCart size={22} /> },
    { id: 'notes', label: 'Gestão de Títulos', icon: <FileText size={22} /> },
    { id: 'customers', label: 'Clientes VIP', icon: <Users size={22} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F2F2F7] overflow-hidden font-sans text-gray-800">
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-gray-200 to-transparent pointer-events-none z-0"></div>

      {/* Floating Sidebar */}
      <aside className="hidden md:flex flex-col w-72 m-4 rounded-3xl bg-luxury-charcoal text-white shadow-2xl z-20 relative overflow-hidden">
        {/* Abstract Gold Shape */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-glow">
                <span className="font-serif font-bold text-luxury-black text-xl">I</span>
             </div>
             <div>
               <h1 className="text-xl font-serif font-bold tracking-wide text-white">IWR <span className="text-gold-500">Lojas</span></h1>
               <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Luxury Retail</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${activePage === item.id 
                  ? 'text-luxury-black font-semibold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {/* Active Background Slide */}
              <div className={`absolute inset-0 bg-gold-gradient transition-transform duration-300 ease-out ${activePage === item.id ? 'translate-x-0' : '-translate-x-full'}`}></div>
              
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-luxury-black font-bold text-xs">EC</div>
               <div>
                 <p className="text-sm text-white font-medium">Eng. Chefe</p>
                 <p className="text-xs text-gold-500">Administrador</p>
               </div>
             </div>
             <button className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 py-2 border-t border-white/10 transition-colors">
               <LogOut size={14} /> Sair
             </button>
          </div>
          <p className="text-[10px] text-center text-gray-600 mt-4 font-mono">v2.0.0 • Stable</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Glass Header */}
        <header className="h-24 flex items-center justify-between px-8 md:px-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-luxury-charcoal animate-fade-in-up">
              {menuItems.find(m => m.id === activePage)?.label}
            </h2>
            <p className="text-sm text-gray-500 animate-fade-in-up stagger-1">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-6 animate-fade-in-up stagger-2">
            <div className="hidden lg:flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-200 focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-100 transition-all w-64">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar no sistema..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-400"
              />
            </div>
            
            <button className="relative p-3 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-gold-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* Mobile Menu Toggle (Visible only on small screens) */}
            <button className="md:hidden p-3 rounded-full bg-luxury-black text-white">
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto px-4 md:px-12 pb-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};