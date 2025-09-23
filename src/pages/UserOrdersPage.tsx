import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, AlertCircle, Calendar, MapPin, CreditCard, Truck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  delivery_address: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const UserOrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Meus Pedidos | BIG MAN Barber Shopp';
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user?.email]); // Só recarregar se o email do usuário mudar

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoadingOrders(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      setError(`Erro ao carregar pedidos: ${error.message}`);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container-custom">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="dark:text-white">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container-custom pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-lg dark:text-white mb-2">Meus Pedidos</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Acompanhe todos os seus pedidos da loja BIG MAN
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {loadingOrders ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="dark:text-white">Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Você ainda não fez nenhum pedido em nossa loja.
              </p>
              <button
                onClick={() => navigate('/loja')}
                className="btn btn-primary"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Ir para a Loja
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                      <div className="bg-accent/10 p-2 rounded-full">
                        <ShoppingBag className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg dark:text-white">
                          Pedido #{order.id.slice(-8)}
                        </h3>
                        <p className="text-accent font-medium">
                          R$ {order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Data do Pedido</p>
                        <p className="font-medium dark:text-white">
                          {format(parseISO(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pagamento</p>
                        <p className="font-medium dark:text-white">
                          {order.payment_method === 'pix' ? 'PIX' : 'Pagamento na entrega'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Entrega</p>
                        <p className="font-medium dark:text-white text-sm">
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="font-medium dark:text-white mb-3">Itens do Pedido:</h4>
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="dark:text-slate-300">
                            {item.product_name} x{item.quantity}
                          </span>
                          <span className="font-medium dark:text-white">
                            R$ {item.total_price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>Aguardando confirmação:</strong> Seu pedido está sendo processado. 
                        Você receberá atualizações via WhatsApp.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;