import { useState, useEffect } from 'react';
import { get, post, patch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Edit2, Shield, ShieldOff, KeyRound } from 'lucide-react';
import { validateRequired, validateEmail, validatePassword, type ValidationErrors } from '../utils/validation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'OPERATOR';
}

export const Users = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
  });
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await get<{ users: User[] }>('/api/users');
      setUsers(response.users);
    } catch (error) {
      showToast('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'OPERATOR' });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    const errors: ValidationErrors = {};
    const nameError = validateRequired(formData.name, 'Nome');
    if (nameError) errors.name = nameError;
    
    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) errors.email = emailError;
    else {
      const emailValid = validateEmail(formData.email);
      if (emailValid) errors.email = emailValid;
    }
    
    if (!editingUser) {
      const passError = validateRequired(formData.password, 'Senha');
      if (passError) errors.password = passError;
      else {
        const passValid = validatePassword(formData.password);
        if (passValid) errors.password = passValid;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Corrija os erros no formulário', 'error');
      return;
    }
    
    setFormErrors({});
    setSubmitting(true);

    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        await patch<{ user: User }>(`/api/users/${editingUser.id}`, updateData);
        showToast('Usuário atualizado com sucesso', 'success');
      } else {
        await post<{ user: User }>('/api/users', formData);
        showToast('Usuário criado com sucesso', 'success');
      }
      setShowModal(false);
      loadUsers();
    } catch (error: unknown) {
      const err = error as { message?: string };
      showToast(err.message || 'Erro ao salvar usuário', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (user.id === currentUser?.id) {
      showToast('Você não pode desativar/ativar a si mesmo', 'error');
      return;
    }

    try {
      const endpoint = user.active ? 'deactivate' : 'activate';
      await patch<{ user: User }>(`/api/users/${user.id}/${endpoint}`);
      showToast(
        user.active ? 'Usuário desativado com sucesso' : 'Usuário ativado com sucesso',
        'success'
      );
      loadUsers();
    } catch (error: unknown) {
      const err = error as { message?: string };
      showToast(err.message || 'Erro ao atualizar usuário', 'error');
    }
  };

  const handleOpenResetPassword = (userId: string) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const passError = validateRequired(newPassword, 'Senha');
    if (passError) {
      setPasswordErrors({ password: passError });
      showToast(passError, 'error');
      return;
    }
    
    const passValid = validatePassword(newPassword);
    if (passValid) {
      setPasswordErrors({ password: passValid });
      showToast(passValid, 'error');
      return;
    }

    setSubmitting(true);
    setPasswordErrors({});
    try {
      await patch<{ user: User }>(`/api/users/${selectedUserId}/reset-password`, {
        password: newPassword,
      });
      showToast('Senha alterada com sucesso', 'success');
      setShowPasswordModal(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showToast(err.message || 'Erro ao alterar senha', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role: string) => {
    return role === 'ADMIN' ? 'Administrador' : 'Operador';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários do Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os usuários com acesso ao sistema</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <UserPlus size={18} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Carregando usuários...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-serif italic text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {user.active ? 'Ativo' : 'Desativado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenResetPassword(user.id)}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Resetar senha"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-2 rounded transition-colors ${
                            user.active
                              ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                              : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={user.active ? 'Desativar' : 'Ativar'}
                        >
                          {user.active ? <ShieldOff size={16} /> : <Shield size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  autoFocus
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    minLength={6}
                    required
                  />
                  {formErrors.password && <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>}
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'OPERATOR' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="OPERATOR">Operador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : editingUser ? 'Salvar' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resetar Senha</h2>
            <p className="text-sm text-gray-500 mb-4">
              Digite a nova senha para o usuário selecionado.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.password) setPasswordErrors({});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    passwordErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  minLength={6}
                  required
                  autoFocus
                />
                {passwordErrors.password && (
                  <p className="text-xs text-red-600 mt-1">{passwordErrors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
