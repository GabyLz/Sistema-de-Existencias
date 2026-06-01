import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { api } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export function DashboardPage() {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.dashboard().then(setData).catch(() => setData(null));
  }, []);

  const barData = useMemo(() => {
    const labels = ['Electronica', 'Herramientas', 'Oficina', 'Repuestos'];
    const values = [1220, 840, 650, 1040];
    return {
      labels,
      datasets: [
        {
          label: 'Stock por categoria',
          data: values,
          backgroundColor: ['#0b6e4f', '#2d3047', '#ff9f1c', '#1b998b'],
        },
      ],
    };
  }, []);

  const statusData = useMemo(() => {
    const orderStates = data?.resumen?.orderStates || {};
    return {
      labels: ['Pendiente', 'Aprobada', 'Recibida', 'Rechazada'],
      datasets: [
        {
          label: 'OC por estado',
          data: [
            orderStates.pendiente || 0,
            orderStates.aprobada || 0,
            orderStates.recibida || 0,
            orderStates.rechazada || 0,
          ],
          backgroundColor: ['#f59e0b', '#0f766e', '#2563eb', '#b5475a'],
          borderRadius: 10,
        },
      ],
    };
  }, [data]);

  const lineData = useMemo(
    () => ({
      labels: ['Dia 1', 'Dia 5', 'Dia 10', 'Dia 15', 'Dia 20', 'Dia 25', 'Dia 30'],
      datasets: [
        {
          label: 'Alertas VOP',
          data: [2, 3, 1, 4, 5, 4, 3],
          borderColor: '#d1495b',
          backgroundColor: 'rgba(209, 73, 91, 0.15)',
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [],
  );

  return (
    <div className="d-grid gap-4">
      <ViewGuideAccordion
        title="¿Qué muestra este dashboard?"
        description="Este panel concentra la salud operativa del SGE para ver compras, stock y alertas en un solo lugar."
        bullets={[
          'KPIs ejecutivos con stock, criticidad, alertas VOP y valor de OC.',
          'Gráficos de stock por categoría, alertas VOP y estados de OC.',
          'Tabla de órdenes recientes con estado y total para seguimiento rápido.',
        ]}
      />

      <section className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="p-4 p-lg-5 dashboard-hero text-white">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div className="mw-100" style={{ maxWidth: '720px' }}>
                <div className="text-uppercase small opacity-75 mb-2">Sistema de Gestion de Existencias</div>
                <h1 className="display-6 mb-3">Panel ejecutivo de control logístico</h1>
                <p className="lead mb-0 text-white-50">
                  {user ? `${user.nombres} ${user.apellidos}` : 'Usuario'} - visión en tiempo real de existencias, compras y alertas.
                </p>
              </div>
              <div className="text-end">
                <div className="badge text-bg-light text-dark mb-2">Rol: {user?.rol}</div>
                <div className="small text-white-75">Acceso seguro con JWT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-3">
        <div className="col-md-3">
          <StatCard
            title="Stock Total"
            value={data?.kpis?.stockTotal?.toFixed?.(2) ?? '--'}
            hint="unidades disponibles"
            tone="green"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Productos Criticos"
            value={data?.kpis?.productosCriticos ?? '--'}
            hint="stock <= punto pedido"
            tone="red"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Alertas VOP"
            value={data?.kpis?.alertasVop ?? '--'}
            hint="reposiciones activas"
            tone="amber"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Lead Time Promedio"
            value={data?.kpis?.tiempoPromedioEntrega ?? '--'}
            hint="dias"
            tone="ink"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="OC Pendientes"
            value={data?.kpis?.ordenesPendientes ?? '--'}
            hint="por aprobar o revisar"
            tone="amber"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Valor OC"
            value={`S/ ${Number(data?.kpis?.valorOrdenes || 0).toFixed(2)}`}
            hint="total acumulado en periodo"
            tone="green"
          />
        </div>
      </section>

      <section className="row g-3">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-uppercase small text-secondary mb-2">Proveedor sugerido</div>
              {data?.resumen?.topSupplier ? (
                <>
                  <h2 className="h5 mb-2">{data.resumen.topSupplier.nombre}</h2>
                  <div className="muted-sm mb-1">Calificación: {data.resumen.topSupplier.calificacion.toFixed(1)} / 5</div>
                  <div className="muted-sm">Lead time: {data.resumen.topSupplier.leadTimePromedio} días</div>
                </>
              ) : (
                <p className="text-secondary mb-0">Sin datos suficientes para sugerir un proveedor.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-uppercase small text-secondary mb-2">Estado OC</div>
              <Bar data={statusData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Nivel de stock por categoria</h2>
              <Bar data={barData} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Evolucion de alertas VOP (30 dias)</h2>
              <Line data={lineData} />
            </div>
          </div>
        </div>
      </section>

      <section className="data-table-card">
        <h2 className="h5 mb-3">Ordenes de compra recientes</h2>
        <div className="table-responsive">
          <table className="table table-hover align-middle table-custom">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>Almacen</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.ordenes ?? []).map((oc) => (
                  <tr key={oc.idOrdenCompra}>
                    <td>{oc.nroOrden}</td>
                    <td>{oc.proveedor?.nombre}</td>
                    <td>{new Date(oc.fechaOrden).toLocaleDateString()}</td>
                    <td>Central</td>
                    <td>
                      <span className={`badge text-bg-${oc.estado === 'pendiente' ? 'warning' : oc.estado === 'rechazada' ? 'danger' : 'success'}`}>
                        {oc.estado}
                      </span>
                    </td>
                    <td>S/ {Number(oc.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </section>
    </div>
  );
}
