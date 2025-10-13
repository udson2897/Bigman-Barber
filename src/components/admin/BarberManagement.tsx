import { useState, useEffect } from 'react';
import { useBarberStore } from '../../lib/store';
import { Plus, CreditCard as Edit, Trash, Save, X, User, MapPin, Image as ImageIcon } from 'lucide-react';

interface BarberFormData {
  name: string;
  image_url: string;
  workstation_number: string;
  is_active: boolean;
}

const initialFormData: BarberFormData = {
  name: '',
  image_url: '',
  workstation_number: '',
  is_active: true,
};

export const BarberManagement = () => {
  const { barbers, loading, error, fetchBarbers, addBarber, updateBarber, deleteBarber, clearError } = useBarberStore();
  const [isAddingBarber, setIsAddingBarber] = useState(false);
  const [editingBarber, setEditingBarber] = useState<number | null>(null);
  const [formData, setFormData] = useState<BarberFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setFormError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Nome é obrigatório');
      return false;
    }
    if (!formData.workstation_number || parseInt(formData.workstation_number) < 1) {
      setFormError('Número da bancada deve ser maior que 0');
      return false;
    }
    
    // Check if workstation number is already taken (except for current barber being edited)
    const existingBarber = barbers.find(b => 
      b.workstation_number === parseInt(formData.workstation_number) && 
      b.id !== editingBarber &&
      b.is_active
    );
    
    if (existingBarber) {
      setFormError(`Bancada ${formData.workstation_number} já está ocupada por ${existingBarber.name}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setFormError(null);

    try {
      const barberData = {
        name: formData.name.trim(),
        image_url: formData.image_url.trim() || null,
        workstation_number: parseInt(formData.workstation_number),
        is_active: formData.is_active,
      };

      if (editingBarber) {
        await updateBarber(editingBarber, barberData);
        setEditingBarber(null);
      } else {
        await addBarber(barberData);
        setIsAddingBarber(false);
      }

      setFormData(initialFormData);
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (barber: any) => {
    setEditingBarber(barber.id);
    setFormData({
      name: barber.name,
      image_url: barber.image_url || '',
      workstation_number: barber.workstation_number.toString(),
      is_active: barber.is_active,
    });
    setFormError(null);
  };

  const handleCancel = () => {
    setIsAddingBarber(false);
    setEditingBarber(null);
    setFormData(initialFormData);
    setFormError(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${name}? Ele será marcado como inativo.`)) {
      await deleteBarber(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-md dark:text-white">Gerenciar Barbeiros</h2>
        {!isAddingBarber && !editingBarber && (
          <button
            onClick={() => {
              setIsAddingBarber(true);
              setFormError(null);
              clearError();
            }}
            className="btn btn-primary py-2 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Barbeiro</span>
          </button>
        )}
      </div>

      {/* Global Error Message */}
      {error && !isAddingBarber && !editingBarber && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      {(isAddingBarber || editingBarber) && (
        <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold mb-6 dark:text-white">
            {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
          </h3>

          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Nome do Barbeiro *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do barbeiro"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Número da Bancada *
                </label>
                <input
                  type="number"
                  name="workstation_number"
                  value={formData.workstation_number}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Ex: 1, 2, 3..."
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  URL da Foto
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium dark:text-white">Barbeiro Ativo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
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
                    <span>{editingBarber ? 'Salvar Alterações' : 'Adicionar Barbeiro'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barbers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="dark:text-white">Carregando barbeiros...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.filter(barber => barber.is_active).map((barber) => (
            <div
              key={barber.id}
              className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                {barber.image_url ? (
                  <img
                    src={barber.image_url}
                    alt={barber.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-600 flex items-center justify-center hidden">
                  <User className="h-12 w-12 text-slate-400" />
                </div>
                
                {/* Workstation badge */}
                <div className="absolute top-2 left-2 bg-accent text-white text-sm font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>Bancada {barber.workstation_number}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 dark:text-white">
                  {barber.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                  Bancada número {barber.workstation_number}
                </p>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(barber)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors"
                    title="Editar barbeiro"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(barber.id, barber.name)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remover barbeiro"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && barbers.filter(b => b.is_active).length === 0 && !isAddingBarber && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-500 dark:text-slate-300 mb-2">
            Nenhum barbeiro cadastrado
          </p>
          <p className="text-slate-400 dark:text-slate-400 mb-6">
            Comece adicionando o primeiro barbeiro da equipe.
          </p>
          <button
            onClick={() => {
              setIsAddingBarber(true);
              setFormError(null);
              clearError();
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Primeiro Barbeiro
          </button>
        </div>
      )}
    </div>
  );
};