import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  id: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { customerData, cartItems, products, total, whatsappMessage }: {
      customerData: CustomerData;
      cartItems: CartItem[];
      products: Product[];
      total: number;
      whatsappMessage: string;
    } = body

    if (!customerData || !cartItems || !products) {
      throw new Error('Dados do pedido incompletos')
    }

    console.log('Processando pedido:', { customerData, cartItems, total })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current user session
    const authHeader = req.headers.get('Authorization')
    let currentUser = null
    
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      currentUser = user
    }

    // Verificar estoque e atualizar produtos
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        throw new Error(`Produto não encontrado: ${item.id}`);
      }

      // Verificar se há estoque suficiente
      const { data: currentProduct, error: fetchError } = await supabaseClient
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar produto:', fetchError);
        throw new Error(`Erro ao verificar estoque do produto: ${product.name}`);
      }

      if (currentProduct.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${currentProduct.stock}, Solicitado: ${item.quantity}`);
      }

      // Atualizar estoque
      const newStock = currentProduct.stock - item.quantity;
      const { error: updateError } = await supabaseClient
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);

      if (updateError) {
        console.error('Erro ao atualizar estoque:', updateError);
        throw new Error(`Erro ao atualizar estoque do produto: ${product.name}`);
      }

      console.log(`Estoque atualizado para ${product.name}: ${currentProduct.stock} -> ${newStock}`);
    }

    // Criar registro do pedido na tabela orders
    const orderData = {
      user_id: currentUser?.id || null,
      user_email: customerData.email,
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      customer_address: `${customerData.address}, ${customerData.neighborhood}, ${customerData.city} - ${customerData.state}, CEP: ${customerData.zipCode}`,
      payment_method: customerData.paymentMethod,
      total_amount: total,
      items: cartItems.map(item => {
        const product = products.find(p => p.id === item.id);
        return {
          product_id: item.id,
          product_name: product?.name,
          quantity: item.quantity,
          unit_price: product?.price,
          total_price: (product?.price || 0) * item.quantity
        };
      }),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Salvar pedido no banco de dados
    const { data: savedOrder, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        user_id: currentUser?.id,
        user_email: customerData.email,
        user_name: customerData.name,
        user_phone: customerData.phone,
        total_amount: total,
        payment_method: customerData.paymentMethod,
        delivery_address: `${customerData.address}, ${customerData.neighborhood}, ${customerData.city} - ${customerData.state}, CEP: ${customerData.zipCode}`,
        items: orderData.items,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error saving order:', orderError);
      // Continue even if order saving fails
    } else {
      console.log('✅ Order saved successfully:', savedOrder);
    }

    console.log('Pedido processado com sucesso:', orderData);

    // Formatar telefone para WhatsApp
    const cleanPhone = customerData.phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const businessPhone = '5561982449671'; // Número do negócio

    // Criar URL do WhatsApp para enviar para o negócio
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    console.log('WhatsApp URL criada:', whatsappUrl);

    return new Response(
      JSON.stringify({
        success: true,
        whatsappUrl,
        orderData,
        message: 'Pedido processado com sucesso'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Erro ao processar pedido:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar pedido'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})