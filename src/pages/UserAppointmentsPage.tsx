import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, Phone, Scissors, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Appointment {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  service_name: string;
  service_price: number;
  barber_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

const barberNames: { [key: number]: string } = {
  1: 'PW Barber',
  2: 'Nilde Santos',
  3: 'Regis Barber',
  4: 'Ruan C. Barber',
};

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const UserAppointmentsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Meus Agendamentos | BIG MAN Barber Shopp';
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user?.email]); // Só recarregar se o email do usuário mudar

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      setLoadingAppointments(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_email', user.email)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      // Verificar se os agendamentos pertencem realmente ao usuário
      const userAppointments = data?.filter(appointment => 
        appointment.user_email === user.email
      ) || [];
      
      setAppointments(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar agendamentos:', error);
      setError(`Erro ao carregar agendamentos: ${error.message}`);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatAppointmentTime = (timeString: string) => {
    try {
      if (timeString && timeString.length > 5) {
        return timeString.substring(0, 5);
      }
      return timeString;
    } catch (error) {
      return timeString;
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
            <h1 className="heading-lg dark:text-white mb-2">Meus Agendamentos</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Acompanhe todos os seus agendamentos na BIG MAN Barber
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {loadingAppointments ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="dark:text-white">Carregando agendamentos...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Você ainda não fez nenhum agendamento conosco.
              </p>
              <button
                onClick={() => navigate('/agendar')}
                className="btn btn-primary"
              >
                Fazer Agendamento
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                      <div className="bg-accent/10 p-2 rounded-full">
                        <Scissors className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg dark:text-white">
                          {appointment.service_name || 'Serviço não especificado'}
                        </h3>
                        {appointment.service_price && (
                          <p className="text-accent font-medium">
                            R$ {appointment.service_price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColors[appointment.status]}`}>
                      {statusLabels[appointment.status]}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Data</p>
                        <p className="font-medium dark:text-white">
                          {formatAppointmentDate(appointment.appointment_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Horário</p>
                        <p className="font-medium dark:text-white">
                          {formatAppointmentTime(appointment.appointment_time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Profissional</p>
                        <p className="font-medium dark:text-white">
                          {barberNames[appointment.barber_id] || 'Não especificado'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Unidade</p>
                        <p className="font-medium dark:text-white">BIG MAN Barber</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Agendado em: {format(parseISO(appointment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>

                  {appointment.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>Aguardando confirmação:</strong> Seu agendamento está pendente de confirmação. 
                        Você receberá uma notificação assim que for aprovado.
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

export default UserAppointmentsPage;