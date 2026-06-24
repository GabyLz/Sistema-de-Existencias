import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { api } from '../lib/api';
import { ViewGuideAccordion } from '../components/ViewGuideAccordion';

export function ParametersPage() {
  const [form, setForm] = useState({
    nivelServicio: 95,
    costoPedido: 0,
    costoAlmacenamiento: 0,
    umbralMinimoOc: 0,
    diasLaborales: 365,
  });

  useEffect(() => {
    api.parametros().then((p) => {
      setForm({
        nivelServicio: p.nivelServicio,
        costoPedido: Number(p.costoPedido),
        costoAlmacenamiento: Number(p.costoAlmacenamiento),
        umbralMinimoOc: Number(p.umbralMinimoOc),
        diasLaborales: p.diasLaborales,
      });
    });
  }, []);

  return (
    <div>
      <ViewGuideAccordion
        title="¿Qué hace esta vista?"
        description="Configura los parámetros logísticos globales que alimentan VOP, punto de pedido y stock de seguridad."
        bullets={[
          'Ajusta nivel de servicio, costos Cg y Cp y umbral mínimo de OC.',
          'Impacta directamente en los cálculos automáticos del sistema.',
        ]}
      />

      <div className="data-table-card mt-3">
        <h2 className="h5 mb-3">Parametros Logisticos</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Nivel de servicio (%)</label>
            <select
              className="form-select"
              value={form.nivelServicio}
              onChange={(e) =>
                setForm({ ...form, nivelServicio: Number(e.target.value) })
              }
            >
              <option value={90}>90</option>
              <option value={95}>95</option>
              <option value={98}>98</option>
              <option value={99}>99</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Costo pedido (Cg)</label>
            <input
              className="form-control"
              type="number"
              value={form.costoPedido}
              onChange={(e) => setForm({ ...form, costoPedido: Number(e.target.value) })}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Costo almacenamiento (Cp)</label>
            <input
              className="form-control"
              type="number"
              value={form.costoAlmacenamiento}
              onChange={(e) =>
                setForm({ ...form, costoAlmacenamiento: Number(e.target.value) })
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Umbral minimo OC</label>
            <input
              className="form-control"
              type="number"
              value={form.umbralMinimoOc}
              onChange={(e) =>
                setForm({ ...form, umbralMinimoOc: Number(e.target.value) })
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Dias laborales</label>
            <input
              className="form-control"
              type="number"
              value={form.diasLaborales}
              onChange={(e) => setForm({ ...form, diasLaborales: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="col-12 mt-3">
          <button
            className="btn btn-sge"
            onClick={async () => {
              await api.updateParametros(form);
              await Swal.fire('Guardado', 'Parametros actualizados correctamente.', 'success');
            }}
          >
            Guardar parametros
          </button>
        </div>
      </div>
    </div>
  );
}
