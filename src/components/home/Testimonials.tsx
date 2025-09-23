import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Marcos Silva',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    rating: 5,
    text: 'Atendimento incrível e resultado impecável. Encontrei meu barbeiro de confiança. A experiência na BIG MAN é simplesmente perfeita.',
  },
  {
    name: 'João Pereira',
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    rating: 5,
    text: 'O ambiente, o atendimento e a qualidade dos serviços são excepcionais. Sempre saio satisfeito e com autoestima lá em cima!',
  },
  {
    name: 'Carlos Mendes',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    rating: 5,
    text: 'Não é só uma barbearia, é uma experiência completa. Os profissionais são altamente qualificados e o ambiente é muito agradável.',
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  return (
    <section className="section bg-slate-900 text-white relative overflow-hidden">
      {/* Background quotes */}
      <div className="absolute inset-0 opacity-5">
        <Quote className="absolute top-10 left-10 w-20 h-20" />
        <Quote className="absolute bottom-10 right-10 w-20 h-20" />
      </div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">O Que Nossos Clientes Dizem</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A satisfação dos nossos clientes é a nossa maior recompensa. Confira o que eles têm a dizer sobre a nossa barbearia.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="min-w-full px-4"
                >
                  <div className="text-center">
                    <div className="relative mb-8">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                      />
                      <div className="bg-accent text-white p-2 rounded-full absolute bottom-0 right-1/2 transform translate-x-12">
                        <Quote className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`}
                        />
                      ))}
                    </div>

                    <blockquote className="text-xl italic mb-6">
                      "{testimonial.text}"
                    </blockquote>

                    <p className="font-bold text-lg">{testimonial.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white text-slate-900 p-2 rounded-full shadow-lg hover:bg-accent hover:text-white transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white text-slate-900 p-2 rounded-full shadow-lg hover:bg-accent hover:text-white transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full transition-all ${
                  currentIndex === index 
                    ? 'bg-accent w-8' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;