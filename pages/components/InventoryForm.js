import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function InventoryForm({ onSaved }) {
  const [form, setForm] = useState({ model: '', color: '', gender: 'Unisex', size: 36, price: '', cost: '', quantity: 1, notes: '' });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const item = { ...form, price: Number(form.price || 0), cost: Number(form.cost || 0), size: Number(form.size || 36), quantity: Number(form.quantity || 0) };
    const { error } = await supabase.from('products').insert([item]);
    setLoading(false);
    if (error) return alert(error.message);
    setForm({ model: '', color: '', gender: 'Unisex', size: 36, price: '', cost: '', quantity: 1, notes: '' });
    onSaved && onSaved();
  }

  return (
    <div style={{border:'1px solid #ddd', padding:10, marginBottom:10}}>
      <h3>Añadir producto</h3>
      <input placeholder='Modelo' value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
      <input placeholder='Color' value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
      <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
        <option>Hombre</option>
        <option>Mujer</option>
        <option>Unisex</option>
      </select>
      <input type='number' min="34" max="43" value={form.size} onChange={e => setForm({...form, size: Number(e.target.value)})} />
      <input placeholder='Precio USD' value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
      <input placeholder='Costo USD' value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
      <input type='number' min="0" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
      <input placeholder='Notas' value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
      <div style={{marginTop:8}}>
        <button onClick={save} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  )
}
