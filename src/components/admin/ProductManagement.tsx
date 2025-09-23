import { useState, useEffect } from 'react';
import { useProductStore } from '../../lib/store';
import { Plus, Trash, Edit, X, Save, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  stock: string;
  category: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  stock: '',
  category: '',
};

const categories = [
  { value: 'gel', label: 'Gel para Cabelo' },
  { value: 'perfume', label: 'Perfumes' },
  { value: 'locao', label: 'Loção Pós-Barba' },
  { value: 'shampoo', label: 'Shampoos' },
  { value: 'condicionador', label: 'Condicionadores' },
  { value: 'pomada', label: 'Pomadas' },
  { value: 'oleo', label: 'Óleos para Barba' },
  { value: 'cera', label: 'Ceras' },
  { value: 'balm', label: 'Bálsamos' },
  { value: 'kit', label: 'Kits Completos' },
  { value: 'acessorio', label: 'Acessórios' },
];

// Componente de formulário isolado
const ProductForm = ({ 
  isEditing, 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  error 
}: {
  isEditing: boolean;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}) => {
  // Estado local do formulário
  const [formState, setFormState] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price ? initialData.price.toString() : '',
    image_url: initialData?.image_url || '',
    stock: initialData?.stock ? initialData.stock.toString() : '',
    category: initialData?.category || '',
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormState({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price ? initialData.price.toString() : '',
        image_url: initialData.image_url || '',
        stock: initialData.stock ? initialData.stock.toString() : '',
        category: initialData.category || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('🔄 Form input changed:', name, '=', value);
    
    setFormState(prev => {
      const newState = { ...prev, [name]: value };
      console.log('📋 Updated form state:', newState);
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Submitting form with state:', formState);
    
    // Validate
    if (!formState.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    if (!formState.description.trim()) {
      alert('Descrição é obrigatória');
      return;
    }
    if (!formState.price || parseFloat(formState.price) <= 0) {
      alert('Preço deve ser maior que zero');
      return;
    }
    if (!formState.category) {
      alert('Categoria é obrigatória');
      return;
    }

    await onSubmit(formState);
  };

  return (
    <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-6 dark:text-white">
        {isEditing ? 'Editar Produto' : 'Novo Produto'}
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Nome do Produto *
            </label>
            <input
              type="text"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Digite o nome do produto"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Categoria *
            </label>
            <select
              name="category"
              value={formState.category}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Preço (R$) *
            </label>
            <input
              type="number"
              name="price"
              value={formState.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          {/* Estoque */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Estoque *
            </label>
            <input
              type="number"
              name="stock"
              value={formState.stock}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              URL da Imagem *
            </label>
            <input
              type="url"
              name="image_url"
              value={formState.image_url}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva o produto..."
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditing ? 'Salvar Alterações' : 'Adicionar Produto'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ProductManagement = () => {
  const { products, loading, error, fetchProducts, clearError } = useProductStore();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingProductData, setEditingProductData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    console.log('🔄 ProductManagement component mounted, fetching products...');
    fetchProducts();
  }, [fetchProducts]);

  // Clear messages after some time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 10000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image_url: formData.image_url.trim(),
        stock: parseInt(formData.stock),
        category: formData.category,
      };

      console.log('📤 Submitting product data:', productData);

      if (editingProduct) {
        console.log('📝 Updating existing product:', editingProduct);
        
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct);

        if (updateError) {
          console.error('❌ Update error:', updateError);
          throw new Error(`Erro ao atualizar: ${updateError.message}`);
        }

        setSuccessMessage('Produto atualizado com sucesso!');
        setEditingProduct(null);
        setEditingProductData(null);
      } else {
        console.log('➕ Adding new product');
        
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          throw new Error(`Erro ao adicionar: ${insertError.message}`);
        }

        console.log('✅ Product added successfully:', newProduct);
        setSuccessMessage('Produto adicionado com sucesso!');
        setIsAddingProduct(false);
      }

      // Refresh products list
      await fetchProducts();
      
      console.log('✅ Product operation completed successfully');
    } catch (error: any) {
      console.error('💥 Error in handleFormSubmit:', error);
      setFormError(error.message || 'Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        console.log('🗑️ Deleting product:', id);
        
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('❌ Delete error:', error);
          throw new Error(`Erro ao excluir: ${error.message}`);
        }

        setSuccessMessage('Produto excluído com sucesso!');
        await fetchProducts();
      } catch (error: any) {
        console.error('💥 Error deleting product:', error);
        setFormError('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  const handleEdit = (product: any) => {
    console.log('📝 Editing product:', product);
    setEditingProduct(product.id);
    setEditingProductData(product);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    console.log('❌ Cancelling form');
    setIsAddingProduct(false);
    setEditingProduct(null);
    setEditingProductData(null);
    setFormError(null);
    setSuccessMessage(null);
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-md dark:text-white">Gerenciar Produtos</h2>
        {!isAddingProduct && !editingProduct && (
          <button
            onClick={() => {
              console.log('➕ Starting to add new product');
              setIsAddingProduct(true);
              setFormError(null);
              setSuccessMessage(null);
            }}
            className="btn btn-primary py-2 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      {/* Global Success Message */}
      {successMessage && !isAddingProduct && !editingProduct && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Global Error Message */}
      {error && !isAddingProduct && !editingProduct && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Show form when adding or editing */}
      {(isAddingProduct || editingProduct) && (
        <ProductForm
          isEditing={!!editingProduct}
          initialData={editingProductData}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          error={formError}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="dark:text-white">Carregando produtos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-600 flex items-center justify-center hidden">
                  <ImageIcon className="h-12 w-12 text-slate-400" />
                </div>
                {/* Category badge */}
                {product.category && (
                  <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                    {getCategoryLabel(product.category)}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 dark:text-white line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-accent">
                    R$ {product.price ? product.price.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                    Estoque: {product.stock || 0}
                  </span>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors"
                    title="Editar produto"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Excluir produto"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && !isAddingProduct && (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-500 dark:text-slate-300 mb-2">
            Nenhum produto cadastrado
          </p>
          <p className="text-slate-400 dark:text-slate-400 mb-6">
            Comece adicionando seu primeiro produto à loja.
          </p>
          <button
            onClick={() => {
              console.log('➕ Starting to add first product');
              setIsAddingProduct(true);
              setFormError(null);
              setSuccessMessage(null);
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Primeiro Produto
          </button>
        </div>
      )}
    </div>
  );
};