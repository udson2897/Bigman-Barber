/*
  # Sistema de Pedidos da Loja

  1. Nova Tabela
    - `orders` - Pedidos dos usuários
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `user_email` (text)
      - `user_name` (text)
      - `user_phone` (text)
      - `total_amount` (numeric)
      - `status` (text)
      - `payment_method` (text)
      - `delivery_address` (text)
      - `items` (jsonb)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela orders
    - Política para usuários verem apenas seus pedidos
    - Política para admins gerenciarem todos os pedidos
*/

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  user_name text NOT NULL,
  user_phone text NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text NOT NULL,
  delivery_address text NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus pedidos
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.email() = user_email);

-- Política para usuários criarem seus pedidos
CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.email() = user_email);

-- Política para admins gerenciarem todos os pedidos
CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid()
  ));

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();