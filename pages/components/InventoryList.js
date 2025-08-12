import { useState } from 'react';

export default function InventoryList({ products, onSold }) {
  const [loadingId, setLoadingId] = useState(null);

  const sell = async (product, qty = 1) => {
    setLoadingId(product.id);
    try {
      const res = await fetch('/api/sell', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ product_id: product.id, qty })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error');
      onSold && onSold();
    } catch (e) {
      // guardar en local storage para sincronizar después
      const pending = JSON.parse(localStorage.getItem('pending_sales') || '[]');
      pending.push({ product_id: product.id, qty, created_at: new Date().toISOString(), product_snapshot: product });
      localStorage.setItem('pending_sales', JSON.stringify(pending));
      alert('Guardado offline. Se sincronizará cuando haya conexión.');
      onSold && onSold();
    }
    setLoadingId(null);
  }

  return (
    <div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr style={{textAlign:'left'}}>
            <th>Modelo</th><th>Color</th><th>Género</th><th>Talla</th><th>Precio</th><th>Costo</th><th>Qty</th><th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{opacity: p.quantity === 0 ? 0.5 : 1}}>
              <td>{p.model}</td>
              <td>{p.color}</td>
              <td>{p.gender}</td>
              <td>{p.size}</td>
              <td>{Number(p.price).toFixed(2)}</td>
              <td>{p.cost ? Number(p.cost).toFixed(2) : '-'}</td>
              <td>{p.quantity}</td>
              <td>
                <button disabled={p.quantity<=0 || loadingId===p.id} onClick={()=>sell(p,1)}>{loadingId===p.id ? 'Procesando...' : 'Vender 1'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
