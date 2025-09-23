import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Bean as Beard, Sparkles, Droplet, Clock } from 'lucide-react';

const serviceCategories = [
  {
    title: 'Cortes de Cabelo',
    icon: Scissors,  
    services: [
      {
        name: 'Corte de cabelo ',
        price: 'R$ 45,00',
       
        description: 'Corte tradicional com tesoura e máquina, finalizado com produtos de alta qualidade.',
        image: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
      },
      {
        name: 'Corte Degradê',
        price: 'R$ 35,00',
        
        description: 'Degradê personalizado com máquina e navalha, adequado ao formato do seu rosto.',
        image: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
      },
      {
        name: 'Corte só máquina',
        price: 'R$ 18,00',
        
        description: 'Corte na máquina, rápido e na regua !',
        image: 'https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' 
      },
    ]
  },
  {
    title: 'Barba',
    icon: Beard,
    services: [
      {
        name: 'Barba express "toda na máquina"',
        price: 'R$ 15,00',
        
        description: 'Modelagem da barba com máquina para manter o formato desejado.',
        image: 'https://images.pexels.com/photos/2881253/pexels-photo-2881253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'  
      },
      {
        name: 'Barba',
        price: 'R$ 25,00',
        
        description: 'Serviço completo de barba com produtos especiais e finalização.',
        image: 'https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
      },
       {
        name: 'Pigmentação barba',
        price: 'R$ 25,00',
        
        description: 'Realce a aparência da sua barba com nossa pigmentação profissional! Corrija falhas, defina os contornos e conquiste um visual mais cheio',
        image: 'https://images.pexels.com/photos/995300/pexels-photo-995300.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
      },
      
    ]
  },
  {
    title: 'Procedimentos',
    icon: Sparkles,
    services: [
      {
        name: 'Luzes',
        price: 'R$ 110,00',
        
        description: 'Ilumine seu visual com nosso serviço de luzes! Técnica perfeita para dar mais vida, contraste e estilo ao seu cabelo, realçando seu corte com personalidade e modernidades.',
        image: 'https://images.pexels.com/photos/6007503/pexels-photo-6007503.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' 
      },
      {
        name: 'Progressiva',
        price: 'R$ 40,00',
        
        description: 'Aplicação de produtos específicos para fortalecer os fios e reduzir a queda.',
        image: 'https://images.pexels.com/photos/2068672/pexels-photo-2068672.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
      },
      {
        name: 'Platinado',
        price: 'R$ 110,00',
        
        description: 'O platinado perfeito para quem gosta de ousar! Deixe seu visual marcante com fios claros, estilo moderno e cheio de atitude',
        image: 'https://images.pexels.com/photos/7518729/pexels-photo-7518729.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
      },
    ]
  },
  
];

const ServicesPage = () => {
  useEffect(() => {
    document.title = 'Serviços | BIG MAN Barber Shopp';
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
          alt="Serviços BIG MAN" 
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="container-custom relative z-20 text-white">
          <h1 className="heading-xl mb-6">Nossos Serviços</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Conheça a variedade de serviços profissionais que oferecemos para cuidar do seu visual com a qualidade que você merece.
          </p>
        </div>
      </section>

      {/* Service Categories */}
      {serviceCategories.map((category, categoryIndex) => (
        <section 
          key={categoryIndex}
          className={`section ${
            categoryIndex % 2 === 0 
              ? 'bg-white dark:bg-slate-800' 
              : 'bg-slate-50 dark:bg-slate-900'
          }`}
        >
          <div className="container-custom">
            <div className="flex items-center space-x-4 mb-12">
              <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center">
                <category.icon className="h-6 w-6 text-accent" />
              </div>
              <h2 className="heading-lg">{category.title}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {category.services.map((service, serviceIndex) => (
                <div 
                  key={serviceIndex}
                  className="card hover:shadow-lg overflow-hidden flex flex-col"
                >
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl">{service.name}</h3>
                      <div className="text-lg font-bold text-accent">{service.price}</div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{service.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                      {service.description}
                    </p>
                    <Link 
                      to="/agendar" 
                      className="btn btn-primary w-full mt-auto"
                    >
                      Agendar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="section bg-slate-900 text-white">
        <div className="container-custom text-center">
          <h2 className="heading-lg mb-6">Pronto para Transformar seu Visual?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Nossos barbeiros estão prontos para oferecer o melhor serviço. Agende seu horário agora mesmo.
          </p>
          <Link to="/agendar" className="btn btn-primary">
            Agendar Agora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;