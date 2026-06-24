import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

export function PurchaseOrdersPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([
    { idProducto: null, cantidadSolicitada: 0, precioUnitario: 0 },
  ]);
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const canApprove = ['administrador', 'gerente'].includes(user?.rol);
  const canCreate = ['administrador', 'gerente', 'compras'].includes(user?.rol);
  const canReceive = ['administrador', 'almacen'].includes(user?.rol);

  const recommendedSupplier = useMemo(() => {
    if (!suppliers.length) return null;
    return [...suppliers].sort((a, b) => {
      const scoreDiff = Number(b.calificacion || 0) - Number(a.calificacion || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return Number(a.leadTimePromedio || 0) - Number(b.leadTimePromedio || 0);
    })[0];
  }, [suppliers]);

  useEffect(() => {
    api.products().then(setProducts).catch(() => setProducts([]));
    api.suppliers().then(setSuppliers).catch(() => setSuppliers([]));
    api.purchaseOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const addItem = () => setItems([...items, { idProducto: null, cantidadSolicitada: 0, precioUnitario: 0 }]);
  const updateItem = (idx, key, value) => {
    const next = [...items];
    next[idx][key] = value;
    setItems(next);
  };

  const submit = async () => {
    try {
      const payload = {
        idProveedor: Number(selectedSupplier || suppliers[0]?.idProveedor || 0),
        fechaEntregaEstimada: new Date(fechaEntrega).toISOString(),
        items: items.map((it) => ({ idProducto: Number(it.idProducto), cantidadSolicitada: Number(it.cantidadSolicitada), precioUnitario: Number(it.precioUnitario) })),
      };
      const res = await api.createPurchaseOrder(payload);
      await Swal.fire('OK', `Orden creada: ${res.nroOrden}`, 'success');
      api.purchaseOrders().then(setOrders).catch(() => {});
    } catch (err) {
      await Swal.fire('Error', err.message || String(err), 'error');
    }
  };

  const receive = async () => {
    const id = await Swal.fire({
      title: 'ID de Orden a recepcionar',
      input: 'number',
      inputLabel: 'idOrdenCompra',
      showCancelButton: true,
    });

    if (!id.value) return;

    try {
      const payload = {
        idOrdenCompra: Number(id.value),
        idAlmacen: 1,
        nroComprobante: `RCPT-${Date.now()}`,
        items: items.map((it) => ({ idProducto: Number(it.idProducto), cantidadRecibida: Number(it.cantidadSolicitada), costoUnitario: Number(it.precioUnitario) })),
      };
      const resp = await api.receiveOrder(payload);
      await Swal.fire('OK', `Entrada ID: ${resp.entradaId}`, 'success');
    } catch (err) {
      await Swal.fire('Error', err.message || String(err), 'error');
    }
  };

  return (
    <div>
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Sirve para crear, revisar y recepcionar órdenes de compra sin perder de vista el proveedor recomendado y el detalle de cada orden."
        bullets={[
          'Compara proveedores por calificación y lead time antes de crear la OC.',
          'Permite emitir, aprobar, rechazar y recepcionar órdenes con seguimiento claro.',
          'La tabla usa campos reales de las órdenes y sus proveedores para evitar confusión.',
        ]}
      />

      <div className="row g-4 mt-0">
        <div className="col-lg-8">
          <div className="badge-soft mb-3">
            <div className="text-uppercase small text-secondary mb-2">Crear orden</div>
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label">Proveedor</label>
                <select className="form-select" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
                  <option value="">-- seleccionar proveedor --</option>
                  {suppliers.map((s) => (
                    <option key={s.idProveedor} value={s.idProveedor}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Fecha entrega estimada</label>
                <input className="form-control" type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-new" onClick={submit} disabled={!canCreate}>Crear</button>
              </div>
            </div>
          </div>

          <div className="badge-soft mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="text-uppercase small text-secondary">Detalle</div>
                <div className="fw-semibold">Items solicitados</div>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={addItem}>Agregar item</button>
            </div>
            {items.map((it, idx) => (
              <div className="row g-2 mb-2" key={idx}>
                <div className="col-md-5">
                  <select className="form-select" value={it.idProducto || ''} onChange={(e) => updateItem(idx, 'idProducto', e.target.value)}>
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.idProducto} value={p.idProducto}>{p.nombre} ({p.codigo})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="number" placeholder="Cantidad" value={it.cantidadSolicitada} onChange={(e) => updateItem(idx, 'cantidadSolicitada', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="number" placeholder="Precio unitario" value={it.precioUnitario} onChange={(e) => updateItem(idx, 'precioUnitario', e.target.value)} />
                </div>
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-new" onClick={submit} disabled={!canCreate}>Crear OC</button>
              <button className="btn btn-edit" onClick={receive} disabled={!canReceive}>Recepcionar OC</button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="badge-soft h-100">
            <div className="text-uppercase small text-secondary mb-2">Proveedor sugerido</div>
            {recommendedSupplier ? (
              <>
                <div className="fw-semibold mb-1">{recommendedSupplier.nombre}</div>
                <div className="muted-sm">RUC: {recommendedSupplier.ruc}</div>
                <div className="muted-sm">Contacto: {recommendedSupplier.contacto || '-'}</div>
                <div className="muted-sm">Lead time: {recommendedSupplier.leadTimePromedio} días</div>
                <div className="muted-sm">Calificación: {Number(recommendedSupplier.calificacion).toFixed(1)} / 5</div>
              </>
            ) : (
              <div className="muted-sm">No hay proveedores registrados.</div>
            )}

            <div className="table-responsive mt-3">
              <table className="table table-sm table-custom align-middle">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>RUC</th>
                    <th>Lead</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.slice().sort((a, b) => Number(b.calificacion || 0) - Number(a.calificacion || 0)).slice(0, 4).map((s) => (
                    <tr key={s.idProveedor}>
                      <td>{s.nombre}</td>
                      <td>{s.ruc}</td>
                      <td>{s.leadTimePromedio} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="badge-soft mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="text-uppercase small text-secondary">Órdenes de compra</div>
            <div className="fw-semibold">Seguimiento con datos reales</div>
          </div>
          <div className="muted-sm">{orders.length} registros</div>
        </div>
        <div className="table-responsive">
          <table className="table table-custom table-sm align-middle">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Proveedor</th>
                <th>RUC</th>
                <th>Lead</th>
                <th>Usuario</th>
                <th>Fecha OC</th>
                <th>Entrega</th>
                <th>Items</th>
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.idOrdenCompra} role="button" style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                  <td className="fw-semibold">{o.nroOrden}</td>
                  <td>{o.proveedor?.nombre}</td>
                  <td>{o.proveedor?.ruc || '-'}</td>
                  <td>{o.proveedor?.leadTimePromedio ?? '-'}</td>
                  <td>{o.usuario?.usuario || '-'}</td>
                  <td>{new Date(o.fechaOrden).toLocaleDateString()}</td>
                  <td>{o.fechaEntregaEstimada ? new Date(o.fechaEntregaEstimada).toLocaleDateString() : '-'}</td>
                  <td>{o.detalles?.length || 0}</td>
                  <td><span className={`badge text-bg-${o.estado === 'pendiente' ? 'warning' : o.estado === 'rechazada' ? 'danger' : 'success'}`}>{o.estado}</span></td>
                  <td>S/ {Number(o.total).toFixed(2)}</td>
                  <td>
                    <div className="btn-group" role="group">
                      {canApprove && <button className="btn btn-sm btn-edit" onClick={async (e) => { e.stopPropagation(); await api.updateOrderStatus(o.idOrdenCompra, { estado: 'aprobada' }); Swal.fire('OK','Orden aprobada','success'); api.purchaseOrders().then(setOrders); }}>Aprobar</button>}
                      {canApprove && <button className="btn btn-sm btn-delete" onClick={async (e) => { e.stopPropagation(); await api.updateOrderStatus(o.idOrdenCompra, { estado: 'rechazada' }); Swal.fire('OK','Orden rechazada','info'); api.purchaseOrders().then(setOrders); }}>Rechazar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="alert alert-light border mt-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{selectedOrder.nroOrden}</strong> - {selectedOrder.proveedor?.nombre}
                <div className="text-muted">Estado: {selectedOrder.estado} | Total: S/ {Number(selectedOrder.total).toFixed(2)}</div>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedOrder(null)}>Cerrar</button>
            </div>
            <div className="mt-2">
              <div className="fw-semibold mb-2">Detalle</div>
              <ul className="mb-0">
                {(selectedOrder.detalles || []).map((d) => (
                  <li key={d.idDetalleOc}>
                    {d.producto?.nombre || `Producto ${d.idProducto}`} - {Number(d.cantidadSolicitada)} x S/ {Number(d.precioUnitario).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
