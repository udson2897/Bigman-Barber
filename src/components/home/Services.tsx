import { Link } from 'react-router-dom';
import { Scissors, Bean as Beard, Sparkles, ArrowRight } from 'lucide-react';

const serviceItems = [
  {
    icon: Scissors,
    title: 'Corte de Cabelo',
    description: 'Cortes modernos e clássicos realizados por profissionais experientes.',
    price: 'A partir de R$ 45,00',
  },
  {
    icon: Beard,
    title: 'Barba',
    description: 'Modelagem, hidratação e finalização para uma barba impecável.',
    price: 'A partir de R$ 15,00',
  },
  {
    icon: Sparkles,
    title: 'Procedimenos',
    description: 'Hidratação, nutrição e outros cuidados para cabelo e barba.',
    price: 'A partir de R$ 40,00',
  },
];

const Services = () => {
  return (
    <section className="section bg-slate-50 dark:bg-slate-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Nossos Serviços</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Conheça os serviços premium que oferecemos para cuidar do seu estilo com a qualidade que você merece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceItems.map((service, index) => (
            <div 
              key={index}
              className="card hover:shadow-lg hover:-translate-y-1 p-6"
            >
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <service.icon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="heading-sm mb-3">{service.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {service.description}
              </p>
              <p className="font-medium text-accent mb-6">{service.price}</p>
              <Link 
                to="/servicos" 
                className="inline-flex items-center text-primary dark:text-accent font-medium hover:underline"
              >
                Saiba mais
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/servicos" className="btn btn-outline">
            Ver Todos os Serviços
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;