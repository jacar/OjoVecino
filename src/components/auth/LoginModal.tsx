import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Building,
  Home,
  Briefcase,
  Wrench,
  Sparkles,
  CheckCircle2,
  X,
  LogIn,
  UserPlus,
  Phone,
  AlertCircle
} from 'lucide-react';
import { Role, User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  defaultRole,
}) => {
  const {
    users,
    currentUser,
    login,
    registerUser,
    activeCommunity,
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<'quick' | 'login' | 'register'>('quick');
  const [authRole, setAuthRole] = useState<'propietario' | 'admin'>(
    defaultRole === 'admin' ? 'admin' : 'propietario'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUnit, setRegUnit] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<Role>('vecino');
  const [adminPin, setAdminPin] = useState('');

  if (!isOpen) return null;

  // Handle 1-Click Quick Demo Login
  const handleQuickLogin = async (user: User) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(user.email, 'demo123', user);
      onClose();
    } catch (e: any) {
      setErrorMessage(e?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Standard Login
  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password);
      onClose();
    } catch (e: any) {
      setErrorMessage(
        e?.message || 'No se pudo iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration
  const handleFormRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regUnit.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos');
      return;
    }

    if (regRole === 'admin' && adminPin !== 'ADMIN2026') {
      setErrorMessage('Código PIN de Administrador incorrecto (usa ADMIN2026 para demo)');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        unit: regUnit.trim(),
        phone: regPhone.trim() || undefined,
        role: regRole,
        password: regPassword || 'demo123',
      });
      onClose();
    } catch (e: any) {
      setErrorMessage(e?.message || 'Error al registrar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // Group demo users
  const adminUsers = users.filter((u) => u.role === 'admin' || u.role === 'operador' || u.role === 'seguridad');
  const residentUsers = users.filter((u) => u.role === 'vecino');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Acceso a OJO VECINO
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                  Firebase Auth
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeCommunity.name} • Portal de Seguridad & Convivencia
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 mt-4 p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('quick');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acceso Rápido 1-Click</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* TAB 1: 1-CLICK QUICK DEMO LOGIN */}
          {activeTab === 'quick' && (
            <div className="space-y-6">
              {/* Administrator & Operational Roles */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Mesa de Control & Administración
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Acceso Total
                  </span>
                </div>

                <div className="space-y-2">
                  {adminUsers.map((u) => {
                    const isSelected = currentUser.id === u.id;
                    const isAdm = u.role === 'admin';
                    const isOp = u.role === 'operador';
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleQuickLogin(u)}
                        disabled={isLoading}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all group cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
                              isAdm
                                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                                : isOp
                                ? 'bg-gradient-to-tr from-amber-500 to-orange-600'
                                : 'bg-gradient-to-tr from-slate-700 to-slate-900'
                            }`}
                          >
                            {isAdm ? <ShieldCheck className="w-5 h-5" /> : isOp ? <Wrench className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {u.name}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-600 text-white">
                                  ACTUAL
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {u.unit} • <span className="text-indigo-600 font-medium">{u.email}</span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-xs font-bold text-slate-700 transition-all">
                          <span>Entrar</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Residents & Owners */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-950 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-cyan-600" />
                    Propietarios & Residentes
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                    Portal Vecinos
                  </span>
                </div>

                <div className="space-y-2">
                  {residentUsers.map((u) => {
                    const isSelected = currentUser.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleQuickLogin(u)}
                        disabled={isLoading}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all group cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-50/80 border-cyan-400 ring-2 ring-cyan-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                            <Home className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition-colors truncate">
                                {u.name}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-600 text-white">
                                  ACTUAL
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {u.unit} • <span className="text-cyan-700 font-medium">{u.email}</span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-cyan-600 group-hover:text-white text-xs font-bold text-slate-700 transition-all">
                          <span>Entrar</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INICIAR SESION CON CREDENCIALES */}
          {activeTab === 'login' && (
            <form onSubmit={handleFormLogin} className="space-y-4">
              {/* Mode Toggle (Propietario vs Admin) */}
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthRole('propietario')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authRole === 'propietario'
                      ? 'bg-white text-cyan-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Soy Propietario / Residente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthRole('admin')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authRole === 'admin'
                      ? 'bg-white text-indigo-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Soy Administrador / Conserje</span>
                </button>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      authRole === 'admin'
                        ? 'administracion@altosdelparque.cl'
                        : 'carlos.mendez@vecino.cl'
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Contraseña
                  </label>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                    ¿Olvidaste tu clave?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Verificando...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar al Sistema</span>
                  </>
                )}
              </button>

              {/* Quick Fill Hints */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 text-center mb-2">
                  Sugerencia para prueba: haz click para autocompletar
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('administracion@altosdelparque.cl');
                      setPassword('demo123');
                      setAuthRole('admin');
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    👑 Admin Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('carlos.mendez@vecino.cl');
                      setPassword('demo123');
                      setAuthRole('propietario');
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    👤 Propietario Carlos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('mariana.soto@vecino.cl');
                      setPassword('demo123');
                      setAuthRole('propietario');
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    👤 Propietaria Mariana
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: REGISTRO DE NUEVO PROPIETARIO / USUARIO */}
          {activeTab === 'register' && (
            <form onSubmit={handleFormRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej. Andrea Morales"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="andrea@vecino.cl"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidad / Depto / Casa *
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regUnit}
                      onChange={(e) => setRegUnit(e.target.value)}
                      placeholder="Torre A - Depto 704"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Móvil (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Cuenta
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="vecino">Propietario / Residente</option>
                    <option value="admin">Administrador de Comunidad</option>
                    <option value="operador">Operador Técnico / Mantención</option>
                    <option value="seguridad">Conserjería / Guardia</option>
                  </select>
                </div>
              </div>

              {regRole === 'admin' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    PIN de Seguridad Administrador (Código Demo: ADMIN2026)
                  </label>
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Ingresa ADMIN2026"
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-sm focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Completar Registro y Entrar</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer with Privacy note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encriptación y Privacidad Garantizada</span>
          </div>
          <span className="font-bold text-slate-700">OJO VECINO 2026</span>
        </div>
      </div>
    </div>
  );
};
