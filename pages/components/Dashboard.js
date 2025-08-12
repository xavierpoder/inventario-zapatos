import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ refresh }){
  const [data, setData] = useState({ totalStock:0, totalProducts:0, soldThisMonth:0, topModels:[] });

  const load = async () => {
    const { data: products } = await supabase.from('products').select('id, quantity');
    const totalStock = (products || []).reduce((s, p) => s + (p.quantity || 0), 0);
    const { data: sales } = await supabase.from('sales').select('id', { count: 'exact' }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(),1).toISOString());
    const { data: top } = await supabase.rpc('top_sold_models');

    setData({ totalStock, totalProducts: (products||[]).length, soldThisMonth: sales?.length || 0, topModels: top || [] });
  }

  useEffect(()=>{ load(); }, [refresh]);

  return (
    <div style={{border:'1px solid #ddd', padding:10, marginBottom:10}}>
      <strong>Resumen</strong>
      <div>Total pares en stock: {data.totalStock}</div>
      <div>Productos diferentes: {data.totalProducts}</div>
      <div>Vendidos este mes: {data.soldThisMonth}</div>
      <div>Modelos top: {data.topModels?.map(t => <span key={t.model}>{t.model} ({t.count}) </span>)}</div>
    </div>
  )
}
