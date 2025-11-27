import React from 'react';
import { LayoutDashboard, Users, FileText, ShoppingBag, Search, Bell, Menu, LogOut, Command } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
    { id: 'pos', label: 'Vendas', icon: <ShoppingBag size={20} strokeWidth={1.5} /> },
    { id: 'notes', label: 'Títulos & Notas', icon: <FileText size={20} strokeWidth={1.5} /> },
    { id: 'customers', label: 'Clientele', icon: <Users size={20} strokeWidth={1.5} /> },
  ];

  return (
    <div className="flex h-screen bg-atelier-bg overflow-hidden">
      
      {/* Sidebar - Architectural Column */}
      <aside className="w-[280px] h-full bg-atelier-surface border-r border-atelier-line flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Brand Header */}
        <div className="h-24 flex items-center px-8 border-b border-atelier-line/50">
           <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-atelier-black italic">IWR.</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-atelier-secondary mt-1">Atelier OS</span>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-10 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-500 group relative
                  ${isActive ? 'text-atelier-black' : 'text-atelier-secondary hover:text-atelier-black'}
                `}
              >
                {/* Active Indicator Line */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-atelier-black transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>

                <span className={`transition-transform duration-500 ${isActive ? 'scale-100' : 'scale-95 group-hover:scale-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-8 border-t border-atelier-line/50">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-atelier-black text-white rounded-full flex items-center justify-center font-serif italic text-xs">
                   E.
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-atelier-black">Eng. Chefe</span>
                   <span className="text-[10px] text-atelier-secondary uppercase tracking-wider">Admin</span>
                </div>
             </div>
             <button className="text-atelier-secondary hover:text-atelier-black transition-colors">
                <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-atelier-bg">
        
        {/* Minimal Header */}
        <header className="h-24 px-10 flex items-center justify-between shrink-0">
           <div className="flex flex-col">
              <h2 className="font-serif text-3xl text-atelier-black capitalize italic">
                {menuItems.find(m => m.id === activePage)?.label.toLowerCase()}
              </h2>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-atelier-line shadow-sm hover:border-atelier-secondary/30 transition-colors cursor-text">
                 <Search size={16} className="text-atelier-secondary" />
                 <span className="text-xs text-atelier-secondary w-24">Buscar...</span>
                 <div className="flex items-center gap-1 px-1.5 py-0.5 bg-atelier-bg rounded border border-atelier-line">
                    <Command size={10} className="text-atelier-secondary" />
                    <span className="text-[10px] font-mono text-atelier-secondary">K</span>
                 </div>
              </div>
              
              <button className="relative w-10 h-10 flex items-center justify-center border border-atelier-line rounded-full bg-white hover:bg-atelier-bg transition-colors">
                 <Bell size={18} className="text-atelier-black" />
                 <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
           </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 scroll-smooth">
           <div className="max-w-[1600px] mx-auto animate-enter">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};