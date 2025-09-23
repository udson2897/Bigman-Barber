import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Scissors, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../lib/auth';
import { LoginModal } from '../auth/LoginModal';
import UserMenu from '../auth/UserMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, loading, login, logout, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Checar autenticação
  useEffect(() => {
    if (!authChecked) {
      checkAuth();
      setAuthChecked(true);
    }
  }, [checkAuth, authChecked]);

  // Mostrar modal de login automaticamente se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setIsLoginModalOpen(false);
    } else {
      setIsLoginModalOpen(false);
    }
  }, [loading, isAuthenticated]);

  // Efeito de scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Serviços', path: '/servicos' },
    { name: 'Agendar', path: '/agendar' },
    { name: 'Loja', path: '/loja' },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contato', path: '/contato' },
  ];

  const handleLoginSuccess = (userData: any) => {
    login(userData);
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 bg-white dark:bg-slate-800 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold font-serif tracking-wider">
                BIG MAN <span className="text-accent">Barber</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `font-medium hover:text-accent transition-colors dark:text-slate-200 dark:hover:text-accent ${
                      isActive ? 'text-accent dark:text-accent' : ''
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors dark:text-slate-200"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Auth section - Desktop */}
              <div className="hidden lg:block">
                {loading ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  </div>
                ) : isAuthenticated && user ? (
                  <UserMenu user={user} onLogout={logout} />
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center space-x-2 btn btn-outline py-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Entrar</span>
                  </button>
                )}
              </div>

              {/* Admin link */}
              <Link
                to="/admin/login"
                className="hidden lg:block text-sm text-slate-500 dark:text-slate-400 hover:text-accent transition-colors"
              >
                Admin
              </Link>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors dark:text-slate-200"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="container-custom bg-white dark:bg-slate-800 py-6 space-y-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block py-3 px-4 font-medium hover:text-accent transition-colors dark:text-slate-200 dark:hover:text-accent relative text-lg border-b border-slate-100 dark:border-slate-700 ${
                    isActive ? 'text-accent dark:text-accent' : ''
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {isAuthenticated && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                {link.name}
              </NavLink>
            ))}

            {/* Mobile auth section */}
            <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6 mt-6 space-y-4">
              {loading ? (
                <div className="px-4 py-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
                  <span className="dark:text-white">Carregando...</span>
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg mx-2">
                    <p className="font-medium dark:text-white text-lg">
                      {user.profile?.name || user.email?.split('@')[0] || 'Usuário'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
                    {user.profile?.phone && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.profile.phone}</p>
                    )}
                  </div>
                  <Link
                    to="/perfil"
                    className="block py-3 px-4 text-slate-700 dark:text-slate-300 hover:text-accent font-medium border-b border-slate-100 dark:border-slate-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    to="/meus-agendamentos"
                    className="block py-3 px-4 text-slate-700 dark:text-slate-300 hover:text-accent font-medium border-b border-slate-100 dark:border-slate-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Meus Agendamentos
                  </Link>
                  <Link
                    to="/meus-pedidos"
                    className="block py-3 px-4 text-slate-700 dark:text-slate-300 hover:text-accent font-medium border-b border-slate-100 dark:border-slate-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Meus Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 text-red-600 hover:text-red-700 font-medium mt-2"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="px-2">
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full py-4 px-4 font-medium text-accent hover:text-accent/80 flex items-center justify-center space-x-3 bg-accent/10 rounded-lg text-lg transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Entrar / Criar Conta</span>
                  </button>
                </div>
              )}
            </div>

            {/* Admin link for mobile */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
              <Link
                to="/admin/login"
                className="block py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hover:text-accent text-center"
                onClick={() => setIsOpen(false)}
              >
                Área Administrativa
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;
