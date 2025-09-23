import { MapPin, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const location = {
  name: 'BIG MAN Barber',
  address: 'QR 117 Conjunto A, 03 - Santa Maria, Brasília - DF',
  cep: '72547-401',
  phone: '(61) 99678-6027',
  hours: 'Seg: 9h-20h | Terc-Sáb: 9h-20h |',
  mapUrl: 'https://maps.app.goo.gl/2JsCDufii1Wnk4nv9',
};

const Locations = () => {
  return (
    <section className="section bg-white dark:bg-slate-800">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Nossa Localização</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Venha nos conhecer e experimente o melhor em cuidados masculinos.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card hover:shadow-lg p-6">
            <h3 className="heading-sm mb-4">{location.name}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-600 dark:text-slate-400">{location.address}</p>
                  <p className="text-slate-600 dark:text-slate-400">CEP: {location.cep}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">{location.phone}</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-slate-600 dark:text-slate-400">{location.hours}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <a 
                href={location.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline flex-1 py-2"
              >
                Ver no Mapa
              </a>
              <Link 
                to="/agendar" 
                className="btn btn-primary flex-1 py-2"
              >
                Agendar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Locations;