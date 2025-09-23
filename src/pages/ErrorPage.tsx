import { useEffect } from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const ErrorPage = () => {
  const error = useRouteError() as any;
  
  useEffect(() => {
    document.title = 'Erro | BIG MAN Barber Shopp';
  }, []);

  return (
    <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-6" />
        <h1 className="heading-lg mb-4">Oops!</h1>
        <p className="text-xl mb-6">
          {error?.statusText || error?.message || 'Algo deu errado!'}
        </p>
        <Link to="/" className="btn btn-primary">
          Voltar para Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;