import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { api } from '../lib/api';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.suppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  const refresh = () => api.suppliers().then(setSuppliers).catch(() => setSuppliers([]));

  const openCreate = () => { setEditing(null); setShowModal(true); };

  const openEdit = (s) => { setEditing(s); setShowModal(true); };

  const handleSave = async (payload) => {
    try {
      if (editing && editing.idProveedor) {
        await api.updateSupplier(editing.idProveedor, payload);
      } else {
        await api.createSupplier(payload);
      }
      await refresh();
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Error guardando proveedor');
    }
  };

  const handleDelete = async (supplier) => {
    const result = await Swal.fire({
      title: 'Eliminar proveedor',
      text: `Se inactivará a ${supplier.nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    });
    if (!result.isConfirmed) return;
    try {
      await api.inactivateSupplier(supplier.idProveedor);
      await refresh();
      await Swal.fire('OK', 'Proveedor inactivado', 'success');
    } catch (err) {
      await Swal.fire('Error', err.message || 'Error eliminando proveedor', 'error');
    }
  };

  return (
    <div>
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Gestiona proveedores, sus datos comerciales y su estado operativo en compras."
        bullets={[
          'Permite crear, editar e inactivar proveedores con confirmación.',
          'Muestra lead time, contacto y una referencia rápida de calidad.',
        ]}
      />

      <div className="filter-card">
        <div className="filter-row">
          <input className="form-control search-input" placeholder="Buscar proveedor..." />
          <select className="form-select" style={{ width: 160 }}>
            <option>Todos</option>
            <option>Activos</option>
            <option>Inactivos</option>
          </select>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-filter">Filtrar</button>
          </div>
        </div>
      </div>

      <div className="data-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="h6 mb-0">Gestion de Proveedores</h2>
          <div>
            <button className="btn btn-outline-secondary" onClick={refresh}>Refrescar</button>
            <button className="btn btn-new" style={{ marginLeft: 8 }} onClick={openCreate}>Nuevo</button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-custom table-sm align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUC</th>
                <th>Lead Time</th>
                <th>Calificacion</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.idProveedor}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{s.nombre}</div>
                    <div className="muted-sm">{s.contacto || ''}</div>
                  </td>
                  <td className="muted-sm">{s.ruc}</td>
                  <td>{s.leadTimePromedio} dias</td>
                  <td>{Number(s.calificacion).toFixed(1)} / 5</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn-edit" onClick={() => openEdit(s)}>Editar</button>
                      <button className="btn-delete" onClick={() => handleDelete(s)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <SupplierModal supplier={editing} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}

function SupplierModal({ supplier, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    nombre: supplier?.nombre || '',
    ruc: supplier?.ruc || '',
    contacto: supplier?.contacto || '',
    leadTimePromedio: supplier?.leadTimePromedio || 7,
    calificacion: supplier?.calificacion || 3,
  }));

  return (
    <div className="modal" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{supplier ? 'Editar proveedor' : 'Nuevo proveedor'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">RUC</label>
              <input className="form-control" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Contacto</label>
              <input className="form-control" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cerrar</button>
            <button className="btn btn-sge" onClick={() => onSave(form)}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
