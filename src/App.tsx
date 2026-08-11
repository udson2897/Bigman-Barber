import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminMiniPanel from './components/layout/AdminMiniPanel';
import ScrollToTop from './components/utils/ScrollToTop';
import { Suspense } from 'react';

function App() {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <AdminMiniPanel />
        <main className="flex-grow pt-20">
          <Suspense fallback={<div className="text-center py-20">Carregando...</div>}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;