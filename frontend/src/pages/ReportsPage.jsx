import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('critical'); // critical, stock, movements
  const [critical, setCritical] = useState([]);
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState({ entradas: [], salidas: [] });
  const [loading, setLoading] = useState({ critical: false, stock: false, movements: false });
  const [sendType, setSendType] = useState('stock');
  const [sendTo, setSendTo] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch data based on active tab
  const fetchData = async (tab) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      if (tab === 'critical') {
        const data = await api.criticalReport();
        setCritical(data);
      } else if (tab === 'stock') {
        const data = await api.stockReport();
        setStock(data);
      } else if (tab === 'movements') {
        const data = await api.movementsReport();
        setMovements(data);
      }
    } catch (err) {
      console.error(`Error fetching ${tab} report:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const downloadBlob = async (fetcher, filename) => {
    try {
      const blob = await fetcher();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('download error', err);
      alert('Error descargando PDF');
    }
  };

  const downloadStock = async () => downloadBlob(() => api.stockPdf(), 'RPT-01-stock.pdf');
  const downloadCritical = async () => downloadBlob(() => api.criticalPdf(), 'RPT-04-critical.pdf');
  const downloadMovements = async () => downloadBlob(() => api.movementsPdf(), 'RPT-movements.pdf');
  const downloadSuppliers = async () => downloadBlob(() => api.suppliersPdf(), 'RPT-suppliers.pdf');
  const downloadAudit = async () => downloadBlob(() => api.auditPdf(), 'RPT-audit.pdf');

  const sendByEmail = async (event) => {
    event.preventDefault();
    if (!sendTo.trim()) {
      alert('Ingresa un correo valido');
      return;
    }

    try {
      setSending(true);
      await api.sendReport({ type: sendType, to: sendTo.trim() });
      alert(`Reporte enviado a ${sendTo.trim()}`);
    } catch (err) {
      alert(err.message || 'Error enviando reporte');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Permite descargar y enviar reportes PDF de stock, críticos, movimientos, proveedores y auditoría."
        bullets={[
          'Exporta los reportes operativos más usados en PDF.',
          'Permite compartir reportes por correo desde la propia interfaz.',
        ]}
      />

      <div className="filter-card">
        <form className="row g-2 align-items-end" onSubmit={sendByEmail}>
          <div className="col-md-4">
            <label className="form-label">Tipo de reporte</label>
            <select className="form-select" value={sendType} onChange={(e) => setSendType(e.target.value)}>
              <option value="stock">RPT-01 Stock</option>
              <option value="critical">RPT-04 Criticos</option>
              <option value="movements">Movimientos</option>
              <option value="suppliers">Proveedores</option>
              <option value="audit">Auditoria</option>
            </select>
          </div>
          <div className="col-md-5">
            <label className="form-label">Enviar a</label>
            <input
              className="form-control"
              type="email"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder="correo@dominio.com"
            />
          </div>
          <div className="col-md-3 d-grid">
            <button className="btn btn-sge" type="submit" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar por correo'}
            </button>
          </div>
        </form>
      </div>

      <div className="data-table-card mt-3">
        <h2 className="h6 mb-3">Reportes SGE</h2>
        <div className="mb-3 d-flex gap-2 flex-wrap">
          <button className="btn btn-sge" onClick={downloadStock}>Descargar RPT-01 (Stock)</button>
          <button className="btn btn-outline-secondary" onClick={downloadCritical}>Descargar RPT-04 (Criticos)</button>
          <button className="btn btn-primary" onClick={downloadMovements}>Descargar Movimientos</button>
          <button className="btn btn-outline-dark" onClick={downloadSuppliers}>Descargar Proveedores</button>
          <button className="btn btn-outline-danger" onClick={downloadAudit}>Descargar Auditoria</button>
        </div>

        {/* Tabs for different report views */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'critical' ? 'active' : ''}`} 
              onClick={() => setActiveTab('critical')}
            >
              Productos Críticos
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`} 
              onClick={() => setActiveTab('stock')}
            >
              Stock General
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'movements' ? 'active' : ''}`} 
              onClick={() => setActiveTab('movements')}
            >
              Movimientos
            </button>
          </li>
        </ul>

        {/* Critical Products Tab */}
        {activeTab === 'critical' && (
          <div>
            <p className="text-secondary">Productos en o debajo del punto de pedido.</p>
            {loading.critical ? (
              <p>Cargando...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Almacén</th>
                      <th>Stock</th>
                      <th>Punto Pedido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {critical.map((row) => (
                      <tr key={row.idInventario}>
                        <td>{row.producto?.nombre}</td>
                        <td>{row.almacen?.nombre}</td>
                        <td>{Number(row.stockActual).toFixed(2)}</td>
                        <td>{Number(row.puntoPedido).toFixed(2)}</td>
                      </tr>
                    ))}
                    {critical.length === 0 && (
                      <tr><td colSpan="4" className="text-center text-muted">No hay productos críticos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stock General Tab */}
        {activeTab === 'stock' && (
          <div>
            <p className="text-secondary">Stock general de todos los productos por almacén.</p>
            {loading.stock ? (
              <p>Cargando...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Almacén</th>
                      <th>Stock Actual</th>
                      <th>Stock Mínimo</th>
                      <th>Stock Máximo</th>
                      <th>Punto Pedido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((row) => (
                      <tr key={row.idInventario}>
                        <td>{row.producto?.nombre}</td>
                        <td>{row.almacen?.nombre}</td>
                        <td>{Number(row.stockActual).toFixed(2)}</td>
                        <td>{Number(row.stockMinimo).toFixed(2)}</td>
                        <td>{Number(row.stockMaximo).toFixed(2)}</td>
                        <td>{Number(row.puntoPedido).toFixed(2)}</td>
                      </tr>
                    ))}
                    {stock.length === 0 && (
                      <tr><td colSpan="6" className="text-center text-muted">No hay datos de stock</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div>
            <p className="text-secondary">Movimientos de entrada y salida de inventario.</p>
            {loading.movements ? (
              <p>Cargando...</p>
            ) : (
              <div>
                <h6 className="mt-4 mb-2">Entradas</h6>
                <div className="table-responsive mb-4">
                  <table className="table table-custom table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Comprobante</th>
                        <th>Almacén</th>
                        <th>Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.entradas.map((entrada) => (
                        <tr key={entrada.idEntrada}>
                          <td>{new Date(entrada.fechaEntrada).toLocaleString()}</td>
                          <td>{entrada.nroComprobante}</td>
                          <td>{entrada.almacen?.nombre}</td>
                          <td>{entrada.usuario?.usuario}</td>
                        </tr>
                      ))}
                      {movements.entradas.length === 0 && (
                        <tr><td colSpan="4" className="text-center text-muted">No hay entradas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <h6 className="mb-2">Salidas</h6>
                <div className="table-responsive">
                  <table className="table table-custom table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Comprobante</th>
                        <th>Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.salidas.map((salida) => (
                        <tr key={salida.idSalida}>
                          <td>{new Date(salida.fechaSalida).toLocaleString()}</td>
                          <td>{salida.tipoComprobante}</td>
                          <td>{salida.usuario?.usuario}</td>
                        </tr>
                      ))}
                      {movements.salidas.length === 0 && (
                        <tr><td colSpan="3" className="text-center text-muted">No hay salidas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
