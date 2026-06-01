import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { api } from '../lib/api';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

export function InventoryPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.stockReport().then(setRows).catch(() => setRows([]));
  }, []);

  useEffect(() => {
    const critical = rows.filter((r) => Number(r.stockActual) <= Number(r.puntoPedido));
    if (critical.length > 0) {
      Swal.fire({
        title: 'Alerta de reposicion',
        text: `${critical.length} productos estan en o bajo punto de pedido.`,
        icon: 'warning',
      });
    }
  }, [rows]);

  return (
    <div>
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Presenta el stock actual por almacén, con puntos de pedido y ubicaciones físicas."
        bullets={[
          'Permite detectar productos críticos y revisar su ubicación.',
          'Facilita la operación diaria del almacén con stock y seguridad visibles.',
        ]}
      />

      <div className="filter-card">
        <div className="filter-row">
          <input className="form-control search-input" placeholder="Buscar producto, ubicacion..." />
          <select className="form-select" style={{ width: 200 }}>
            <option>Todos los almacenes</option>
          </select>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-filter">Filtrar</button>
          </div>
        </div>
      </div>

      <div className="data-table-card">
        <h2 className="h6 mb-3">Inventario y Ubicaciones</h2>
        <div className="table-responsive">
          <table className="table table-custom table-sm align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Almacen</th>
                <th>Stock</th>
                <th>Punto Pedido</th>
                <th>Stock Seguridad</th>
                <th>Pasillo/Nivel</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.idInventario}>
                  <td>{r.producto?.nombre}</td>
                  <td>{r.almacen?.nombre}</td>
                  <td>{Number(r.stockActual).toFixed(2)}</td>
                  <td>{Number(r.puntoPedido).toFixed(2)}</td>
                  <td>{Number(r.stockSeguridad).toFixed(2)}</td>
                  <td>{r.pasillo || '-'} / {r.nivel || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
