import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';

const locations = [
  {
    id: 1,
    name: 'Unidade Centro',
    address: 'Av. Principal, 123, Centro, São Paulo - SP',
    phone: '(11) 99999-9999',
    hours: {
      weekdays: '9h às 20h',
      saturday: '9h às 18h',
      sunday: '10h às 16h'
    },
    mapUrl: 'https://www.google.com/maps',
    image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    features: ['Estacionamento', 'Wi-Fi', 'Café', 'TV']
  },
  {
    id: 2,
    name: 'Unidade Norte',
    address: 'Rua das Flores, 456, Zona Norte, São Paulo - SP',
    phone: '(11) 88888-8888',
    hours: {
      weekdays: '9h às 20h',
      saturday: '9h às 18h',
      sunday: '10h às 16h'
    },
    mapUrl: 'https://www.google.com/maps',
    image: 'https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    features: ['Estacionamento', 'Wi-Fi', 'Café', 'Ar-condicionado']
  },
  {
    id: 3,
    name: 'Unidade Sul',
    address: 'Av. das Nações, 789, Zona Sul, São Paulo - SP',
    phone: '(11) 77777-7777',
    hours: {
      weekdays: '9h às 20h',
      saturday: '9h às 18h',
      sunday: '10h às 16h'
    },
    mapUrl: 'https://www.google.com/maps',
    image: 'https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    features: ['Wi-Fi', 'Café', 'TV', 'Ar-condicionado']
  },
];

const LocationsPage = () => {
  useEffect(() => {
    document.title = 'Unidades | BIG MAN Barber Shopp';
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
          alt="Unidades BIG MAN" 
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="container-custom relative z-20 text-white">
          <h1 className="heading-xl mb-6">Nossas Unidades</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Encontre a unidade mais próxima de você e venha conhecer a experiência BIG MAN Barber Shopp.
          </p>
        </div>
      </section>

      {/* Locations */}
      <section className="section bg-white dark:bg-slate-800">
        <div className="container-custom">
          <div className="space-y-16">
            {locations.map((location, index) => (
              <div 
                key={location.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index !== locations.length - 1 ? 'pb-16 border-b border-slate-200 dark:border-slate-700' : ''
                }`}
              >
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img 
                    src={location.image} 
                    alt={location.name}
                    className="rounded-lg shadow-lg w-full h-80 object-cover"
                  />
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h2 className="heading-lg mb-6">{location.name}</h2>
                  
                  <div className="space-y-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-accent/10 p-3 rounded-full">
                        <MapPin className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Endereço</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {location.address}
                        </p>
                        <a 
                          href={location.mapUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-accent mt-2 hover:underline"
                        >
                          Ver no mapa
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-accent/10 p-3 rounded-full">
                        <Phone className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Contato</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {location.phone}
                        </p>
                        <a 
                          href={`https://wa.me/${location.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-accent mt-2 hover:underline"
                        >
                          Enviar WhatsApp
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-accent/10 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Horário de Funcionamento</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Segunda a Sexta: {location.hours.weekdays}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Sábado: {location.hours.saturday}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Domingo: {location.hours.sunday}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-3">Comodidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {location.features.map((feature, i) => (
                        <span 
                          key={i}
                          className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Link 
                    to="/agendar" 
                    className="btn btn-primary"
                  >
                    Agendar Nesta Unidade
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section bg-slate-50 dark:bg-slate-900">
        <div className="container-custom text-center">
          <h2 className="heading-lg mb-4">Onde Estamos</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Confira o mapa para encontrar a unidade mais próxima de você.
          </p>
          
          {/* Map placeholder - would be replaced with actual Google Maps embed */}
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">
              Mapa será carregado aqui (integração com Google Maps)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;