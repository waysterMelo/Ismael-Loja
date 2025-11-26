import React, { useState } from 'react';
import { Customer } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Search, Phone, Star, MoreHorizontal, Mail, MapPin } from 'lucide-react';
import { CustomerDetailsModal } from '../components/CustomerDetailsModal';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(storageService.getCustomers());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '', cpf: '', phone: '', email: '', address: '', isVip: false
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.cpf) return;
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      cpf: newCustomer.cpf,
      phone: newCustomer.phone || '',
      email: newCustomer.email || '',
      address: newCustomer.address || '',
      isVip: !!newCustomer.isVip,
      createdAt: new Date().toISOString()
    };
    storageService.addCustomer(customer);
    setCustomers(storageService.getCustomers());
    setShowAddForm(false);
    setNewCustomer({ name: '', cpf: '', phone: '', email: '', address: '', isVip: false });
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for random gradient avatar
  const getAvatarGradient = (name: string) => {
     const gradients = [
        'from-blue-400 to-blue-600',
        'from-purple-400 to-purple-600',
        'from-pink-400 to-pink-600',
        'from-green-400 to-green-600',
        'from-orange-400 to-orange-600'
     ];
     const index = name.length % gradients.length;
     return gradients[index];
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-system-text tracking-tight">Clientes</h1>
           <p className="text-sm text-gray-500 mt-1">{customers.length} contatos registrados</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-system-blue text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 ios-btn"
        >
          <Plus size={18} /> Adicionar Contato
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
         <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 group-focus-within:text-system-blue transition-colors" />
         </div>
         <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou telefone..." 
            className="w-full bg-white pl-10 pr-4 py-3.5 rounded-2xl border border-transparent shadow-sm text-sm outline-none focus:ring-2 focus:ring-system-blue/20 focus:bg-white transition-all placeholder:text-gray-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      {/* Contact Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div 
            key={customer.id}
            onClick={() => setSelectedCustomer(customer)}
            className={`group relative bg-white rounded-2xl p-5 shadow-sm border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg
               ${customer.isVip ? 'border-amber-200 shadow-amber-100/50' : 'border-gray-100 hover:border-blue-100'}`}
          >
            {/* VIP Badge */}
            {customer.isVip && (
               <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 flex items-center justify-center text-yellow-800 shadow-sm animate-pulse-slow">
                     <Star size={12} fill="currentColor" />
                  </div>
               </div>
            )}

            <div className="flex items-start gap-4 mb-4">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md bg-gradient-to-br ${getAvatarGradient(customer.name)}`}>
                  {customer.name.charAt(0)}
               </div>
               <div>
                  <h3 className="font-bold text-system-text text-base leading-tight mb-1 group-hover:text-system-blue transition-colors">{customer.name}</h3>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 inline-block">
                     {customer.isVip ? 'Cliente VIP' : 'Cliente'}
                  </span>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} className="text-gray-300" />
                  <span>{customer.phone || 'Sem número'}</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-gray-300" />
                  <span className="truncate">{customer.address || 'Sem endereço'}</span>
               </div>
            </div>
            
            {/* Hover Action */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
               <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-system-blue hover:text-white flex items-center justify-center transition-colors">
                  <MoreHorizontal size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Search size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Nenhum cliente encontrado.</p>
         </div>
      )}

      {/* Add Customer Sheet - iOS Modal Style */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowAddForm(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
             
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <h3 className="font-bold text-xl text-system-text">Novo Contato</h3>
                <button onClick={() => setShowAddForm(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                   <Plus size={20} className="rotate-45 text-gray-500" />
                </button>
             </div>

             <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Informações Pessoais</label>
                   <input required placeholder="Nome Completo" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-system-blue/30 focus:ring-4 focus:ring-system-blue/10 outline-none transition-all" 
                     value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">CPF</label>
                      <input required placeholder="000.000.000-00" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-system-blue/30 focus:ring-4 focus:ring-system-blue/10 outline-none transition-all"
                        value={newCustomer.cpf} onChange={e => setNewCustomer({...newCustomer, cpf: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Celular</label>
                      <input placeholder="(00) 00000-0000" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-system-blue/30 focus:ring-4 focus:ring-system-blue/10 outline-none transition-all"
                        value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Localização</label>
                   <input placeholder="Endereço completo" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-system-blue/30 focus:ring-4 focus:ring-system-blue/10 outline-none transition-all"
                     value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl flex items-center gap-3 border border-amber-100">
                   <input type="checkbox" id="vip" className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300" 
                     checked={newCustomer.isVip} onChange={e => setNewCustomer({...newCustomer, isVip: e.target.checked})} />
                   <label htmlFor="vip" className="text-sm font-semibold text-amber-900 cursor-pointer flex-1">Marcar como Cliente VIP</label>
                   <Star size={16} className="text-amber-500" fill="currentColor" />
                </div>

                <div className="pt-4">
                   <button type="submit" className="w-full bg-system-text text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] transition-all ios-btn">
                      Salvar Novo Contato
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  );
};