import { create } from 'zustand';
import { supabase } from './supabase';

interface Barber {
  id: number;
  name: string;
  image_url: string;
  workstation_number: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BarberState {
  barbers: Barber[];
  loading: boolean;
  error: string | null;
  fetchBarbers: () => Promise<void>;
  addBarber: (barber: Omit<Barber, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBarber: (id: number, updates: Partial<Barber>) => Promise<void>;
  deleteBarber: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useBarberStore = create<BarberState>((set, get) => ({
  barbers: [],
  loading: false,
  error: null,
  
  clearError: () => set({ error: null }),
  
  fetchBarbers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('workstation_number', { ascending: true });

      if (error) throw error;
      
      set({ barbers: data || [], loading: false });
    } catch (error: any) {
      set({ 
        error: `Erro ao carregar barbeiros: ${error.message}`,
        loading: false 
      });
    }
  },
  
  addBarber: async (barber) => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .insert([barber])
        .select()
        .single();

      if (error) throw error;
      
      await get().fetchBarbers();
    } catch (error: any) {
      set({ 
        error: `Erro ao adicionar barbeiro: ${error.message}`
      });
      throw error;
    }
  },
  
  updateBarber: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('barbers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchBarbers();
    } catch (error: any) {
      set({ 
        error: `Erro ao atualizar barbeiro: ${error.message}`
      });
      throw error;
    }
  },
  
  deleteBarber: async (id) => {
    try {
      const { error } = await supabase
        .from('barbers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchBarbers();
    } catch (error: any) {
      set({ 
        error: `Erro ao remover barbeiro: ${error.message}`
      });
    }
  },
}));

interface AdminState {
  isAdmin: boolean;
  adminEmail: string;
  loginTime: number;
  lastActivity: number;
  sessionTimeout: number;
  checkAdminStatus: () => Promise<void>;
  login: (email: string) => void;
  logout: () => Promise<void>;
  updateActivity: () => void;
  isSessionExpired: () => boolean;
  getTimeRemaining: () => number;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdmin: false,
  adminEmail: '',
  loginTime: 0,
  lastActivity: Date.now(),
  sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
  
  checkAdminStatus: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('email')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (adminUser) {
          const currentState = get();
          set({ 
            isAdmin: true, 
            adminEmail: adminUser.email,
            lastActivity: Date.now(),
            // Preserve login time if already set
            loginTime: currentState.loginTime || Date.now()
          });
        } else {
          set({ 
            isAdmin: false, 
            adminEmail: '',
            loginTime: 0
          });
        }
      } else {
        set({ 
          isAdmin: false, 
          adminEmail: '',
          loginTime: 0
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      set({ 
        isAdmin: false, 
        adminEmail: '',
        loginTime: 0
      });
    }
  },

  login: (email: string) => {
    const now = Date.now();
    set({ 
      isAdmin: true, 
      adminEmail: email,
      loginTime: now,
      lastActivity: now 
    });
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ 
        isAdmin: false, 
        adminEmail: '',
        loginTime: 0,
        lastActivity: Date.now() 
      });
    } catch (error) {
      console.error('Error logging out:', error);
      // Force logout even if there's an error
      set({ 
        isAdmin: false, 
        adminEmail: '',
        loginTime: 0,
        lastActivity: Date.now() 
      });
    }
  },

  isSessionExpired: () => {
    const { lastActivity, sessionTimeout } = get();
    const now = Date.now();
    return (now - lastActivity) > sessionTimeout;
  },

  getTimeRemaining: () => {
    const { lastActivity, sessionTimeout } = get();
    const now = Date.now();
    const elapsed = now - lastActivity;
    return Math.max(0, sessionTimeout - elapsed);
  },
}));

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  
  clearError: () => set({ error: null }),
  
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      console.log('🔍 Fetching products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Products fetched successfully:', data?.length || 0, 'products');
      set({ products: data || [], loading: false });
    } catch (error: any) {
      console.error('💥 Error fetching products:', error);
      set({ 
        error: `Erro ao carregar produtos: ${error.message || 'Erro desconhecido'}`,
        loading: false 
      });
    }
  },
  
  addProduct: async (product) => {
    try {
      console.log('📝 Adding new product:', product);
      
      // Validate required fields
      if (!product.name?.trim()) {
        throw new Error('Nome do produto é obrigatório');
      }
      if (!product.description?.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!product.price || product.price <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }
      if (product.stock === undefined || product.stock < 0) {
        throw new Error('Estoque deve ser um número válido');
      }
      if (!product.category?.trim()) {
        throw new Error('Categoria é obrigatória');
      }
      if (!product.image_url?.trim()) {
        throw new Error('URL da imagem é obrigatória');
      }

      // Prepare product data
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price),
        image_url: product.image_url.trim(),
        stock: Number(product.stock),
        category: product.category.trim(),
      };

      console.log('📤 Sending product data to Supabase:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw error;
      }

      console.log('✅ Product added successfully:', data);
      
      // Refresh products list
      await get().fetchProducts();
      
    } catch (error: any) {
      console.error('💥 Error adding product:', error);
      set({ 
        error: `Erro ao adicionar produto: ${error.message || 'Erro desconhecido'}`
      });
      throw error; // Re-throw to handle in component
    }
  },
  
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      console.log('🗑️ Deleting product:', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw error;
      }

      console.log('✅ Product deleted successfully');
      
      // Refresh products list
      await get().fetchProducts();
      
      set({ loading: false });
    } catch (error: any) {
      console.error('💥 Error deleting product:', error);
      set({ 
        error: `Erro ao excluir produto: ${error.message || 'Erro desconhecido'}`,
        loading: false 
      });
    }
  },
  
  updateProduct: async (id, updates) => {
    try {
      console.log('📝 Updating product:', id, updates);
      
      // Prepare update data
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.description !== undefined) updateData.description = updates.description.trim();
      if (updates.price !== undefined) updateData.price = Number(updates.price);
      if (updates.image_url !== undefined) updateData.image_url = updates.image_url.trim();
      if (updates.stock !== undefined) updateData.stock = Number(updates.stock);
      if (updates.category !== undefined) updateData.category = updates.category.trim();

      console.log('📤 Sending update data to Supabase:', updateData);

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Product updated successfully');
      
      // Refresh products list
      await get().fetchProducts();
      
    } catch (error: any) {
      console.error('💥 Error updating product:', error);
      set({ 
        error: `Erro ao atualizar produto: ${error.message || 'Erro desconhecido'}`
      });
      throw error; // Re-throw to handle in component
    }
  },
}));

interface AppointmentState {
  availableSlots: Array<{
    id: string;
    barber_id: number;
    date: string;
    time: string;
  }>;
  fetchAvailableSlots: (barberId: number, date: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  availableSlots: [],
  fetchAvailableSlots: async (barberId: number, date: string) => {
    const { data } = await supabase
      .from('available_slots')
      .select('*')
      .eq('barber_id', barberId)
      .eq('date', date)
      .eq('is_available', true);
    
    set({ availableSlots: data || [] });
  },
}));