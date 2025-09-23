import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      title: "Estilo e Precisão",
      subtitle: "Os melhores profissionais para cuidar do seu visual",
      cta: "Agende Agora",
      link: "/agendar"
    },
    {
      image: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      title: "Experiência Premium",
      subtitle: "Mais que um corte, uma experiência completa",
      cta: "Conheça Nossos Serviços",
      link: "/servicos"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img 
            src={slide.image}
            alt={slide.title}
            className="absolute w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="container-custom text-center">
              <h1 className="heading-xl text-white mb-4 opacity-0 animate-fade-in">
                {slide.title}
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto opacity-0 animate-fade-in animation-delay-300">
                {slide.subtitle}
              </p>
              <Link 
                to={slide.link}
                className="btn btn-primary px-8 py-3 opacity-0 animate-fade-in animation-delay-600 inline-flex items-center"
              >
                {slide.cta}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              currentSlide === index 
                ? 'bg-accent w-8' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Hero;