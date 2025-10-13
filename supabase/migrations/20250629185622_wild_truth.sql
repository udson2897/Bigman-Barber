/*
  # Add category field to products table

  1. Updates to products table
    - Add category column to store product category
    - Update existing products to have a default category

  2. Security
    - Maintain existing RLS policies
*/

-- Add category column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category text;
  END IF;
END $$;

-- Update existing products to have a default category (optional)
UPDATE products 
SET category = 'acessorio' 
WHERE category IS NULL OR category = '';