import { useEffect } from 'react';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import Appointment from '../components/home/Appointment';
import Testimonials from '../components/home/Testimonials';
import Locations from '../components/home/Locations';

const HomePage = () => {
  useEffect(() => {
    document.title = 'BIG MAN Barber Shopp | Home';
  }, []);

  return (
    <div>
      <Hero />
      <Services />
      <Appointment />
      <Testimonials />
      <Locations />
    </div>
  );
};

export default HomePage;