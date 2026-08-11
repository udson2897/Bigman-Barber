import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogOut } from 'lucide-react';
import { useAdminStore } from '../../lib/store';
import { useAuthStore } from '../../lib/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, checkAdminStatus, isAdmin } = useAdminStore();
  const authStore = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  // Check if user is logged in as client
  useEffect(() => {
    const checkClientLogin = authStore.isClientLoggedIn();
    if (checkClientLogin) {
      setShowLogoutPrompt(true);
    }
  }, []);

  const handleLogoutAndContinue = async () => {
    try {
      await authStore.logout();
      setShowLogoutPrompt(false);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authStore.isClientLoggedIn()) {
        setError('Você está logado como cliente. Por favor, faça logout primeiro.');
        setShowLogoutPrompt(true);
        setLoading(false);
        return;
      }

      // Use the auth store's signIn with admin role
      const { data, error: signInError } = await authStore.signIn(email, password, 'admin');

      if (signInError) throw signInError;

      // Check if user is admin and update store
      await checkAdminStatus();

      // Set login info in store
      login(email);

      // Navigate to admin dashboard
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Email ou senha inválidos');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container-custom max-w-md">
        <div className="card p-8">
          <h1 className="heading-lg text-center mb-8 dark:text-white">Login Administrativo</h1>

          {showLogoutPrompt && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3 mb-4">
                <LogOut className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    Você está logado como cliente
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
                    Para acessar o painel administrativo, você deve fazer logout da sua conta de cliente primeiro.
                  </p>
                  <button
                    type="button"
                    onClick={handleLogoutAndContinue}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Fazer Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 dark:text-white">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 dark:text-white">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;