import { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [loading, setLoading] = useState(false);

  return (
    <div className="login-page">
      <div className="login-card card shadow-lg border-0">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 mb-2">Sistema SGE</h1>
          <p className="text-secondary mb-4">
            Control logístico, compras e inventario con trazabilidad completa.
          </p>

          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input
              className="form-control"
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              placeholder="admin"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="********"
            />
          </div>

          <button
            className="btn btn-sge w-100"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await login(form.usuario, form.password);
                navigate('/');
              } catch (error) {
                await Swal.fire('Acceso denegado', error.message, 'error');
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  );
}
