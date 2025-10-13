import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Calendar, Clock, MapPin, User, Phone, Package, MessageCircle, Scissors } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminStore, useProductStore } from '../../lib/store';
import { useNavigate } from 'react-router-dom';
import { ProductManagement } from '../../components/admin/ProductManagement';
import { FinancialDashboard } from '../../components/admin/FinancialDashboard';
import { BarberManagement } from '../../components/admin/BarberManagement';

interface Appointment {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  service_id: number;
  service_name: string;
  service_price: number;
  barber_id: number;
  appointment_date: string;
  appointment_time: string;
  location_id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

// Barber names mapping
const barberNames: { [key: number]: string } = {
  1: 'PW Barber',
  2: 'Nilde Santos',
  3: 'Regis Barber',
  4: 'Ruan C. Barber',
};

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, checkAdminStatus, updateActivity } = useAdminStore();
  const { fetchProducts } = useProductStore();
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Check admin status and update activity
  useEffect(() => {
    checkAdminStatus();
    updateActivity();
  }, [checkAdminStatus, updateActivity]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
      fetchProducts();
    }
  }, [isAdmin, fetchProducts]);

  const fetchAppointments = async () => {
    try {
      console.log('🔍 Fetching appointments from database...');
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('❌ Error fetching appointments:', error);
        throw error;
      }
      
      console.log('✅ Fetched appointments:', data?.length || 0, 'appointments');
      
      // Log each appointment to debug date issues
      data?.forEach((appointment, index) => {
        console.log(`📅 Appointment ${index + 1}:`, {
          id: appointment.id,
          client: appointment.user_name,
          originalDate: appointment.appointment_date,
          originalTime: appointment.appointment_time,
          status: appointment.status,
          createdAt: appointment.created_at
        });
      });
      
      setAppointments(data || []);
    } catch (error) {
      console.error('💥 Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppNotification = async (phone: string, message: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, message, type: 'appointment_update' }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.whatsappUrl) {
          // Open WhatsApp with pre-filled message
          window.open(result.whatsappUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      console.log(`🔄 Updating appointment ${id} to status: ${status}`);
      
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating appointment status:', error);
        throw error;
      }

      const appointment = appointments.find(apt => apt.id === id);
      if (appointment) {
        let message = '';
        
        // Format the date properly for WhatsApp message
        const appointmentDate = new Date(appointment.appointment_date + 'T00:00:00');
        const formattedDate = format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
        
        switch (status) {
          case 'confirmed':
            message = `🎉 Seu agendamento foi CONFIRMADO!\n\n` +
                     `📅 Data: ${formattedDate}\n` +
                     `⏰ Horário: ${appointment.appointment_time}\n` +
                     `✂️ Serviço: ${appointment.service_name || 'Serviço não especificado'}\n` +
                     `👤 Profissional: ${barberNames[appointment.barber_id] || 'Profissional não especificado'}\n` +
                     `💰 Valor: R$ ${appointment.service_price ? appointment.service_price.toFixed(2) : 'Valor não especificado'}\n\n` +
                     `Aguardamos você na BIG MAN Barber! 💪`;
            break;
          case 'cancelled':
            message = `❌ Seu agendamento foi CANCELADO.\n\n` +
                     `Se desejar reagendar, entre em contato conosco.\n\n` +
                     `BIG MAN Barber - Sempre à disposição! 💪`;
            break;
        }

        if (message) {
          await sendWhatsAppNotification(appointment.user_phone, message);
        }
      }

      await fetchAppointments();
      console.log('✅ Appointment status updated successfully');
    } catch (error) {
      console.error('💥 Error updating appointment:', error);
    }
  };

  const updateAppointmentDateTime = async (id: string) => {
    try {
      console.log(`🔄 Updating appointment ${id} date/time to: ${newDate} ${newTime}`);
      
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          appointment_time: newTime
        })
        .eq('id', id);

      if (error) throw error;

      const appointment = appointments.find(apt => apt.id === id);
      if (appointment) {
        // Format the new date properly for WhatsApp message
        const appointmentDate = new Date(newDate + 'T00:00:00');
        const formattedDate = format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
        
        const message = `📅 Seu agendamento foi ALTERADO!\n\n` +
                       `🆕 Nova data: ${formattedDate}\n` +
                       `🆕 Novo horário: ${newTime}\n` +
                       `✂️ Serviço: ${appointment.service_name || 'Serviço não especificado'}\n` +
                       `👤 Profissional: ${barberNames[appointment.barber_id] || 'Profissional não especificado'}\n` +
                       `💰 Valor: R$ ${appointment.service_price ? appointment.service_price.toFixed(2) : 'Valor não especificado'}\n\n` +
                       `Aguardamos você na BIG MAN Barber! 💪`;

        await sendWhatsAppNotification(appointment.user_phone, message);
      }

      setEditingAppointment(null);
      await fetchAppointments();
      console.log('✅ Appointment date/time updated successfully');
    } catch (error) {
      console.error('💥 Error updating appointment:', error);
    }
  };

  // Helper function to safely format dates
  const formatAppointmentDate = (dateString: string) => {
    try {
      // Handle different date formats
      let date: Date;
      
      if (dateString.includes('T')) {
        // ISO format with time
        date = parseISO(dateString);
      } else {
        // Date only format (YYYY-MM-DD)
        date = new Date(dateString + 'T00:00:00');
      }
      
      console.log(`📅 Formatting date: ${dateString} -> ${date.toISOString()}`);
      
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error('❌ Error formatting date:', dateString, error);
      return dateString; // Return original if formatting fails
    }
  };

  // Helper function to format time
  const formatAppointmentTime = (timeString: string) => {
    try {
      // Remove seconds if present (HH:MM:SS -> HH:MM)
      if (timeString && timeString.length > 5) {
        return timeString.substring(0, 5);
      }
      return timeString;
    } catch (error) {
      console.error('❌ Error formatting time:', timeString, error);
      return timeString;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="heading-lg text-error mb-4">Acesso Negado</h1>
            <p className="text-slate-600 dark:text-white">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pt-20 lg:pt-16 gap-4">
          <h1 className="heading-lg dark:text-white">Painel Administrativo</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-accent'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${
              activeTab === 'appointments' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-accent'
            }`}
          >
            Agendamentos
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'products' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-accent'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Produtos</span>
          </button>
          <button 
            onClick={() => setActiveTab('barbers')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'barbers' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-accent'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Barbeiros</span>
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && <FinancialDashboard />}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="dark:text-white">Carregando agendamentos...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                  <div key={status} className="card p-6">
                    <h2 className="heading-md mb-6 capitalize dark:text-white">
                      {status === 'pending' && 'Agendamentos Pendentes'}
                      {status === 'confirmed' && 'Agendamentos Confirmados'}
                      {status === 'completed' && 'Agendamentos Concluídos'}
                      {status === 'cancelled' && 'Agendamentos Cancelados'}
                    </h2>

                    <div className="space-y-4">
                      {appointments
                        .filter((appointment) => appointment.status === status)
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6"
                          >
                            <div className="flex flex-wrap gap-6 mb-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Cliente</p>
                                  <p className="font-medium dark:text-white">{appointment.user_name}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Telefone</p>
                                  <p className="font-medium dark:text-white">{appointment.user_phone}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Data Escolhida</p>
                                  <p className="font-medium text-lg text-accent dark:text-accent">
                                    {formatAppointmentDate(appointment.appointment_date)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Horário Escolhido</p>
                                  <p className="font-medium text-lg text-accent dark:text-accent">
                                    {formatAppointmentTime(appointment.appointment_time)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Profissional</p>
                                  <p className="font-medium dark:text-white">
                                    {barberNames[appointment.barber_id] || 'Profissional não especificado'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Scissors className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Serviço</p>
                                  <p className="font-medium dark:text-white">
                                    {appointment.service_name ? (
                                      <>
                                        {appointment.service_name}
                                        {appointment.service_price && ` - R$ ${appointment.service_price.toFixed(2)}`}
                                      </>
                                    ) : (
                                      'Serviço não especificado'
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {editingAppointment === appointment.id ? (
                              <div className="mb-4 space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1 dark:text-white">Nova Data</label>
                                  <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 dark:text-white">Novo Horário</label>
                                  <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateAppointmentDateTime(appointment.id)}
                                    className="btn btn-primary py-2 flex items-center space-x-2"
                                  >
                                    <span>Salvar e Notificar</span>
                                    <MessageCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAppointment(null)}
                                    className="btn btn-outline py-2"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                      className="btn btn-primary py-2 flex items-center space-x-2"
                                    >
                                      <Check className="h-4 w-4" />
                                      <span>Confirmar</span>
                                      <MessageCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                      className="btn btn-outline py-2 text-error border-error hover:bg-error/10 flex items-center space-x-2"
                                    >
                                      <X className="h-4 w-4" />
                                      <span>Cancelar</span>
                                      <MessageCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingAppointment(appointment.id);
                                        setNewDate(appointment.appointment_date);
                                        setNewTime(formatAppointmentTime(appointment.appointment_time));
                                      }}
                                      className="btn btn-outline py-2"
                                    >
                                      Alterar Horário
                                    </button>
                                  </>
                                )}

                                {status === 'confirmed' && (
                                  <>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                      className="btn btn-primary py-2"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Marcar como Concluído
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                      className="btn btn-outline py-2 text-error border-error hover:bg-error/10 flex items-center space-x-2"
                                    >
                                      <X className="h-4 w-4" />
                                      <span>Cancelar</span>
                                      <MessageCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingAppointment(appointment.id);
                                        setNewDate(appointment.appointment_date);
                                        setNewTime(formatAppointmentTime(appointment.appointment_time));
                                      }}
                                      className="btn btn-outline py-2"
                                    >
                                      Alterar Horário
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                      {appointments.filter((appointment) => appointment.status === status).length === 0 && (
                        <p className="text-center text-slate-500 dark:text-white py-4">
                          Nenhum agendamento {status === 'pending' && 'pendente'}
                          {status === 'confirmed' && 'confirmado'}
                          {status === 'completed' && 'concluído'}
                          {status === 'cancelled' && 'cancelado'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && <ProductManagement />}

        {/* Barbers Tab */}
        {activeTab === 'barbers' && <BarberManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;