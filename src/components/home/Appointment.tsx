import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';

const Appointment = () => {
  return (
    <section className="section bg-white dark:bg-slate-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="heading-lg mb-6">Agende seu Horário</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Não perca tempo e garanta o seu horário com nossos profissionais. Agendamento rápido e fácil, com confirmação imediata.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-accent/10 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Escolha a Data</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Selecione o dia que melhor se encaixa na sua agenda.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-accent/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Escolha o Horário</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Veja os horários disponíveis e escolha o que preferir.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-accent/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Escolha o Profissional</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Selecione o barbeiro de sua preferência para realizar o serviço.
                  </p>
                </div>
              </div>
            </div>
            
            <Link to="/agendar" className="btn btn-primary">
              Agendar Agora
            </Link>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
              alt="Agendamento" 
              className="rounded-lg shadow-xl w-full h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-700 p-6 rounded-lg shadow-lg">
              <p className="font-bold text-lg mb-1">Horários de Funcionamento</p>
              <p className="text-slate-600 dark:text-slate-400">Seg: 12h às 20h</p>
              <p className="text-slate-600 dark:text-slate-400">Ter-Sáb: 9h às 20h</p>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Appointment;