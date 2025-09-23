import { useEffect, useState } from 'react';
import { ShoppingCart, Filter, ChevronDown, Check, X, Plus } from 'lucide-react';
import { useProductStore } from '../lib/store';
import CheckoutModal from '../components/shop/CheckoutModal';

const categories = [
  { id: 'all', name: 'Todos os Produtos' },
  { id: 'gel', name: 'Gel para Cabelo' },
  { id: 'perfume', name: 'Perfumes' },
  { id: 'locao', name: 'Loção Pós-Barba' },
  { id: 'shampoo', name: 'Shampoos' },
  { id: 'condicionador', name: 'Condicionadores' },
  { id: 'pomada', name: 'Pomadas' },
  { id: 'oleo', name: 'Óleos para Barba' },
  { id: 'cera', name: 'Ceras' },
  { id: 'balm', name: 'Bálsamos' },
  { id: 'kit', name: 'Kits Completos' },
  { id: 'acessorio', name: 'Acessórios' },
];

const ShopPage = () => {
  useEffect(() => {
    document.title = 'Loja | BIG MAN Barber Shopp';
  }, []);

  const { products, loading, fetchProducts } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [cartItems, setCartItems] = useState<{ id: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => 
        product.category === selectedCategory
      ));
    }
  }, [selectedCategory, products]);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) {
      alert('Produto fora de estoque!');
      return;
    }

    const existingItem = cartItems.find(item => item.id === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity >= product.stock) {
      alert(`Estoque máximo disponível: ${product.stock} unidades`);
      return;
    }

    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCartItems([...cartItems, { id: productId, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem?.quantity === 1) {
      setCartItems(cartItems.filter(item => item.id !== productId));
    } else if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrderComplete = () => {
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    // Recarregar produtos para atualizar estoque
    fetchProducts();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
          alt="Produtos BIG MAN" 
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="container-custom relative z-20 text-white">
          <h1 className="heading-xl mb-6">Produtos Profissionais BIG MAN</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Descubra nossa linha exclusiva de produtos para barbearia e cuidados masculinos. Qualidade profissional para uso em casa ou no salão.
          </p>
        </div>
      </section>

      {/* Shop Section */}
      <section className="section bg-white dark:bg-slate-800">
        <div className="container-custom">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-md"
            >
              <Filter className="h-5 w-5" />
              <span>Filtrar</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Cart button for mobile */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-accent text-white rounded-full"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Filters */}
          <div className={`lg:hidden mb-6 overflow-hidden transition-all duration-300 ${
            isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3 dark:text-white">Categorias</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      selectedCategory === category.id 
                        ? 'bg-accent text-white' 
                        : 'hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Categorias</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-accent text-white' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Cart for desktop */}
                <div className="mt-8">
                  <h3 className="font-bold text-lg mb-4 dark:text-white">Carrinho</h3>
                  {cartItems.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400">Seu carrinho está vazio</p>
                  ) : (
                    <div>
                      <div className="space-y-4 mb-4">
                        {cartItems.map((item, index) => {
                          const product = products.find(p => p.id === item.id);
                          return product ? (
                            <div key={`${item.id}-${index}`} className="flex items-center">
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded mr-3"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm line-clamp-1 dark:text-white">{product.name}</p>
                                <div className="flex items-center mt-1">
                                  <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-5 h-5 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full text-sm"
                                  >
                                    -
                                  </button>
                                  <span className="mx-2 text-sm dark:text-white">{item.quantity}</span>
                                  <button 
                                    onClick={() => addToCart(item.id)}
                                    className="w-5 h-5 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full text-sm"
                                  >
                                    +
                                  </button>
                                  <span className="ml-auto text-sm font-medium dark:text-white">
                                    R$ {(product.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <div className="flex justify-between mb-4">
                          <span className="font-medium dark:text-white">Total:</span>
                          <span className="font-bold dark:text-white">R$ {getCartTotal().toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={() => setIsCheckoutOpen(true)}
                          className="btn btn-primary w-full"
                        >
                          Finalizar Compra
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              <h2 className="heading-md mb-6 dark:text-white">
                {categories.find(c => c.id === selectedCategory)?.name || 'Todos os Produtos'}
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                  <p className="dark:text-white">Carregando produtos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="card hover:shadow-lg overflow-hidden">
                      <div className="relative">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-64 object-cover"
                        />
                        <div className={`absolute top-4 right-4 text-white text-sm font-bold px-3 py-1 rounded-full ${
                          product.stock > 0 ? 'bg-accent' : 'bg-red-500'
                        }`}>
                          {product.stock > 0 ? `Estoque: ${product.stock}` : 'Esgotado'}
                        </div>
                        {product.category && (
                          <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {categories.find(cat => cat.id === product.category)?.name || product.category}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 dark:text-white">{product.name}</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-accent">R$ {product.price.toFixed(2)}</span>
                          <button 
                            onClick={() => addToCart(product.id)}
                            disabled={product.stock === 0}
                            className="btn btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            <ShoppingCart className="h-5 w-5" />
                            <span>Adicionar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-slate-500 dark:text-slate-400">
                    Nenhum produto encontrado nesta categoria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Cart Drawer */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
        isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`absolute top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-800 shadow-xl transition-transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg dark:text-white">Seu Carrinho</h3>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5 dark:text-white" />
            </button>
          </div>

          <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Seu carrinho está vazio
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  const product = products.find(p => p.id === item.id);
                  return product ? (
                    <div key={`${item.id}-${index}`} className="flex items-center">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{product.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          R$ {product.price.toFixed(2)} x {item.quantity}
                        </p>
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full"
                          >
                            -
                          </button>
                          <span className="mx-2 dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item.id)}
                            className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span className="font-bold dark:text-white">
                        R$ {(product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex justify-between mb-4">
              <span className="font-medium dark:text-white">Total:</span>
              <span className="font-bold dark:text-white">R$ {getCartTotal().toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="btn btn-primary w-full"
              disabled={cartItems.length === 0}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        products={products}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
};

export default ShopPage;