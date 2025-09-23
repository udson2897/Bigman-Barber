import { useState } from 'react';
import { X, ShoppingCart, User, MapPin, Phone, CreditCard, Truck, DollarSign, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  category?: string;
}

interface CartItem {
  id: string;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  products: Product[];
  onOrderComplete: () => void;
}

interface CustomerData {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'pix' | 'delivery';
}

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const CheckoutModal = ({ isOpen, onClose, cartItems, products, onOrderComplete }: CheckoutModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'pix',
  });

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do CEP quando o usuário começar a digitar
    if (name === 'zipCode') {
      setCepError(null);
    }
  };

  const formatCep = (cep: string) => {
    // Remove tudo que não é número
    const numbers = cep.replace(/\D/g, '');
    // Aplica a máscara 00000-000
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCep(e.target.value);
    setCustomerData(prev => ({
      ...prev,
      zipCode: formattedCep,
    }));
    setCepError(null);
  };

  const searchCep = async () => {
    const cep = customerData.zipCode.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }

    setIsLoadingCep(true);
    setCepError(null);

    try {
      console.log('🔍 Buscando CEP:', cep);
      
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data: CepData = await response.json();
      
      console.log('📍 Dados do CEP recebidos:', data);

      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }

      // Preencher automaticamente os campos
      setCustomerData(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        zipCode: formatCep(data.cep),
      }));

      console.log('✅ Endereço preenchido automaticamente');

    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error);
      setCepError('Erro ao consultar CEP. Tente novamente.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchCep();
    }
  };

  const formatWhatsAppMessage = () => {
    const orderItems = cartItems.map(item => {
      const product = products.find(p => p.id === item.id);
      return `• ${product?.name} - Qtd: ${item.quantity} - R$ ${((product?.price || 0) * item.quantity).toFixed(2)}`;
    }).join('\n');

    const total = getCartTotal();
    const paymentMethodText = customerData.paymentMethod === 'pix' ? 'PIX' : 'Pagamento na entrega';

    return `🛍️ *NOVO PEDIDO - BIG MAN BARBER*

👤 *Cliente:* ${customerData.name}
📱 *Telefone:* ${customerData.phone}

📍 *Endereço de Entrega:*
${customerData.address}
${customerData.neighborhood}, ${customerData.city} - ${customerData.state}
CEP: ${customerData.zipCode}

🛒 *Produtos:*
${orderItems}

💰 *Total:* R$ ${total.toFixed(2)}
💳 *Forma de Pagamento:* ${paymentMethodText}

---
Pedido realizado através do site da BIG MAN Barber
Data: ${new Date().toLocaleString('pt-BR')}`;
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      // Enviar pedido via edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerData,
          cartItems,
          products: cartItems.map(item => products.find(p => p.id === item.id)).filter(Boolean),
          total: getCartTotal(),
          whatsappMessage: formatWhatsAppMessage(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar pedido');
      }

      const result = await response.json();
      
      if (result.whatsappUrl) {
        // Abrir WhatsApp com a mensagem
        window.open(result.whatsappUrl, '_blank');
      }

      // Finalizar pedido
      onOrderComplete();
      setStep(3); // Ir para tela de sucesso
      
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert(`Erro ao processar pedido: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep1 = () => {
    const basicValidation = customerData.name.trim() && 
           customerData.phone.trim() && 
           customerData.address.trim() && 
           customerData.neighborhood.trim() && 
           customerData.city.trim() && 
           customerData.state.trim() && 
           customerData.zipCode.trim();
    return basicValidation;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold dark:text-white">
            {step === 1 && 'Dados de Entrega'}
            {step === 2 && 'Confirmar Pedido'}
            {step === 3 && 'Pedido Enviado!'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5 dark:text-white" />
          </button>
        </div>

        {/* Step 1: Customer Data */}
        {step === 1 && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Nome completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerData.name}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleInputChange}
                  placeholder="(61) 99999-9999"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              {/* CEP com busca automática */}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  CEP *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="zipCode"
                    value={customerData.zipCode}
                    onChange={handleCepChange}
                    onKeyPress={handleCepKeyPress}
                    placeholder="00000-000"
                    maxLength={9}
                    className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={searchCep}
                    disabled={isLoadingCep || customerData.zipCode.replace(/\D/g, '').length !== 8}
                    className="px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoadingCep ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Buscar</span>
                  </button>
                </div>
                {cepError && (
                  <p className="text-red-500 text-sm mt-1">{cepError}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Digite o CEP e clique em "Buscar" para preencher automaticamente o endereço
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Endereço completo *
                </label>
                <input
                  type="text"
                  name="address"
                  value={customerData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={customerData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={customerData.city}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  value={customerData.state}
                  onChange={handleInputChange}
                  placeholder="DF"
                  maxLength={2}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Forma de Pagamento *
                </label>
                <select
                  name="paymentMethod"
                  value={customerData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="pix">PIX</option>
                  <option value="delivery">Pagamento na entrega</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!validateStep1()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Order Confirmation */}
        {step === 2 && (
          <div className="p-6">
            {/* Customer Info */}
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-3 dark:text-white">Dados de Entrega</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-accent" />
                  <span className="dark:text-white">{customerData.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <span className="dark:text-white">{customerData.phone}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-accent mt-0.5" />
                  <div className="dark:text-white">
                    <p>{customerData.address}</p>
                    <p>{customerData.neighborhood}, {customerData.city} - {customerData.state}</p>
                    <p>CEP: {customerData.zipCode}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {customerData.paymentMethod === 'pix' ? (
                    <CreditCard className="h-4 w-4 text-accent" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-accent" />
                  )}
                  <span className="dark:text-white">
                    {customerData.paymentMethod === 'pix' ? 'PIX' : 'Pagamento na entrega'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-3 dark:text-white">Seus Produtos</h3>
              <div className="space-y-3">
                {cartItems.map(item => {
                  const product = products.find(p => p.id === item.id);
                  const size = itemSizes[item.id];
                  return product ? (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{product.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {size && ` • Tamanho: ${size}`}
                        </p>
                      </div>
                      <span className="font-bold dark:text-white">
                        R$ {(product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-600 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg dark:text-white">Total:</span>
                  <span className="font-bold text-xl text-accent">
                    R$ {getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Importante:</strong> Ao confirmar o pedido, suas informações serão enviadas via WhatsApp para nossa equipe. 
                {customerData.paymentMethod === 'pix' 
                  ? ' Você receberá os dados do PIX para pagamento.'
                  : ' O pagamento será feito na entrega do produto.'
                }
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="btn btn-outline"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Confirmar Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-4 dark:text-white">Pedido Enviado com Sucesso!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Seu pedido foi enviado via WhatsApp para nossa equipe. Em breve entraremos em contato para confirmar os detalhes e o pagamento.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Próximos passos:</strong><br/>
                1. Nossa equipe entrará em contato via WhatsApp<br/>
                2. Confirmaremos os detalhes do pedido<br/>
                3. {customerData.paymentMethod === 'pix' 
                    ? 'Enviaremos os dados do PIX para pagamento'
                    : 'Combinaremos a entrega e pagamento'
                }<br/>
                4. Entregaremos seu pedido no endereço informado
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;