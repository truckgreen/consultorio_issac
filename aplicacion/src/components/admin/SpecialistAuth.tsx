import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';

interface SpecialistAuthProps {
  client: SupabaseClient;
}

export const SpecialistAuth: React.FC<SpecialistAuthProps> = ({ client }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const result = isRegistering
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password });

    setIsLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isRegistering && !result.data.session) {
      setMessage('Revisa tu correo para confirmar la cuenta del especialista.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Acceso de especialistas</h1>
          <p className="text-sm text-slate-500">La agenda clínica es solo para personal autorizado.</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            required
            placeholder="Correo profesional"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {message && <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">{message}</p>}

        <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          {isRegistering ? 'Crear cuenta de especialista' : 'Iniciar sesion'}
        </button>

        <button type="button" onClick={() => { setIsRegistering(!isRegistering); setMessage(''); }} className="w-full text-sm font-semibold text-slate-600 hover:text-amber-600">
          {isRegistering ? 'Ya tengo una cuenta' : 'Registrar nuevo especialista'}
        </button>
      </form>
    </main>
  );
};
