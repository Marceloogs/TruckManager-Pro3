
import React, { useState } from 'react';
import { User } from '../types';
import { Truck, User as UserIcon, ChevronRight, UserPlus, Eye, EyeOff, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLogin: (user: User) => void;
  allUsers?: User[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, allUsers = [] }) => {
  const [formData, setFormData] = useState({
    email: '',
    plate: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewForm, setShowNewForm] = useState(allUsers.length === 0);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [authPassword, setAuthPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatEmail = (plate: string) => `${plate.toLowerCase().replace('-', '')}@truckmanager.com`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            driver_name: formData.email.split('@')[0], // Use email prefix as temporary name
            plate: formData.plate.toUpperCase()
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          // If already registered, try to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });
          if (signInError) throw signInError;
        } else {
          throw signUpError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar acesso.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (selectedUserForPassword && authPassword) {
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: selectedUserForPassword.email || formatEmail(selectedUserForPassword.plate),
          password: authPassword
        });
        if (signInError) throw signInError;
      } catch (err: any) {
        setError(err.message || 'Senha incorreta ou erro de conexão.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col p-6 max-w-lg mx-auto relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col items-center mt-16 mb-12 z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 border border-white/10 animate-in zoom-in duration-700">
          <Truck size={48} className="text-white drop-shadow-md" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2 text-center tracking-tight drop-shadow-sm">
          Becker e Mendonça
        </h1>
        <div className="flex items-center gap-2">
          <div className="h-px w-8 bg-blue-500/50"></div>
          <p className="text-blue-400/80 text-center font-black text-[10px] uppercase tracking-[0.3em]">Gestão de Frotas Pro</p>
          <div className="h-px w-8 bg-blue-500/50"></div>
        </div>
      </div>

      <div className="flex-1 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        {selectedUserForPassword ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <UserIcon size={28} />
              </div>
              <div className="text-left">
                <p className="font-black text-white text-lg leading-tight">{selectedUserForPassword.driverName}</p>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1 opacity-80">{selectedUserForPassword.plate}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                <Lock size={14} className="text-blue-500" /> Acesso de Segurança
              </h3>
              <form onSubmit={handleAuthSubmit} className="space-y-8">
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all outline-none text-white font-bold placeholder:text-gray-600"
                    placeholder="Sua senha secreta"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    autoFocus
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-5 text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in shake duration-300">
                    <p className="text-red-400 text-[10px] font-black uppercase text-center">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        Entrar Agora
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSelectedUserForPassword(null); setAuthPassword(''); setError(''); }}
                    className="w-full py-4 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Trocar Perfil
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : allUsers.length > 0 && !showNewForm ? (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-4 mb-2">Selecione seu acesso rápido</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {allUsers.map(user => (
                <button 
                  key={user.id}
                  onClick={() => setSelectedUserForPassword(user)}
                  className="w-full bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between active:scale-[0.98] transition-all hover:bg-white/10 group shadow-lg"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                      <UserIcon size={26} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-white text-base leading-tight group-hover:text-blue-400 transition-colors">{user.driverName}</p>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                         {user.plate}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowNewForm(true)}
              className="w-full py-6 border-2 border-dashed border-white/10 text-gray-500 font-black rounded-[2.5rem] flex items-center justify-center gap-3 hover:border-blue-500/30 hover:text-blue-400 transition-all text-[10px] uppercase tracking-[0.2em] bg-white/2 mt-4"
            >
              <UserPlus size={20} /> Novo Cadastro
            </button>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <UserPlus size={24} className="text-blue-400" />
              </div>
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Solicitar Acesso</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">E-mail de Acesso</label>
                  <input 
                    type="email" 
                    className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all outline-none text-white font-bold placeholder:text-gray-700 shadow-inner"
                    placeholder="exemplo@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Placa do Caminhão</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all outline-none uppercase text-white font-bold placeholder:text-gray-700 shadow-inner"
                    placeholder="ABC-1234"
                    value={formData.plate}
                    onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Criar Senha</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all outline-none text-white font-bold placeholder:text-gray-700 shadow-inner"
                    placeholder="Ao menos 6 dígitos"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-11 text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                  <p className="text-red-400 text-[10px] font-black uppercase text-center">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-5 rounded-3xl shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Jornada'}
                </button>
                {allUsers.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="w-full py-4 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Voltar para perfis salvos
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center z-10">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.5em] font-black mb-1">
          Becker e Mendonça 
        </p>
        <p className="text-[8px] text-blue-500/30 font-bold tracking-[0.2em] uppercase">Powered by High-Performance Management</p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LoginView;
