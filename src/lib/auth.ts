import { create } from 'zustand';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  profile?: {
    name: string;
    phone: string;
  };
  role?: 'client' | 'admin';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  lastCheck: number;
  currentRole: 'client' | 'admin' | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (profile: any) => void;
  signIn: (email: string, password: string, role?: 'client' | 'admin') => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ data: any; error: any }>;
  isAdminLoggedIn: () => boolean;
  isClientLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  lastCheck: 0,
  currentRole: null,

  login: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      loading: false,
      lastCheck: Date.now(),
      currentRole: user.role || null
    });
  },

  signIn: async (email: string, password: string, role?: 'client' | 'admin') => {
    try {
      const currentState = get();
      const targetRole = role || 'client';

      // Check if user is already logged in with a different role
      if (currentState.isAuthenticated && currentState.currentRole && currentState.currentRole !== targetRole) {
        return {
          data: null,
          error: new Error(`Você está logado como ${currentState.currentRole}. Faça logout primeiro para acessar como ${targetRole}.`)
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error };
      }

      if (data.user) {
        const isAdmin = targetRole === 'admin';

        if (isAdmin) {
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!adminUser) {
            await supabase.auth.signOut();
            return {
              data: null,
              error: new Error('Este usuário não tem acesso administrativo.')
            };
          }
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          profile: targetRole === 'admin' ? undefined : {
            name: data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
          },
          role: targetRole
        };

        // Save role to localStorage for persistence
        localStorage.setItem('auth_role', targetRole);

        set({
          user,
          isAuthenticated: true,
          loading: false,
          lastCheck: Date.now(),
          currentRole: targetRole
        });
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  signUp: async (email: string, password: string, name: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone: phone || '',
          }
        }
      });

      if (error) {
        return { data: null, error };
      }

      if (data.user) {
        // Create or update user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            name: name,
            email: data.user.email,
            phone: phone || '',
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          profile: {
            name: name,
            phone: phone || '',
          },
          role: 'client'
        };

        // Save role to localStorage
        localStorage.setItem('auth_role', 'client');

        set({
          user,
          isAuthenticated: true,
          loading: false,
          lastCheck: Date.now(),
          currentRole: 'client'
        });
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear role from localStorage
      localStorage.removeItem('auth_role');

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        lastCheck: 0,
        currentRole: null
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  checkAuth: async () => {
    const currentState = get();
    const now = Date.now();

    // Evitar verificações muito frequentes (menos de 30 segundos)
    if (currentState.lastCheck && (now - currentState.lastCheck) < 30000) {
      return;
    }

    // Se já está carregando, não fazer nova verificação
    if (currentState.loading) {
      return;
    }

    set({ loading: true });
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // Handle refresh token errors
      if (sessionError && sessionError.message?.includes('refresh_token_not_found')) {
        console.log('🔄 Clearing invalid session due to refresh token error');
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          lastCheck: now,
          currentRole: null
        });
        return;
      }

      if (session?.user) {
        // Get role from localStorage or fallback to current role
        const savedRole = localStorage.getItem('auth_role') as 'client' | 'admin' | null;
        const role = savedRole || currentState.currentRole || 'client';

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          profile: profile || {
            name: session.user.user_metadata?.name || '',
            phone: session.user.user_metadata?.phone || '',
          },
          role: role
        };

        set({
          user,
          isAuthenticated: true,
          loading: false,
          lastCheck: now,
          currentRole: role
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          lastCheck: now,
          currentRole: null
        });
      }
    } catch (error) {
      console.error('Erro na verificação de auth:', error);

      // If it's a refresh token error, clear the session
      if (error instanceof Error && error.message?.includes('refresh_token_not_found')) {
        console.log('🔄 Clearing session due to refresh token error');
        await supabase.auth.signOut();
      }

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        lastCheck: now,
        currentRole: null
      });
    }
  },

  updateProfile: (profile: any) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          profile: { ...currentUser.profile, ...profile }
        }
      });
    }
  },

  isAdminLoggedIn: () => {
    const state = get();
    return state.isAuthenticated && state.currentRole === 'admin';
  },

  isClientLoggedIn: () => {
    const state = get();
    return state.isAuthenticated && state.currentRole === 'client';
  },
}));

// Variável para controlar o listener
let authListenerActive = false;

// Listen for auth changes
if (!authListenerActive) {
  authListenerActive = true;
  supabase.auth.onAuthStateChange((event, session) => {
    const currentState = useAuthStore.getState();

    if (event === 'SIGNED_IN' && session) {
      (async () => {
        await currentState.checkAuth();
      })();
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        lastCheck: 0,
        currentRole: null
      });
    }
  });
}