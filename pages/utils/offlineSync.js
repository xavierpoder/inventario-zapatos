export async function syncOffline(){
  if (typeof window === 'undefined') return;
  const pending = JSON.parse(localStorage.getItem('pending_sales') || '[]');
  if (!pending.length) return;
  
  console.log(`Sincronizando ${pending.length} ventas pendientes...`);
  const successful_indices = [];

  for (const [index, p] of pending.entries()) {
    try {
      const res = await fetch('/api/sell', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ product_id: p.product_id, qty: p.qty }) 
      });
      if (res.ok) {
        successful_indices.push(index);
      }
    } catch (e) {
      console.error('Error sincronizando venta:', e);
    }
  }
  
  // Eliminar solo las ventas sincronizadas con éxito
  const remaining = pending.filter((_, index) => !successful_indices.includes(index));
  localStorage.setItem('pending_sales', JSON.stringify(remaining));
  console.log('Sincronización completada.');
}
