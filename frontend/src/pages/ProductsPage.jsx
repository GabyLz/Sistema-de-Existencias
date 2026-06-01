import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [current, setCurrent] = useState(null);

  const fetch = () => api.products().then(setProducts).catch(() => setProducts([]));

  useEffect(() => {
    fetch();
  }, []);

  const filtered = products.filter((p) =>
    `${p.nombre} ${p.codigo}`.toLowerCase().includes(q.toLowerCase()),
  );

  const openCreate = () => {
    setModalMode('create');
    setCurrent(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setModalMode('edit');
    setCurrent(p);
    setShowModal(true);
  };

  const handleSave = async (form) => {
    try {
      if (modalMode === 'create') await api.createProduct(form);
      else await api.updateProduct(current.idProducto, form);
      await fetch();
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Error guardando producto');
    }
  };

  const handleInactivate = async (id) => {
    if (!confirm('Inactivar producto?')) return;
    try {
      await api.inactivateProduct(id);
      await fetch();
    } catch (err) {
      alert(err.message || 'Error inactivando');
    }
  };

  return (
    <div>
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Centraliza el catálogo de productos con búsqueda, creación, edición e inactivación lógica."
        bullets={[
          'Permite revisar código, nombre, categoría y método de imputación.',
          'Sirve para mantener el catálogo limpio y evitar duplicidad de existencias.',
        ]}
      />

      <div className="filter-card">
        <div className="filter-row">
          <input
            placeholder="Buscar producto por nombre o código..."
            className="form-control search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-outline-secondary" onClick={fetch}>Refrescar</button>
            <button className="btn-new" onClick={openCreate}>Nuevo</button>
          </div>
        </div>
      </div>

      <div className="data-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="h6 mb-0">Catálogo de productos</h2>
          <div className="muted-sm">{products.length} items</div>
        </div>

        <div className="table-responsive">
          <table className="table table-custom table-sm align-middle">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>PGC</th>
                <th>Imputacion</th>
                <th>Capacidad</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.idProducto}>
                  <td className="fw-semibold">{p.codigo}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                    <div className="muted-sm">{p.descripcion}</div>
                  </td>
                  <td>{p.tipoExistenciaPgc}</td>
                  <td>{p.metodoImputacion}</td>
                  <td>{p.capacidadAlmacenamiento}</td>
                  <td className="text-end">
                    <button className="btn-edit" onClick={() => openEdit(p)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleInactivate(p.idProducto)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          mode={modalMode}
          product={current}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ProductModal({ mode, product, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    codigo: product?.codigo || '',
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    unidadMedida: product?.unidadMedida || 'u',
    categoria: product?.categoria || '',
    tipoExistenciaPgc: product?.tipoExistenciaPgc || 1,
    metodoImputacion: product?.metodoImputacion || 'directo',
    capacidadAlmacenamiento: product?.capacidadAlmacenamiento || 'almacenable',
  }));

  return (
    <div className="modal" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{mode === 'create' ? 'Nuevo producto' : 'Editar producto'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Codigo</label>
              <input className="form-control" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Descripcion</label>
              <input className="form-control" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cerrar</button>
            <button className="btn btn-sge" onClick={() => onSave(form)}>{mode === 'create' ? 'Crear' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
