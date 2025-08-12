import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabaseClient';

export default function Reports(){
  const [range, setRange] = useState({ from: '', to: '' });
  const [rows, setRows] = useState([]);

  useEffect(()=>{
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    setRange({ from: firstDay, to: new Date().toISOString() });
  },[]);

  useEffect(()=>{ if(range.from) fetchRange(); }, [range]);

  const fetchRange = async () => {
    let q = supabase.from('sales').select('*, product:products(model)').order('created_at', { ascending: false });
    if (range.from) q = q.gte('created_at', range.from);
    if (range.to) q = q.lte('created_at', range.to);
    const { data, error } = await q;
    if (error) return alert(error.message);
    setRows(data || []);
  }

  const totals = rows.reduce((acc, r) => ({ count: acc.count + 1, revenue: acc.revenue + Number(r.sold_price || 0), cost: acc.cost + Number(r.sold_cost || 0) }), { count:0, revenue:0, cost:0 });

  return (
    <div style={{border:'1px solid #ddd', padding:10, marginTop:10}}>
      <h3>Reporte</h3>
      <div>
        <label>Desde: </label>
        <input type='datetime-local' value={range.from ? new Date(range.from).toISOString().slice(0,16) : ''} onChange={e=>setRange({...range, from: new Date(e.target.value).toISOString()})} />
        <label> Hasta: </label>
        <input type='datetime-local' value={range.to ? new Date(range.to).toISOString().slice(0,16) : ''} onChange={e=>setRange({...range, to: new Date(e.target.value).toISOString()})} />
        <button onClick={fetchRange}>Buscar</button>
      </div>

      <div style={{marginTop:8}}>
        <p>Ventas: {totals.count} | Ingresos: ${totals.revenue.toFixed(2)} | Costos: ${totals.cost.toFixed(2)} | <strong>Ganancia estimada: ${(totals.revenue - totals.cost).toFixed(2)}</strong></p>
      </div>

      <table style={{width:'100%'}}>
        <thead><tr><th>Fecha</th><th>Producto</th><th>Talla</th><th>Precio</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.product?.model || 'Producto eliminado'}</td><td>{r.size}</td><td>{Number(r.sold_price).toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
