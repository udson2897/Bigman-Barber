import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ShoppingBag, Calendar, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';

interface UserMenuProps {
  user: any;
  onLogout: () => void;
}

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { updateProfile } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Evitar re-renders desnecessários
  const userName = user?.profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';
  const userPhone = user?.profile?.phone || user?.user_metadata?.phone || '';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden md:block text-sm font-medium dark:text-white">
          {userName}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform dark:text-white ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="font-medium dark:text-white">{userName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{userEmail}</p>
            {userPhone && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{userPhone}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/meus-agendamentos"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Meus Agendamentos</span>
            </Link>

            <Link
              to="/meus-pedidos"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Meus Pedidos</span>
            </Link>

            <Link
              to="/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Link>

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
