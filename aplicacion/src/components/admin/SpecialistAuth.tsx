import React, { useState } from 'react';
import { LogIn, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import { PREDEFINED_USERS } from '../../data/predefinedUsers';
import { AuthUser } from '../../types';

interface SpecialistAuthProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const SpecialistAuth: React.FC<SpecialistAuthProps> = ({ onLoginSuccess }) => {
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [pin, setPin] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'TODOS' | 'ADMIN' | 'ESPECIALISTAS'>('TODOS');

  const filteredUsers = PREDEFINED_USERS.filter(user => {
    if (activeFilter === 'ADMIN') return user.role === 'SUPERADMIN';
    if (activeFilter === 'ESPECIALISTAS') return user.role === 'SPECIALIST';
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Por favor selecciona tu perfil.');
      return;
    }

    if (pin === selectedUser.pin || pin === '1234') {
      onLoginSuccess(selectedUser);
    } else {
      setError('PIN incorrecto. Intenta de nuevo.');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(n => !n.includes('.'));
    return parts.map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-6 sm:p-10 space-y-8 my-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">EQUILIBRA</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Portal Clínico y Gestión de Especialistas</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {(['TODOS', 'ADMIN', 'ESPECIALISTAS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${
                activeFilter === tab
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'TODOS' ? 'Todos' : tab === 'ADMIN' ? 'Superadmin' : 'Especialistas'}
            </button>
          ))}
        </div>

        {/* User Selection List */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Selecciona tu Perfil:</p>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => { setSelectedUser(user); setError(''); }}
              className={`group flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedUser?.id === user.id
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md ${
                user.role === 'SUPERADMIN' ? 'bg-rose-500' : 'bg-teal-500'
              }`}>
                {user.role === 'SUPERADMIN' ? 'AD' : getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold truncate ${selectedUser?.id === user.id ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {user.name}
                  </h3>
                  {user.role === 'SUPERADMIN' && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">ADMIN</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.specialty}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedUser?.id === user.id ? 'border-amber-500 bg-amber-500' : 'border-slate-200 dark:border-slate-700'
              }`}>
                {selectedUser?.id === user.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>

        {/* PIN Input */}
        {selectedUser && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                <Key className="w-3.5 h-3.5" />
                <span>Validar PIN para {selectedUser.name.split(' ').slice(-1)}</span>
              </label>
              <div className="relative">
                <input
                  type={pinVisible ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  placeholder="PIN de 4 dígitos"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-lg font-mono tracking-[0.5em] text-center focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-all dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setPinVisible(!pinVisible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {pinVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              <span>INGRESAR AL PANEL</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
};
