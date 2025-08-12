import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function QuickUpload({ onSaved }) {
  const [lines, setLines] = useState('');
  const [loading, setLoading] = useState(false);

  // formato por línea: modelo,color,gender,size,price,cost,quantity,notes
  const parseAndSave = async () => {
    setLoading(true);
    const items = lines.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const parts = l.split(',').map(p => p.trim());
      return {
        model: parts[0] || '',
        color: parts[1] || '',
        gender: parts[2] || 'Unisex',
        size: Number(parts[3] || 36),
        price: Number(parts[4] || 0),
        cost: Number(parts[5] || 0),
        quantity: Number(parts[6] || 1),
        notes: parts[7] || ''
      }
    });

    const { error } = await supabase.from('products').insert(items);
    setLoading(false);
    if (error) return alert(error.message);
    setLines('');
    onSaved && onSaved();
  }

  return (
    <div style={{border:'1px solid #ddd', padding:10, marginBottom:10}}>
      <h3>Carga rápida (varias líneas)</h3>
      <small>Formato: modelo,color,gender,size,price,cost,quantity,notes</small>
      <textarea rows={6} style={{width:'100%'}} value={lines} onChange={e=>setLines(e.target.value)} />
      <div style={{marginTop:8}}>
        <button onClick={parseAndSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar en lote'}</button>
      </div>
    </div>
  )
}
