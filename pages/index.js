import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';
import InventoryForm from '../components/InventoryForm';
import QuickUpload from '../components/QuickUpload';
import InventoryList from '../components/InventoryList';
import Reports from '../components/Reports';
import Dashboard from '../components/Dashboard';
import { syncOffline } from '../utils/offlineSync';

export default function Home() {
  const [filters, setFilters] = useState({ size: '', gender: '', search: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: products, error } = useSWR(['products', filters, refreshKey], async () => {
    let q = supabase.from('products').select('*');
    if (filters.size) q = q.eq('size', Number(filters.size));
    if (filters.gender) q = q.eq('gender', filters.gender);
    if (filters.search) q = q.ilike('model', `%${filters.search}%`);
    const { data } = await q.order('model', { ascending: true });
    return data || [];
  });

  useEffect(() => { syncOffline().then(() => setRefreshKey(k => k+1)); }, []);

  return (
    <main style={{ padding: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Inventario de Zapatos</h1>
      <Dashboard refresh={refreshKey} />

      <section style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <InventoryForm onSaved={() => setRefreshKey(k => k+1)} />
          <QuickUpload onSaved={() => setRefreshKey(k => k+1)} />
        </div>

        <div style={{ flex: 2, minWidth: 400 }}>
          <h3>Filtros</h3>
          <input placeholder='Buscar modelo' value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))} />
          <input placeholder='Talla' type='number' min="34" max="43" value={filters.size} onChange={e => setFilters(f => ({...f, size: e.target.value}))} />
          <select value={filters.gender} onChange={e => setFilters(f => ({...f, gender: e.target.value}))}>
            <option value=''>Todos los géneros</option>
            <option>Hombre</option>
            <option>Mujer</option>
            <option>Unisex</option>
          </select>
          <button onClick={() => setRefreshKey(k => k+1)}>Refrescar</button>
          <InventoryList products={products || []} onSold={() => setRefreshKey(k => k+1)} />
        </div>
      </section>

      <section>
        <h2>Reportes</h2>
        <Reports />
      </section>
    </main>
  )
}
