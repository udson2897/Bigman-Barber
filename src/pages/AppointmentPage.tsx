import { useEffect, useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Check, Scissors, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth';
import { useBarberStore } from '../lib/store';

const services = [
  { id: 1, name: 'Corte só máquina', price: 18.00},
  { id: 2, name: 'Corte só tesoura', price: 35.00},
  { id: 3, name: 'Corte degradê "simples"', price: 35.00},
  { id: 4, name: 'Corte degradê navalhado', price: 40.00},
  { id: 5, name: 'Corte social', price: 30.00},
  { id: 6, name: 'Barba', price: 25.00},
  { id: 7, name: 'Sobrancelha navalha', price: 15.00},
  { id: 8, name: 'Sobrancelha pinça', price: 20.00},
  { id: 9, name: 'Sobrancelha feminina', price: 20.00},
  { id: 10, name: 'Listra simples', price: 2.00},
  { id: 11, name: 'Freestyle "a partir de"', price: 5.00},
  { id: 12, name: 'Pezinho', price: 8.00},
  { id: 13, name: 'Bigode', price: 8.00},
  { id: 14, name: 'Cavanhaque', price: 15.00},
  { id: 15, name: 'Barba express "toda na máquina"', price: 15.00},
  { id: 16, name: 'Finalização', price: 15.00},
  { id: 17, name: 'Pigmentação pezinho', price: 10.00},
  { id: 18, name: 'Pigmentação metade barba', price: 12.00},
  { id: 19, name: 'Pigmentação barba', price: 20.00},
  { id: 20, name: 'Pigmentação cabelo', price: 30.00},
  { id: 21, name: 'Pigmentação sobrancela', price: 20.00},
  { id: 22, name: 'Relaxamento', price: 30.00},
  { id: 23, name: 'Progressiva', price: 35.00},
  { id: 24, name: 'Luzes', price: 100.00},
  { id: 25, name: 'Platinado', price: 100.00},
];

const locations = [
  { id: 1, name: 'BIG MAN Barber Shopp', address: 'QR 117 Conjunto A , 03 - 72547401 Santa Maria - Brasília/DF' },
];

const allTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

const AppointmentPage = () => {
  useEffect(() => {
    document.title = 'Agendar | BIG MAN Barber Shopp';
  }, []);

  const { user, isAuthenticated } = useAuthStore();
  const { barbers, fetchBarbers } = useBarberStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill user data when user is authenticated
  useEffect(() => {
    // Fetch barbers
    fetchBarbers();
    
    if (isAuthenticated && user) {
      console.log('🔄 Auto-filling user data:', user);
      setFormData({
        name: user.profile?.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: user.profile?.phone || user.user_metadata?.phone || '',
      });
    }
  }, [isAuthenticated, user]);

  // Fetch available time slots when barber and date are selected
  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableTimeSlots(allTimeSlots); // Show all slots if no barber/date selected
      setSelectedTime(null);
    }
  }, [selectedBarber, selectedDate]);

  const isTimeSlotAvailable = (timeSlot: string, selectedDate: Date): boolean => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const appointmentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    // If appointment is for today, check if time has passed
    if (appointmentDate.getTime() === today.getTime()) {
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = hours * 60 + minutes; // Slot time in minutes
      
      // Add 30 minutes buffer - can't book slots that start in less than 30 minutes
      return slotTime > (currentTime + 30);
    }
    
    // For future dates, all slots are potentially available (subject to existing bookings)
    return appointmentDate > today;
  };

  const fetchAvailableSlots = async () => {
    if (!selectedBarber || !selectedDate) return;

    setLoadingSlots(true);
    setError(null);
    
    try {
      // Format date as YYYY-MM-DD for database query
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const now = new Date();
      
      console.log('🔍 Fetching slots for:');
      console.log('- Barber ID:', selectedBarber);
      console.log('- Selected Date Object:', selectedDate);
      console.log('- Formatted Date String:', dateString);
      console.log('- Current time:', format(now, 'HH:mm'));

      // Get all existing appointments for this barber on this date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('appointment_time, status, user_name, appointment_date')
        .eq('barber_id', selectedBarber)
        .eq('appointment_date', dateString)
        .in('status', ['pending', 'confirmed']); // Only consider active appointments

      if (error) {
        console.error('❌ Error fetching appointments:', error);
        throw error;
      }

      console.log('📋 Existing appointments found:', existingAppointments);

      // Extract booked times and normalize format
      const bookedTimes = existingAppointments?.map(apt => {
        // Normalize time format to HH:MM (remove seconds if present)
        let time = apt.appointment_time;
        if (time && time.length > 5) {
          time = time.substring(0, 5); // Keep only HH:MM part
        }
        console.log(`⏰ Booked time: ${time} (Status: ${apt.status}, Client: ${apt.user_name}, Date: ${apt.appointment_date})`);
        return time;
      }) || [];
      
      console.log('🚫 All booked times (normalized):', bookedTimes);

      // Filter slots based on current time and existing bookings
      const availableSlots = allTimeSlots.filter(time => {
        // Check if time slot is already booked
        const isBooked = bookedTimes.includes(time);
        if (isBooked) {
          console.log(`❌ Time ${time} is NOT available (already booked)`);
          return false;
        }

        // Check if time slot is in the past (for today's appointments)
        const isTimeAvailable = isTimeSlotAvailable(time, selectedDate);
        if (!isTimeAvailable) {
          console.log(`❌ Time ${time} is NOT available (time has passed or too soon)`);
          return false;
        }

        console.log(`✅ Time ${time} is available`);
        return true;
      });
      
      console.log('✨ Final available slots:', availableSlots);
      console.log(`📊 Total slots: ${allTimeSlots.length}, Booked: ${bookedTimes.length}, Past/Too Soon: ${allTimeSlots.length - availableSlots.length - bookedTimes.length}, Available: ${availableSlots.length}`);

      setAvailableTimeSlots(availableSlots);

      // Reset selected time if it's no longer available
      if (selectedTime && !availableSlots.includes(selectedTime)) {
        console.log(`⚠️ Previously selected time ${selectedTime} is no longer available, resetting...`);
        setSelectedTime(null);
      }

    } catch (error) {
      console.error('💥 Error fetching available slots:', error);
      setError('Erro ao carregar horários disponíveis. Tente novamente.');
      setAvailableTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      const selectedBarberData = barbers.find(b => b.id === selectedBarber);
      const selectedLocationData = locations.find(l => l.id === selectedLocation);

      if (!selectedServiceData || !selectedBarberData || !selectedLocationData || !selectedDate || !selectedTime) {
        throw new Error('Missing required appointment information');
      }

      // Format date as YYYY-MM-DD for database storage
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Get user session for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();

      const appointmentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceId: selectedService,
        serviceName: selectedServiceData.name,
        servicePrice: selectedServiceData.price, // Send as number
        barberId: selectedBarber,
        barberName: selectedBarberData.name,
        locationId: selectedLocation,
        locationName: selectedLocationData.name,
        date: formattedDate, // Use formatted date
        time: selectedTime
      };

      console.log('📤 Submitting appointment with data:', {
        ...appointmentData,
        selectedDateObject: selectedDate,
        formattedDate: formattedDate
      });

      // Prepare headers with authentication if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('🔐 Using authenticated session for appointment');
      } else {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
        console.log('👤 Using anonymous access for appointment');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-appointment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: appointmentData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      console.log('✅ Appointment created successfully');
      setIsComplete(true);
    } catch (err) {
      console.error('💥 Appointment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleServiceSelect = (id: number) => {
    setSelectedService(id);
  };

  const handleBarberSelect = (id: number) => {
    setSelectedBarber(id);
    // Reset time selection when barber changes
    setSelectedTime(null);
    console.log('👤 Barber selected:', id, '- Time selection reset');
  };

  const handleLocationSelect = (id: number) => {
    setSelectedLocation(id);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Reset time selection when date changes
    setSelectedTime(null);
    console.log('📅 Date selected:', {
      dateObject: date,
      formattedForDisplay: format(date, 'dd/MM/yyyy'),
      formattedForDatabase: format(date, 'yyyy-MM-dd')
    }, '- Time selection reset');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    console.log('⏰ Time selected:', time);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const monthName = format(currentMonth, 'MMMM', { locale: ptBR });
    
    const calendar = [];
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const isToday = dateOnly.getTime() === todayDateOnly.getTime();
      const isPast = dateOnly < todayDateOnly;
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
      calendar.push(
        <button
          key={`day-${day}`}
          onClick={() => handleDateSelect(date)}
          disabled={isPast}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
            isSelected 
              ? 'bg-accent text-white shadow-md' 
              : isToday 
                ? 'bg-accent/20 text-accent font-bold' 
                : isPast 
                  ? 'text-slate-400 cursor-not-allowed' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-sm'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg capitalize">{monthName} {year}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {calendar}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
          alt="Agendar" 
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="container-custom relative z-20 text-white">
          <h1 className="heading-xl mb-6">Agende seu Horário</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Marque seu horário de forma rápida e fácil. Escolha o serviço, o profissional e o dia que melhor se encaixa na sua agenda.
          </p>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="section bg-white dark:bg-slate-800">
        <div className="container-custom">
          {!isComplete ? (
            <div className="max-w-3xl mx-auto">
              {/* Progress Steps */}
              <div className="flex justify-between mb-12">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        currentStep >= step 
                          ? 'bg-accent text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step}
                    </div>
                    <span 
                      className={`text-sm ${
                        currentStep >= step 
                          ? 'text-accent font-medium' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step === 1 ? 'Serviço' : 
                       step === 2 ? 'Profissional' : 
                       step === 3 ? 'Data e Hora' : 
                       'Confirmação'}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Step 1: Choose Service */}
              {currentStep === 1 && (
                <div>
                  <h2 className="heading-md mb-8">Escolha o Serviço</h2>
                  
                  <div className="space-y-4 mb-8">
                    {services.map((service) => (
                      <div 
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedService === service.id 
                            ? 'border-accent bg-accent/5' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-accent'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-lg">{service.name}</h3>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-accent">R$ {service.price.toFixed(2)}</span>
                            <div 
                              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                selectedService === service.id 
                                  ? 'border-accent bg-accent text-white' 
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {selectedService === service.id && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={nextStep}
                      disabled={!selectedService}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Barber and Location */}
              {currentStep === 2 && (
                <div>
                  <h2 className="heading-md mb-8">Escolha o Profissional e a Unidade</h2>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Profissional</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {barbers.filter(b => b.is_active).map((barber) => (
                        <div 
                          key={barber.id}
                          onClick={() => handleBarberSelect(barber.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center space-x-4 ${
                            selectedBarber === barber.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-accent'
                          }`}
                        >
                          <img 
                            src={barber.image_url || '/default-barber.jpg'}
                            alt={barber.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{barber.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Bancada {barber.workstation_number}
                            </p>
                          </div>
                          <div 
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                              selectedBarber === barber.id 
                                ? 'border-accent bg-accent text-white' 
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {selectedBarber === barber.id && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Unidade</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {locations.map((location) => (
                        <div 
                          key={location.id}
                          onClick={() => handleLocationSelect(location.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedLocation === location.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-accent'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{location.name}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {location.address}
                              </p>
                            </div>
                            <div 
                              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                selectedLocation === location.id 
                                  ? 'border-accent bg-accent text-white' 
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {selectedLocation === location.id && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button 
                      onClick={prevStep}
                      className="btn btn-outline"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={!selectedBarber || !selectedLocation}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Choose Date and Time */}
              {currentStep === 3 && (
                <div>
                  <h2 className="heading-md mb-8">Escolha a Data e Horário</h2>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Data</h3>
                    {renderCalendar()}
                  </div>
                  
                  {selectedDate && (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-4">
                        Horários Disponíveis
                        {selectedBarber && (
                          <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                            para {barbers.find(b => b.id === selectedBarber)?.name} em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                          </span>
                        )}
                      </h3>
                      
                      {/* Current time info for today's appointments */}
                      {selectedDate.toDateString() === new Date().toDateString() && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            ⏰ Horário atual: {format(new Date(), 'HH:mm')} - Só é possível agendar horários com pelo menos 30 minutos de antecedência
                          </p>
                        </div>
                      )}
                      
                      {loadingSlots ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                          <p className="text-slate-500 dark:text-slate-400">
                            Verificando horários disponíveis...
                          </p>
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
                            Não há horários disponíveis
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {selectedDate.toDateString() === new Date().toDateString() 
                              ? `Todos os horários para hoje já passaram ou estão ocupados.`
                              : `Todos os horários para ${barbers.find(b => b.id === selectedBarber)?.name} em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} já estão ocupados.`
                            }
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Tente escolher outra data ou outro profissional.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-300">
                              ✅ {availableTimeSlots.length} horários disponíveis encontrados
                            </p>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {availableTimeSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`p-3 border rounded-lg text-center transition-all font-medium ${
                                  selectedTime === time 
                                    ? 'border-accent bg-accent text-white shadow-md' 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-accent hover:bg-accent/10 hover:shadow-sm'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button 
                      onClick={prevStep}
                      className="btn btn-outline"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={!selectedDate || !selectedTime}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div>
                  <h2 className="heading-md mb-8">Confirme seu Agendamento</h2>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg mb-8">
                    <h3 className="font-bold text-lg mb-4">Resumo do Agendamento</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Scissors className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Serviço</p>
                          <p className="font-medium">
                            {services.find(s => s.id === selectedService)?.name}
                            {' - '}
                            R$ {services.find(s => s.id === selectedService)?.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Profissional</p>
                          <p className="font-medium">
                            {barbers.find(b => b.id === selectedBarber)?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Data e Hora Escolhida</p>
                          <p className="font-medium text-lg text-accent">
                            {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Unidade</p>
                          <p className="font-medium">
                            {locations.find(l => l.id === selectedLocation)?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* User Data Display */}
                  {isAuthenticated && user && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        ✅ Dados preenchidos automaticamente do seu perfil:
                      </h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <p><strong>Nome:</strong> {formData.name}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Telefone:</strong> {formData.phone}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Seus Dados</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          Nome completo {isAuthenticated ? '(preenchido automaticamente)' : ''}
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={isAuthenticated && !!formData.name}
                          required
                          className={`w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-accent ${
                            isAuthenticated && formData.name 
                              ? 'bg-slate-100 dark:bg-slate-600 cursor-not-allowed' 
                              : 'bg-white dark:bg-slate-800'
                          }`}
                        />
                        {isAuthenticated && formData.name && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Dados do seu perfil. Para alterar, acesse "Meu Perfil".
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                          Telefone {isAuthenticated ? '(preenchido automaticamente)' : ''}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isAuthenticated && !!formData.phone}
                          required
                          className={`w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-accent ${
                            isAuthenticated && formData.phone 
                              ? 'bg-slate-100 dark:bg-slate-600 cursor-not-allowed' 
                              : 'bg-white dark:bg-slate-800'
                          }`}
                        />
                        {isAuthenticated && formData.phone && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Dados do seu perfil. Para alterar, acesse "Meu Perfil".
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                          E-mail {isAuthenticated ? '(preenchido automaticamente)' : ''}
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={isAuthenticated && !!formData.email}
                          required
                          className={`w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-accent ${
                            isAuthenticated && formData.email 
                              ? 'bg-slate-100 dark:bg-slate-600 cursor-not-allowed' 
                              : 'bg-white dark:bg-slate-800'
                          }`}
                        />
                        {isAuthenticated && formData.email && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Email da sua conta. Não pode ser alterado.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!isAuthenticated && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          💡 <strong>Dica:</strong> Crie uma conta para agendar mais rapidamente nas próximas vezes. Seus dados serão salvos automaticamente!
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between mt-8">
                      <button 
                        type="button"
                        onClick={prevStep}
                        className="btn btn-outline"
                      >
                        Voltar
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting || !formData.name || !formData.phone || !formData.email}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="heading-lg mb-4">Agendamento Realizado!</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                Seu horário foi marcado e está <strong>PENDENTE de confirmação</strong>. Você receberá uma confirmação por WhatsApp e e-mail assim que for aprovado pelo nosso time.
              </p>
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg mb-8 max-w-md mx-auto">
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <Scissors className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Serviço</p>
                      <p className="font-medium">
                        {services.find(s => s.id === selectedService)?.name} - R$ {services.find(s => s.id === selectedService)?.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Profissional</p>
                      <p className="font-medium">
                        {barbers.find(b => b.id === selectedBarber)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Data e Hora Escolhida</p>
                      <p className="font-bold text-lg text-accent">
                        {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Unidade</p>
                      <p className="font-medium">
                        {locations.find(l => l.id === selectedLocation)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg mt-4">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Status: PENDENTE - Aguardando confirmação
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AppointmentPage;