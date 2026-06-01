import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

export function ReportsPage() {
  const [critical, setCritical] = useState([]);
  const [sendType, setSendType] = useState('stock');
  const [sendTo, setSendTo] = useState('lizzayri18@gmail.com');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.criticalReport().then(setCritical).catch(() => setCritical([]));
  }, []);

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
        <div className="mb-3 d-flex gap-2">
          <button className="btn btn-sge" onClick={downloadStock}>Descargar RPT-01 (Stock)</button>
          <button className="btn btn-outline-secondary" onClick={downloadCritical}>Descargar RPT-04 (Criticos)</button>
          <button className="btn btn-primary" onClick={downloadMovements}>Descargar Movimientos</button>
          <button className="btn btn-outline-dark" onClick={downloadSuppliers}>Descargar Proveedores</button>
          <button className="btn btn-outline-danger" onClick={downloadAudit}>Descargar Auditoria</button>
        </div>
        <p className="text-secondary">Productos en o debajo del punto de pedido.</p>
        <div className="table-responsive">
          <table className="table table-custom table-sm align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Punto Pedido</th>
              </tr>
            </thead>
            <tbody>
              {critical.map((row) => (
                <tr key={row.idInventario}>
                  <td>{row.producto?.nombre}</td>
                  <td>{Number(row.stockActual).toFixed(2)}</td>
                  <td>{Number(row.puntoPedido).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
