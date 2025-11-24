import React, { useState } from 'react';
import { Customer } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Search, User, Phone, Mail, MapPin, ChevronLeft, ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(storageService.getCustomers());
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '', cpf: '', phone: '', email: '', address: ''
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
      createdAt: new Date().toISOString()
    };

    storageService.addCustomer(customer);
    setCustomers(storageService.getCustomers());
    setShowAddForm(false);
    setNewCustomer({ name: '', cpf: '', phone: '', email: '', address: '' });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar cliente VIP..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-gold-500/50 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
         </div>
         <button 
           onClick={() => setShowAddForm(true)}
           className="w-full md:w-auto bg-luxury-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
         >
           <Plus size={18} /> Novo Cliente
         </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentCustomers.map((customer, idx) => (
          <div 
             key={customer.id} 
             className="group relative h-64 rounded-3xl transition-all duration-500 hover:scale-[1.02] preserve-3d perspective-1000"
             style={{ animationDelay: `${idx * 100}ms` }}
          >
             {/* Card Content - "Black Card" Style */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-black rounded-3xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden border border-gray-800">
                
                {/* Texture/Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg">
                         <User className="text-luxury-black" size={20} />
                      </div>
                      <div>
                         <p className="text-gold-500 text-[10px] font-bold uppercase tracking-[0.2em]">Membro VIP</p>
                         <h3 className="text-white font-serif font-bold text-lg leading-tight truncate max-w-[150px]">{customer.name}</h3>
                      </div>
                   </div>
                   <ShieldCheck className="text-gray-600 group-hover:text-gold-500 transition-colors" size={24} />
                </div>

                {/* Details */}
                <div className="relative z-10 space-y-2 mt-4">
                   <p className="text-gray-400 text-sm font-mono tracking-wider flex items-center gap-2">
                      <span className="w-1 h-1 bg-gold-500 rounded-full"></span> 
                      {customer.cpf}
                   </p>
                   <p className="text-gray-400 text-sm flex items-center gap-2 truncate">
                      <Phone size={12} /> {customer.phone}
                   </p>
                   <p className="text-gray-500 text-xs flex items-center gap-2 truncate">
                      <MapPin size={12} /> {customer.address || 'N/A'}
                   </p>
                </div>

                {/* Footer/Action */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-center">
                   <p className="text-[10px] text-gray-500">Desde {new Date(customer.createdAt).getFullYear()}</p>
                   <button className="text-xs bg-white/10 hover:bg-gold-500 hover:text-black text-white px-4 py-2 rounded-lg backdrop-blur-md transition-all font-bold">
                      Ver Perfil
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
          <div className="flex justify-center items-center gap-4 pt-8">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p-1))}
               disabled={currentPage === 1}
               className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
             >
                <ChevronLeft size={20} />
             </button>
             <div className="flex gap-2">
                {Array.from({length: totalPages}, (_, i) => (
                   <button
                      key={i}
                      onClick={() => setCurrentPage(i+1)}
                      className={`w-3 h-3 rounded-full transition-all ${currentPage === i+1 ? 'bg-gold-500 w-6' : 'bg-gray-300'}`}
                   />
                ))}
             </div>
             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
               disabled={currentPage === totalPages}
               className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
             >
                <ChevronRight size={20} />
             </button>
          </div>
      )}

      {/* Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-luxury-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-luxury-black p-8 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient"></div>
                <h3 className="text-2xl font-serif font-bold text-white mb-1">Cadastrar Cliente</h3>
                <p className="text-gray-400 text-sm">Adicione um novo membro à lista exclusiva.</p>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-4">
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Nome Completo</label>
                    <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-gold-500 outline-none transition-all"
                      value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">CPF</label>
                        <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-gold-500 outline-none"
                        value={newCustomer.cpf} onChange={e => setNewCustomer({...newCustomer, cpf: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Celular</label>
                        <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-gold-500 outline-none"
                        value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
                    <input type="email" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-gold-500 outline-none"
                      value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Endereço</label>
                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-gold-500 outline-none"
                      value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                  </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit"
                  className="flex-1 py-3 bg-luxury-black text-gold-500 font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg">Salvar VIP</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};