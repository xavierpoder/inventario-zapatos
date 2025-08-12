import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, serviceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { product_id, qty = 1 } = req.body;

  try {
    const { data: products, error: e0 } = await sb.from('products').select('*').eq('id', product_id).limit(1);
    if (e0) throw e0;
    const product = products?.[0];
    if (!product) return res.status(404).json({ error: 'Producto no existe' });
    if (product.quantity < qty) return res.status(400).json({ error: 'Stock insuficiente' });

    const sold = {
      product_id: product.id,
      sold_price: product.price,
      sold_cost: product.cost,
      size: product.size,
      gender: product.gender
    };
    const { error: e1 } = await sb.from('sales').insert([sold]);
    if (e1) throw e1;

    const { error: e2 } = await sb.from('products').update({ quantity: product.quantity - qty }).eq('id', product.id);
    if (e2) throw e2;

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
