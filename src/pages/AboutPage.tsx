import { useEffect } from 'react';
import { Award, Users, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    document.title = 'Sobre Nós | BIG MAN Barber Shopp';
  }, []);

  const team = [
    {
      name: 'PW Barber',
      image: 'https://imagizer.imageshack.com/img924/5766/yoCw8H.jpg',
      
    },
    {
      name: 'Nilde Santos',
      image: 'https://imagizer.imageshack.com/img923/8876/Nh00KJ.jpg',
      
    },
    {
      name: 'Regis Barber',
      image: 'https://imagizer.imageshack.com/img924/6190/MV30EK.jpg',
      
    },
    {
      name: 'Ruan C. Barber',
      image: 'https://imagizer.imageshack.com/img924/9341/3390wD.jpg',
      
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
          alt="Sobre a BIG MAN" 
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="container-custom relative z-20 text-white">
          <h1 className="heading-xl mb-6">Nossa História</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Conheça a BIG MAN Barber Shopp, onde tradição e modernidade se encontram para oferecer a melhor experiência em cuidados masculinos.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="section bg-white dark:bg-slate-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg mb-6">Nossa Trajetória</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Fundada em 2015, a BIG MAN surgiu da paixão de Ricardo Oliveira por oferecer serviços de barbearia de alta qualidade a preços justos. O que começou como uma pequena barbearia no centro da cidade rapidamente cresceu graças à dedicação à excelência e ao atendimento personalizado.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Ao longo dos anos, expandimos para múltiplas unidades, sempre mantendo o compromisso com a qualidade e a experiência única que nos tornou conhecidos. Nossa equipe cresceu, incorporando os melhores profissionais do mercado, todos compartilhando os mesmos valores e paixão pelo trabalho.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Hoje, a BIG MAN é reconhecida como referência em serviços de barbearia, inovando constantemente, mas sem perder a essência que nos trouxe até aqui: o cuidado genuíno com cada cliente que passa por nossas portas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                alt="Nossa história" 
                className="rounded-lg shadow-lg h-64 object-cover"
              />
              <img 
                src="https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                alt="Nossa história" 
                className="rounded-lg shadow-lg h-64 object-cover mt-8"
              />
              <img 
                src="https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                alt="Nossa história" 
                className="rounded-lg shadow-lg h-64 object-cover"
              />
              <img 
                src="https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                alt="Nossa história" 
                className="rounded-lg shadow-lg h-64 object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section bg-slate-50 dark:bg-slate-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Missão, Visão e Valores</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Nossos princípios orientam tudo o que fazemos, desde o atendimento até o resultado final de cada serviço.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="heading-sm mb-4">Missão</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Proporcionar uma experiência única de cuidado masculino, com serviços de alta qualidade que elevam a autoestima e o bem-estar dos nossos clientes.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="heading-sm mb-4">Visão</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Ser a referência nacional em barbearias, reconhecida pela excelência, inovação e capacidade de transformar o conceito de cuidado masculino.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h3 className="heading-sm mb-4">Valores</h3>
              <ul className="text-slate-600 dark:text-slate-400 text-left space-y-2">
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-accent rounded-full mr-2"></span>
                  Excelência em cada detalhe
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-accent rounded-full mr-2"></span>
                  Respeito ao cliente
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-accent rounded-full mr-2"></span>
                  Inovação constante
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-accent rounded-full mr-2"></span>
                  Ambiente acolhedor
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-accent rounded-full mr-2"></span>
                  Compromisso com resultados
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-white dark:bg-slate-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Nossa Equipe</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Conheça os profissionais dedicados que fazem da BIG MAN uma experiência única.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-80 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                  <p className="text-accent mb-3">{member.position}</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;