import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, Shield, Settings, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useAdminStore } from '../../lib/store';

const AdminMiniPanel = () => {
  const navigate = useNavigate();
  const { 
    isAdmin, 
    adminEmail, 
    loginTime, 
    logout, 
    updateActivity, 
    isSessionExpired,
    getTimeRemaining,
    checkAdminStatus 
  } = useAdminStore();
  
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Auto logout when tab is closed or page is refreshed
  useEffect(() => {
    if (!isAdmin) return;

    const handleBeforeUnload = () => {
      // This will trigger when the page is about to be unloaded
      logout();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, start a timer to logout after 5 minutes
        const timeoutId = setTimeout(() => {
          if (document.hidden && isAdmin) {
            logout();
            navigate('/admin/login');
          }
        }, 5 * 60 * 1000); // 5 minutes

        // Store timeout ID to clear it if tab becomes visible again
        (window as any).hiddenTimeout = timeoutId;
      } else {
        // Tab is visible again, clear timeout and update activity
        if ((window as any).hiddenTimeout) {
          clearTimeout((window as any).hiddenTimeout);
          delete (window as any).hiddenTimeout;
        }
        updateActivity();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ((window as any).hiddenTimeout) {
        clearTimeout((window as any).hiddenTimeout);
        delete (window as any).hiddenTimeout;
      }
    };
  }, [isAdmin, logout, updateActivity, navigate]);

  // Track user activity
  useEffect(() => {
    if (!isAdmin) return;

    const handleActivity = () => {
      updateActivity();
      setShowWarning(false);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAdmin, updateActivity]);

  // Session timeout check and time display
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      if (isSessionExpired()) {
        alert('Sua sessão expirou por inatividade. Você será redirecionado para a página de login.');
        logout();
        navigate('/admin/login');
        return;
      }

      const remaining = getTimeRemaining();
      
      // Show warning when 15 minutes remaining
      if (remaining <= 15 * 60 * 1000 && remaining > 0 && !showWarning) {
        setShowWarning(true);
      }

      // Format time remaining
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      if (remaining <= 0) {
        setTimeRemaining('Expirado');
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAdmin, isSessionExpired, getTimeRemaining, showWarning, logout, navigate]);

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair do painel administrativo?')) {
      await logout();
      navigate('/admin/login');
    }
  };

  const handleExtendSession = () => {
    updateActivity();
    setShowWarning(false);
  };

  const getSessionDuration = () => {
    if (!loginTime) return '0m';
    const duration = Date.now() - loginTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = () => {
    const remaining = getTimeRemaining();
    if (remaining <= 15 * 60 * 1000) return 'bg-warning'; // 15 minutes or less
    if (remaining <= 30 * 60 * 1000) return 'bg-yellow-500'; // 30 minutes or less
    return 'bg-success';
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Session Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-warning/10 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-lg font-bold dark:text-white">Sessão Expirando</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Sua sessão expirará em breve por inatividade. Deseja continuar logado?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleExtendSession}
                className="btn btn-primary flex-1"
              >
                Continuar Logado
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-outline flex-1"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Admin Panel */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[200px]">
          {/* Header - Always visible */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </div>
          </div>

          {/* Expanded content */}
          <div className={`transition-all duration-300 overflow-hidden ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              {/* User info */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Logado como:</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={adminEmail}>
                  {adminEmail}
                </p>
              </div>

              {/* Session info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Sessão expira em:</span>
                  <span className={`text-xs font-medium ${
                    getTimeRemaining() <= 15 * 60 * 1000 
                      ? 'text-warning' 
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {timeRemaining}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Logado há:</span>
                  <span className="text-xs text-slate-900 dark:text-white">
                    {getSessionDuration()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsExpanded(false);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 bg-accent/10 text-accent hover:bg-accent/20 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  <Settings className="h-3 w-3" />
                  <span>Painel</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center space-x-1 bg-error/10 text-error hover:bg-error/20 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminMiniPanel;