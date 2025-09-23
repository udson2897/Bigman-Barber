import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Scissors, MapPin, Phone, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa'; // 🔥 Ícone do WhatsApp

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold font-serif tracking-wider">
                BIG MAN <span className="text-accent">Barber</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-xs">
              Estilo e tradição no cuidado masculino. A melhor experiência em corte de cabelo e barba desde 2015.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=1000640531"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="https://www.instagram.com/bigmanbarbershopp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
              <a
                href="https://wa.me/5561996786027?text=Olá , gostaria de mais informações."
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-accent transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={22} /> {/* Ícone do WhatsApp */}
              </a>
            </div>
          </div>

          {/* Menu links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Menu Rápido</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/servicos" className="text-slate-400 hover:text-accent transition-colors">Serviços</Link>
              </li>
              <li>
                <Link to="/agendar" className="text-slate-400 hover:text-accent transition-colors">Agendar</Link>
              </li>
              <li>
                <Link to="/loja" className="text-slate-400 hover:text-accent transition-colors">Loja</Link>
              </li>
              <li>
                <Link to="/sobre" className="text-slate-400 hover:text-accent transition-colors">Sobre</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">Serviços</h3>
            <ul className="space-y-2">
              <li className="text-slate-400 hover:text-accent transition-colors">Corte de Cabelo</li>
              <li className="text-slate-400 hover:text-accent transition-colors">Barba</li>
              <li className="text-slate-400 hover:text-accent transition-colors">Tratamentos</li>
              <li className="text-slate-400 hover:text-accent transition-colors">Coloração</li>
              <li className="text-slate-400 hover:text-accent transition-colors">Pacotes Completos</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Entre em Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5" />
                <span className="text-slate-400">QR 117 Conjunto A , 03 - 72547401 Santa Maria - Brasília/DF</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-slate-400">(61) 99678-6027</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-slate-400">bigmanbarbershopp@outlook.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Desenvolvido por Code and Solutions. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/politica-privacidade" className="text-slate-400 hover:text-accent text-sm transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos-uso" className="text-slate-400 hover:text-accent text-sm transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
