import { create } from 'zustand';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  profile?: {
    name: string;
    phone: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  lastCheck: number;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (profile: any) => void;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ data: any; error: any }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  lastCheck: 0,

  login: (user: User) => {
    set({ 
      user, 
      isAuthenticated: true, 
      loading: false,
      lastCheck: Date.now()
    });
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error };
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          profile: profile || {
            name: data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
          }
        };

        set({ 
          user, 
          isAuthenticated: true, 
          loading: false,
          lastCheck: Date.now()
        });
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
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
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          profile: {
            name: name,
            phone: '',
          }
        };

        set({ 
          user, 
          isAuthenticated: true, 
          loading: false,
          lastCheck: Date.now()
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
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false,
        lastCheck: 0
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
          lastCheck: now
        });
        return;
      }
      
      if (session?.user) {
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
          }
        };

        set({ 
          user, 
          isAuthenticated: true, 
          loading: false,
          lastCheck: now
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false,
          lastCheck: now
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
        lastCheck: now
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
}));

// Variável para controlar o listener
let authListenerActive = false;

// Listen for auth changes
if (!authListenerActive) {
  authListenerActive = true;
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { checkAuth } = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session) {
      await checkAuth();
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ 
        user: null, 
        isAuthenticated: false, 
        loading: false,
        lastCheck: 0
      });
    }
  });
}