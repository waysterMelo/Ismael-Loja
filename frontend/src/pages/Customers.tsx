import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { get, getWithParams, post, patch } from '../api/client';
import { Plus, Search, Phone, Star, Mail, MapPin, X, Pen, Trash2 } from 'lucide-react';
import { CustomerDetailsModal } from '../components/CustomerDetailsModal';
import { Pagination } from '../components/Pagination';
import { validateRequired, validateCPF, validateEmail, validatePhone, type ValidationErrors } from '../utils/validation';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface ApiCustomer {
  id: string;
  name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isVip: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  data: ApiCustomer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const Customers: React.FC = () => {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', cpf: '', phone: '', email: '', address: '', isVip: false
  });

  useEffect(() => {
    loadCustomers();
  }, [page, limit]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await getWithParams<PaginatedResponse>('/api/customers', { page, limit });
      setCustomers((response.data || []).map((c: ApiCustomer) => ({
        id: c.id,
        name: c.name,
        cpf: c.cpf || '',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || '',
        isVip: c.isVip,
        createdAt: c.createdAt,
      })));
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
      setHasNext(response.pagination.hasNext);
      setHasPrev(response.pagination.hasPrev);
    } catch (e) {
      console.error('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      cpf: customer.cpf,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      isVip: customer.isVip,
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditingCustomer(null);
    setFormData({ name: '', cpf: '', phone: '', email: '', address: '', isVip: false });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({ name: '', cpf: '', phone: '', email: '', address: '', isVip: false });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: ValidationErrors = {};
    const nameErr = validateRequired(formData.name, 'Nome');
    if (nameErr) errors.name = nameErr;
    const cpfErr = validateCPF(formData.cpf);
    if (cpfErr) errors.cpf = cpfErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errors.phone = phoneErr;

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors).join(' • '));
      return;
    }

    const payload: Record<string, unknown> = { name: formData.name };
    if (formData.cpf) payload.cpf = formData.cpf.replace(/\D/g, '');
    if (formData.phone) payload.phone = formData.phone;
    if (formData.email) payload.email = formData.email;
    if (formData.address) payload.address = formData.address;
    payload.isVip = !!formData.isVip;

    try {
      if (editingCustomer) {
        await patch(`/api/customers/${editingCustomer.id}`, payload);
      } else {
        await post('/api/customers', payload);
      }
      handleCloseForm();
      loadCustomers();
      toast.success(editingCustomer ? 'Cliente atualizado com sucesso' : 'Cliente criado com sucesso');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    }
  };

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      loadCustomers();
      return;
    }

    try {
      setSearching(true);
      const response = await get<{customers: ApiCustomer[]}>(`/api/customers/search?query=${encodeURIComponent(term)}`);
      setFilteredCustomers((response.customers || []).map((c: ApiCustomer) => ({
        id: c.id,
        name: c.name,
        cpf: c.cpf || '',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || '',
        isVip: c.isVip,
        createdAt: c.createdAt,
      })));
    } catch (e) {
      console.error('Failed to search customers', e);
      toast.error('Falha ao buscar clientes');
    } finally {
      setSearching(false);
    }
  };

  const displayCustomers = searchTerm ? filteredCustomers : customers;

  const getAvatarGradient = (name: string) => {
     const gradients = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-green-400 to-green-600', 'from-orange-400 to-orange-600'];
     return gradients[name.length % gradients.length];
  };

  if (loading || searching) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} clientes registrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={openNew}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        )}
      </div>

      <div className="relative">
         <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
         </div>
         <input type="text" placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full bg-white pl-10 pr-4 py-3.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            value={searchTerm} onChange={e => handleSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayCustomers.map((customer) => (
          <div key={customer.id}
            className={`group relative bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md
               ${customer.isVip ? 'border-amber-200' : 'border-gray-100 hover:border-blue-100'}`}
          >
            {customer.isVip && (
               <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 flex items-center justify-center text-yellow-800 shadow-sm">
                     <Star size={12} fill="currentColor" />
                  </div>
               </div>
            )}

            {/* Edit button */}
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); openEdit(customer); }}
                className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
                title="Editar cliente"
              >
                 <Pen size={12} />
              </button>
            )}

            <div
              className="cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-start gap-4 mb-4">
                 <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md bg-gradient-to-br ${getAvatarGradient(customer.name)}`}>
                    {customer.name.charAt(0)}
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{customer.name}</h3>
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
                 {customer.email && <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={14} className="text-gray-300" />
                    <span className="truncate">{customer.email}</span>
                 </div>}
                 {customer.address && <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} className="text-gray-300" />
                    <span className="truncate">{customer.address}</span>
                 </div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayCustomers.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Search size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{searchTerm ? 'Nenhum cliente encontrado para a busca.' : 'Nenhum cliente registrado.'}</p>
         </div>
      )}

      {/* Pagination */}
      {!loading && customers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleCloseForm}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-900">
                  {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <button onClick={handleCloseForm} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                   <X size={20} className="rotate-45 text-gray-500" />
                </button>
             </div>
             <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto">
                <input required placeholder="Nome Completo" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <input placeholder="CPF" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                     value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                   <input placeholder="Celular" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                     value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <input placeholder="Endereço" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                <input placeholder="Email" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <div className="bg-amber-50 p-4 rounded-xl flex items-center gap-3 border border-amber-100">
                   <input type="checkbox" id="vip" className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                     checked={formData.isVip} onChange={e => setFormData({...formData, isVip: e.target.checked})} />
                   <label htmlFor="vip" className="text-sm font-semibold text-amber-900 cursor-pointer flex-1">Marcar como Cliente VIP</label>
                </div>
                <div className="pt-4">
                   <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-700 transition-all">
                      {editingCustomer ? 'Salvar Alterações' : 'Salvar'}
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
