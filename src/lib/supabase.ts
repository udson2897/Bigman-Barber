import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration:');
console.log('- URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
console.log('- Anon Key:', supabaseAnonKey ? '✅ Configured' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: `${window.location.origin}/reset-password`
  },
});

// Handle refresh token errors by clearing invalid sessions
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    // Clear any stale data when signed out
    localStorage.removeItem('supabase.auth.token');
  }
});

// Test connection and permissions
supabase.from('products').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connection successful. Products count:', count);
    }
  });

// Test admin authentication
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('❌ Auth session error:', error);
  } else if (session) {
    console.log('✅ User authenticated:', session.user.email);
    
    // Test admin permissions
    supabase.from('admin_users').select('email').eq('id', session.user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Admin check failed:', error);
        } else if (data) {
          console.log('✅ Admin user confirmed:', data.email);
        } else {
          console.log('⚠️ User is not an admin');
        }
      });
  } else {
    console.log('ℹ️ No active session');
  }
});