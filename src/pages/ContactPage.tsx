import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';

const ContactPage = () => {
  useEffect(() => {
    document.title = 'Contato | BIG MAN Barber Shopp';
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
          alt="Contato" 
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="container-custom relative z-20 text-white">
          <h1 className="heading-xl mb-6">Entre em Contato</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Estamos à disposição para atender você. Entre em contato conosco para tirar dúvidas, fazer sugestões ou agendar um horário.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="section bg-white dark:bg-slate-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="heading-md mb-8">Informações de Contato</h2>

              <div className="space-y-8 mb-12">
                <div className="flex items-start space-x-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Telefone</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      (61) 99678-6027
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Segunda: 12h às 20h / Terça-Sábado: 09h ás 20h
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">E-mail</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      bigmanbarbershopp@outlook.com
                    </p>
                    
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Unidade Principal</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      QR 117 Conjunto A , 03 - 72547401 Santa Maria - Brasília / DF
                    </p>
                    <a 
                      href="https://www.google.com/maps/place/BIG+MAN+Barber+Shopp/@-16.0038467,-47.9937538,17z"  
                      target="_blank"  
                      rel="noopener noreferrer"
                      className="text-accent hover:underline mt-1 inline-block"
                    >
                      Ver no mapa
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Redes Sociais</h3>
                    <div className="flex space-x-4 mt-2">
                      <a 
                        href="https://www.instagram.com/bigmanbarbershopp/?igsh=M" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-400 hover:text-accent"
                      >
                        Instagram
                      </a>
                      <a 
                        href="https://www.facebook.com/profile.php?id=1000640531" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-400 hover:text-accent"
                      >
                        Facebook
                      </a>
                      
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder - would be replaced with actual Google Maps embed */}
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">
                  Mapa será carregado aqui (integração com Google Maps)
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="heading-md mb-8">Envie-nos uma Mensagem</h2>

              {isSubmitted ? (
                <div className="bg-success/10 border border-success/30 text-success p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Mensagem Enviada!</h3>
                  <p>
                    Sua mensagem foi enviada com sucesso. Entraremos em contato o mais breve possível.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-1">
                        Assunto
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="agendamento">Agendamento</option>
                        <option value="informacoes">Informações</option>
                        <option value="sugestao">Sugestão</option>
                        <option value="reclamacao">Reclamação</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        Enviar Mensagem
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-slate-50 dark:bg-slate-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Perguntas Frequentes</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Confira as dúvidas mais comuns dos nossos clientes.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">Como funciona o agendamento online?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                O agendamento online pode ser feito através do nosso site, na seção "Agendar". Basta escolher o serviço, o profissional, a data e o horário disponível. Você receberá uma confirmação por e-mail e WhatsApp.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">Posso cancelar ou remarcar meu horário?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Sim, você pode cancelar ou remarcar seu horário até 2 horas antes do atendimento. Basta acessar o link que enviamos no e-mail de confirmação ou entrar em contato conosco por telefone.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">Qual a forma de pagamento?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Aceitamos todas as formas de pagamento: dinheiro, cartões de crédito e débito, PIX e transferência bancária. Para alguns serviços é possível realizar o pagamento antecipado no momento do agendamento.
              </p>
            </div>

            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-2">Vocês atendem crianças?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Sim, atendemos crianças a partir de 5 anos. Inclusive, temos o combo "Pai e Filho" com preço especial para quem quer vir acompanhado.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;