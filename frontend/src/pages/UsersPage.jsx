import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

const starterAccounts = [
  { rol: 'administrador', usuario: 'admin', clave: 'Admin123*', badge: 'dark', descripcion: 'Control total del sistema y auditoria.' },
  { rol: 'gerente', usuario: 'gerente', clave: 'Gerente123*', badge: 'primary', descripcion: 'Aprueba compras, costos y reportes.' },
  { rol: 'compras', usuario: 'compras', clave: 'Compras123*', badge: 'warning', descripcion: 'Gestiona proveedores y ordenes de compra.' },
  { rol: 'almacen', usuario: 'almacen', clave: 'Almacen123*', badge: 'success', descripcion: 'Recibe, despacha y controla inventario.' },
];

export function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.users().then(setUsers).catch(() => setUsers([]));
  }, []);

  const roleCount = users.reduce((acc, u) => {
    acc[u.rol] = (acc[u.rol] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="d-grid gap-4">
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Administra las cuentas del sistema y muestra el mapa inicial de usuarios por rol."
        bullets={[
          'Permite revisar accesos iniciales y el total de cuentas activas.',
          'Apoya el control de identidades con enfoque administrativo.',
        ]}
      />

      <section className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="p-4 bg-dark text-white">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="text-uppercase small opacity-75">Gestion corporativa</div>
                <h2 className="h4 mb-2">Administracion de usuarios</h2>
                <p className="mb-0 text-white-50">Cuentas iniciales por rol para operar el SGE con control de acceso y trazabilidad.</p>
              </div>
              <div className="text-end">
                <div className="badge text-bg-light text-dark mb-2">JWT + RBAC</div>
                <div className="small text-white-50">Usuarios activos: {users.length}</div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="filter-card mb-3">
              <div className="filter-row">
                <input className="form-control search-input" placeholder="Buscar usuario, nombre o rol..." />
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

            <div className="row g-3 mb-4">
              {starterAccounts.map((account) => (
                <div className="col-md-3" key={account.rol}>
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className={`badge text-bg-${account.badge} mb-3`}>{account.rol}</div>
                      <h3 className="h6 mb-1">{account.usuario}</h3>
                      <div className="text-secondary small mb-2">Clave inicial: {account.clave}</div>
                      <p className="small text-secondary mb-0">{account.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="p-3 rounded-3 bg-light">
                  <div className="text-secondary small">Administradores</div>
                  <div className="h4 mb-0">{roleCount.administrador || 0}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3 bg-light">
                  <div className="text-secondary small">Gerentes</div>
                  <div className="h4 mb-0">{roleCount.gerente || 0}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3 bg-light">
                  <div className="text-secondary small">Compras</div>
                  <div className="h4 mb-0">{roleCount.compras || 0}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3 bg-light">
                  <div className="text-secondary small">Almacen</div>
                  <div className="h4 mb-0">{roleCount.almacen || 0}</div>
                </div>
              </div>
            </div>

            <div className="data-table-card">
              <h2 className="h6 mb-3">Usuarios</h2>
              <div className="table-responsive">
                <table className="table table-custom align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Creacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.idUsuario}>
                        <td className="fw-semibold">{u.usuario}</td>
                        <td>{u.nombres} {u.apellidos}</td>
                        <td><span className="badge text-bg-dark">{u.rol}</span></td>
                        <td>
                          <span className={`badge text-bg-${u.estado === 'activo' ? 'success' : 'secondary'}`}>
                            {u.estado}
                          </span>
                        </td>
                        <td>{new Date(u.fechaCreacion).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
