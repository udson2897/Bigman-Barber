import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Package, Scissors, Users, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialData {
  totalRevenue: number;
  appointmentRevenue: number;
  productRevenue: number;
  totalAppointments: number;
  totalOrders: number;
  monthlyData: Array<{
    month: string;
    appointments: number;
    products: number;
    total: number;
  }>;
  barberRevenue: Array<{
    barberId: number;
    barberName: string;
    revenue: number;
    barberShare: number;
    adminShare: number;
    appointmentsCount: number;
    averageTicket: number;
  }>;
}

interface CommissionSettings {
  barber_percentage: number;
  admin_percentage: number;
}

export const FinancialDashboard = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    appointmentRevenue: 0,
    productRevenue: 0,
    totalAppointments: 0,
    totalOrders: 0,
    monthlyData: [],
    barberRevenue: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [commission, setCommission] = useState<CommissionSettings>({
    barber_percentage: 50,
    admin_percentage: 50,
  });
  const [showCommissionSettings, setShowCommissionSettings] = useState(false);
  const [tempBarberPercentage, setTempBarberPercentage] = useState(50);
  const [savingCommission, setSavingCommission] = useState(false);

  useEffect(() => {
    fetchFinancialData();
    fetchCommissionSettings();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate = now;

      switch (selectedPeriod) {
        case 'last3months':
          startDate = subMonths(now, 3);
          break;
        case 'last6months':
          startDate = subMonths(now, 6);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }

      console.log('📊 Fetching financial data:', {
        period: selectedPeriod,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Fetch appointments revenue
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('service_price, created_at, status, barber_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('status', ['confirmed', 'completed']);

      if (appointmentsError) throw appointmentsError;

      // Fetch all barbers to map names
      const { data: barbers, error: barbersError } = await supabase
        .from('barbers')
        .select('id, name');

      if (barbersError) throw barbersError;

      // Create a map of barber id to name
      const barberMap = new Map(barbers?.map(b => [b.id, b.name]) || []);

      console.log('✅ Data fetched:', {
        appointmentsCount: appointments?.length || 0,
        barbersCount: barbers?.length || 0,
        sampleAppointment: appointments?.[0],
      });

      // Fetch orders revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

      if (ordersError) throw ordersError;

      // Calculate totals
      const appointmentRevenue = appointments?.reduce((sum, apt) =>
        sum + (Number(apt.service_price) || 0), 0) || 0;

      const productRevenue = orders?.reduce((sum, order) =>
        sum + (order.total_amount || 0), 0) || 0;

      const totalRevenue = appointmentRevenue + productRevenue;

      console.log('💰 Revenue calculated:', {
        appointmentRevenue,
        productRevenue,
        totalRevenue,
        appointmentsCount: appointments?.length || 0,
        ordersCount: orders?.length || 0,
      });

      // Generate monthly data for charts
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));
        
        const monthAppointments = appointments?.filter(apt => {
          const aptDate = new Date(apt.created_at);
          return aptDate >= monthStart && aptDate <= monthEnd;
        }) || [];
        
        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= monthStart && orderDate <= monthEnd;
        }) || [];

        const monthAppointmentRevenue = monthAppointments.reduce((sum, apt) =>
          sum + (Number(apt.service_price) || 0), 0);
        
        const monthProductRevenue = monthOrders.reduce((sum, order) => 
          sum + (order.total_amount || 0), 0);

        monthlyData.push({
          month: format(monthStart, 'MMM', { locale: ptBR }),
          appointments: monthAppointmentRevenue,
          products: monthProductRevenue,
          total: monthAppointmentRevenue + monthProductRevenue,
        });
      }

      // Calculate barber revenue
      const barberRevenueMap = new Map<number, {
        barberName: string;
        revenue: number;
        appointmentsCount: number;
      }>();

      appointments?.forEach((apt: any) => {
        if (apt.barber_id) {
          const barberName = barberMap.get(apt.barber_id) || 'Barbeiro desconhecido';
          const existing = barberRevenueMap.get(apt.barber_id) || {
            barberName: barberName,
            revenue: 0,
            appointmentsCount: 0,
          };

          barberRevenueMap.set(apt.barber_id, {
            barberName: barberName,
            revenue: existing.revenue + (Number(apt.service_price) || 0),
            appointmentsCount: existing.appointmentsCount + 1,
          });
        }
      });

      const barberRevenue = Array.from(barberRevenueMap.entries())
        .map(([barberId, data]) => {
          const barberShare = (data.revenue * commission.barber_percentage) / 100;
          const adminShare = (data.revenue * commission.admin_percentage) / 100;
          return {
            barberId,
            barberName: data.barberName,
            revenue: data.revenue,
            barberShare,
            adminShare,
            appointmentsCount: data.appointmentsCount,
            averageTicket: data.appointmentsCount > 0 ? data.revenue / data.appointmentsCount : 0,
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      console.log('👨‍💼 Barber revenue calculated:', barberRevenue);

      setFinancialData({
        totalRevenue,
        appointmentRevenue,
        productRevenue,
        totalAppointments: appointments?.length || 0,
        totalOrders: orders?.length || 0,
        monthlyData,
        barberRevenue,
      });

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('barber_percentage, admin_percentage')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCommission({
          barber_percentage: Number(data.barber_percentage),
          admin_percentage: Number(data.admin_percentage),
        });
        setTempBarberPercentage(Number(data.barber_percentage));
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de comissão:', error);
    }
  };

  const saveCommissionSettings = async () => {
    setSavingCommission(true);
    try {
      const adminPercentage = 100 - tempBarberPercentage;

      const { error } = await supabase
        .from('commission_settings')
        .update({
          barber_percentage: tempBarberPercentage,
          admin_percentage: adminPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;

      setCommission({
        barber_percentage: tempBarberPercentage,
        admin_percentage: adminPercentage,
      });

      setShowCommissionSettings(false);
      fetchFinancialData();
    } catch (error) {
      console.error('Erro ao salvar configurações de comissão:', error);
      alert('Erro ao salvar configurações de comissão');
    } finally {
      setSavingCommission(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="dark:text-white">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector and Commission Settings */}
      <div className="flex justify-between items-center">
        <h2 className="heading-md dark:text-white">Relatório Financeiro</h2>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowCommissionSettings(!showCommissionSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition"
          >
            <Settings className="h-4 w-4" />
            Comissões
          </button>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 rounded-md p-2 bg-white dark:bg-slate-700 dark:text-white"
          >
            <option value="current">Mês Atual</option>
            <option value="last3months">Últimos 3 Meses</option>
            <option value="last6months">Últimos 6 Meses</option>
          </select>
        </div>
      </div>

      {/* Commission Settings Modal */}
      {showCommissionSettings && (
        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-lg border-2 border-accent">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Configurar Comissões</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Porcentagem do Barbeiro: {tempBarberPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={tempBarberPercentage}
                onChange={(e) => setTempBarberPercentage(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mt-2">
                <span>Barbeiro: {tempBarberPercentage}%</span>
                <span>Admin: {100 - tempBarberPercentage}%</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveCommissionSettings}
                disabled={savingCommission}
                className="flex-1 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition disabled:opacity-50"
              >
                {savingCommission ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setShowCommissionSettings(false);
                  setTempBarberPercentage(commission.barber_percentage);
                }}
                className="flex-1 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-md hover:bg-slate-400 dark:hover:bg-slate-500 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {financialData.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Serviços</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {financialData.appointmentRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {financialData.totalAppointments} agendamentos
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
              <Scissors className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Produtos</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {financialData.productRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {financialData.totalOrders} pedidos
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-orange-600">
                R$ {financialData.totalAppointments + financialData.totalOrders > 0 
                  ? (financialData.totalRevenue / (financialData.totalAppointments + financialData.totalOrders)).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-6 dark:text-white">Receita por Mês</h3>
        <div className="space-y-4">
          {financialData.monthlyData.map((month, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium dark:text-white capitalize">
                  {month.month}
                </span>
                <span className="text-sm font-bold dark:text-white">
                  R$ {month.total.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${month.total > 0 ? (month.appointments / month.total) * 100 : 0}%`
                    }}
                  ></div>
                  <div
                    className="bg-purple-500"
                    style={{
                      width: `${month.total > 0 ? (month.products / month.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Serviços: R$ {month.appointments.toFixed(2)}</span>
                <span>Produtos: R$ {month.products.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="dark:text-white">Serviços</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="dark:text-white">Produtos</span>
          </div>
        </div>
      </div>

      {/* Barber Revenue */}
      <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-accent" />
          Faturamento por Barbeiro
        </h3>

        {financialData.barberRevenue.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Nenhum dado disponível para o período selecionado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {financialData.barberRevenue.map((barber, index) => (
              <div
                key={barber.barberId}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg dark:text-white">
                      {index + 1}. {barber.barberName}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {barber.appointmentsCount} agendamento{barber.appointmentsCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {barber.revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ticket médio: R$ {barber.averageTicket.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Commission Split */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Barbeiro ({commission.barber_percentage}%)
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      R$ {barber.barberShare.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Admin ({commission.admin_percentage}%)
                    </p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      R$ {barber.adminShare.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress bar showing percentage of total revenue */}
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${financialData.appointmentRevenue > 0
                        ? (barber.revenue / financialData.appointmentRevenue) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {financialData.appointmentRevenue > 0
                    ? ((barber.revenue / financialData.appointmentRevenue) * 100).toFixed(1)
                    : 0}% do faturamento de serviços
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};