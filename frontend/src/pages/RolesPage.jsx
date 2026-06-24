import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

const roleCards = [
  {
    role: 'administrador',
    title: 'Administrador del Sistema',
    tone: 'danger',
    summary: 'Control total de cuentas, seguridad y respaldo de la plataforma.',
    does: [
      'Crea usuarios y asigna roles.',
      'Inhabilita cuentas y revisa auditoria completa.',
      'Tiene acceso a todos los modulos y reportes.',
      'Supervisa la seguridad y continuidad del sistema.',
    ],
    cannot: ['No debe operar como comprador o almacenero por defecto.', 'No debe aprobar procesos sin trazabilidad.'],
  },
  {
    role: 'gerente',
    title: 'Gerente de Operaciones / Logistica',
    tone: 'primary',
    summary: 'Supervisa KPI, aprueba compras y ajusta parametros logistico-financieros.',
    does: [
      'Aprueba o rechaza ordenes de compra.',
      'Analiza dashboard, ABC, costos y reportes.',
      'Configura nivel de servicio, Cg y Cp.',
      'Monitorea stock critico y decisiones de reposicion.',
    ],
    cannot: ['No registra salidas fisicas ni realiza recepciones.', 'No gestiona usuarios.'],
  },
  {
    role: 'compras',
    title: 'Operador de Compras',
    tone: 'warning',
    summary: 'Gestiona proveedores, calcula VOP y emite ordenes de compra.',
    does: [
      'Mantiene proveedores, precios y lead time.',
      'Genera OC y las exporta a PDF.',
      'Recibe alertas de punto de pedido y compara precios.',
      'Envia reportes por correo cuando corresponde.',
    ],
    cannot: ['No aprueba compras.', 'No modifica parametros globales.', 'No registra salidas de almacen.'],
  },
  {
    role: 'almacen',
    title: 'Supervisor de Almacen',
    tone: 'success',
    summary: 'Recibe mercancia, registra movimientos y mantiene el inventario fisico.',
    does: [
      'Busca OC y registra entradas conforme o con observaciones.',
      'Registra salidas por produccion, merma, devolucion o transferencia.',
      'Actualiza stock en tiempo real y revisa stock critico.',
      'Administra ubicaciones fisicas, pasillo y nivel.',
    ],
    cannot: ['No crea ni aprueba OC.', 'No altera costos o nivel de servicio.', 'No administra usuarios.'],
  },
];

const permissionMatrix = [
  ['Dashboard', '✅', '✅', '⚪', '⚪'],
  ['Productos', '✅', '✅', '✅', '✅'],
  ['Proveedores', '✅', '✅', '✅', '⚪'],
  ['Compras / OC', '✅', '✅', '✅', '⚪'],
  ['Inventario', '✅', '⚪', '⚪', '✅'],
  ['Parametros', '✅', '✅', '⚪', '⚪'],
  ['Reportes', '✅', '✅', '✅', '✅'],
  ['Usuarios', '✅', '⚪', '⚪', '⚪'],
  ['Auditoria', '✅', '✅', '⚪', '⚪'],
];

export function RolesPage() {
  return (
    <div className="d-grid gap-4">
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Resume responsabilidades, restricciones y permisos por rol dentro del SGE."
        bullets={[
          'Sirve para validar qué puede hacer cada usuario.',
          'Ayuda a mantener la RBAC alineada con el proceso real.',
        ]}
      />

      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2 className="h4 mb-2">Roles y responsabilidades</h2>
              <p className="text-secondary mb-0">
                Esta vista resume lo que cada rol puede hacer dentro del SGE y ayuda a validar
                que la interfaz y los permisos del backend vayan alineados.
              </p>
            </div>
            <span className="badge text-bg-dark align-self-start">JWT + RBAC</span>
          </div>
        </div>
      </section>

      <section className="row g-3">
        {roleCards.map((card) => (
          <div className="col-lg-6" key={card.role}>
            <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${card.tone}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h3 className="h5 mb-1">{card.title}</h3>
                    <div className="text-uppercase small text-secondary">{card.role}</div>
                  </div>
                  <span className={`badge text-bg-${card.tone}`}>Rol activo</span>
                </div>
                <p className="text-secondary">{card.summary}</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light h-100">
                      <div className="fw-semibold mb-2">Debe hacer</div>
                      <ul className="mb-0 ps-3">
                        {card.does.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light h-100">
                      <div className="fw-semibold mb-2">Restricciones</div>
                      <ul className="mb-0 ps-3">
                        {card.cannot.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="data-table-card">
        <h3 className="h5 mb-3">Matriz de permisos resumida</h3>
        <div className="table-responsive">
          <table className="table table-sm align-middle table-custom">
              <thead>
                <tr>
                  <th>Modulo</th>
                  <th>Administrador</th>
                  <th>Gerente</th>
                  <th>Compras</th>
                  <th>Almacen</th>
                </tr>
              </thead>
              <tbody>
                {permissionMatrix.map((row) => (
                  <tr key={row[0]}>
                    <td className="fw-semibold">{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                    <td>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </section>
    </div>
  );
}