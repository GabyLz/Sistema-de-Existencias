import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const menu = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', roles: ['administrador', 'gerente'] },
  { to: '/productos', label: 'Productos', icon: 'box', roles: ['administrador', 'gerente', 'compras', 'almacen'] },
  { to: '/proveedores', label: 'Proveedores', icon: 'truck', roles: ['administrador', 'gerente', 'compras'] },
  { to: '/compras', label: 'Compras', icon: 'cart', roles: ['administrador', 'gerente', 'compras'] },
  { to: '/inventario', label: 'Inventario', icon: 'inventory', roles: ['administrador', 'gerente', 'almacen'] },
  { to: '/parametros', label: 'Parametros', icon: 'cog', roles: ['administrador', 'gerente'] },
  { to: '/reportes', label: 'Reportes', icon: 'chart', roles: ['administrador', 'gerente', 'compras', 'almacen'] },
  { to: '/roles', label: 'Roles', icon: 'shield', roles: ['administrador', 'gerente', 'compras', 'almacen'] },
  { to: '/usuarios', label: 'Usuarios', icon: 'users', roles: ['administrador'] },
];

const icons = {
  dashboard: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.95"/><rect x="13" y="3" width="8" height="4" rx="1.5" fill="currentColor" opacity="0.65"/><rect x="13" y="9" width="8" height="12" rx="1.5" fill="currentColor" opacity="0.3"/></svg>),
  box: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" fill="currentColor" opacity="0.95"/><path d="M12 3v14" stroke="white" strokeOpacity="0.12"/></svg>),
  truck: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="14" height="10" rx="1.5" fill="currentColor" opacity="0.95"/><rect x="15" y="7" width="6" height="6" rx="1" fill="currentColor" opacity="0.5"/></svg>),
  cart: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h2l1 9h11l3-6H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="20" r="1" fill="currentColor"/><circle cx="18" cy="20" r="1" fill="currentColor"/></svg>),
  inventory: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" opacity="0.95"/><path d="M7 9h10" stroke="white" strokeOpacity="0.25"/></svg>),
  cog: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="currentColor" opacity="0.9"/><path d="M19.4 15a1 1 0 0 0 .2 1.1l.9.9a1 1 0 0 1-1.4 1.4l-.9-.9a1 1 0 0 0-1.1-.2 6 6 0 0 1-1.6.9 1 1 0 0 0-.6 1v1.2a1 1 0 0 1-2 0V19a1 1 0 0 0-.6-1 6 6 0 0 1-1.6-.9 1 1 0 0 0-1.1.2l-.9.9A1 1 0 0 1 2.5 17l.9-.9a1 1 0 0 0 .2-1.1 6 6 0 0 1-.9-1.6 1 1 0 0 0-1-.6H2.5a1 1 0 0 1 0-2H4a1 1 0 0 0 1-.6 6 6 0 0 1 .9-1.6 1 1 0 0 0-.2-1.1L4 3.6A1 1 0 0 1 5.4 2.2l.9.9a1 1 0 0 0 1.1.2 6 6 0 0 1 1.6-.9A1 1 0 0 0 10 1V-.2a1 1 0 0 1 2 0V1a1 1 0 0 0 .6 1 6 6 0 0 1 1.6.9 1 1 0 0 0 1.1-.2l.9-.9A1 1 0 0 1 21.5 3l-.9.9a1 1 0 0 0-.2 1.1 6 6 0 0 1 .9 1.6 1 1 0 0 0 1 .6h1.5a1 1 0 0 1 0 2h-1.5a1 1 0 0 0-1 .6 6 6 0 0 1-.9 1.6z" fill="currentColor" opacity="0.6"/></svg>),
  chart: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 14v4M12 10v8M17 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  shield: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l7 3v5c0 5-5 9-7 9s-7-4-7-9V6l7-3z" fill="currentColor" opacity="0.95"/></svg>),
  users: (<svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM6 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" fill="currentColor" opacity="0.95"/><path d="M2 20a6 6 0 0 1 12 0" fill="currentColor" opacity="0.15"/></svg>),
};

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userRef = useRef();
  useEffect(() => {
    function handleDoc(e) {
      if (userRef.current && !userRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', handleDoc);
    return () => document.removeEventListener('click', handleDoc);
  }, []);
  const visibleMenu = menu.filter((item) => !item.roles?.length || item.roles.includes(user?.rol));

  return (
    <div className="app-shell">
      <aside className="sge-sidebar">
        <div className="sidebar-brand">
          <div className="logo">LG</div>
          <div>
            <div className="brand-text">LEADGEN</div>
            <div className="muted-tagline">Encuentra · Conecta · Cierra</div>
          </div>
        </div>

        <nav className="d-flex flex-column gap-2">
          {visibleMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `menu-link ${isActive ? 'menu-link-active' : ''}`
              }
            >
              <span aria-hidden>{icons[item.icon]}</span>
              <span className="label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-section">
          <div className="small text-light mb-2">Sistema</div>
          <div className="small text-light">Versión 1.2.14</div>
        </div>
      </aside>

      <main className="sge-main">
        <header className="sge-topbar">
          <div />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="topbar-user" ref={userRef}>
              <div className="avatar avatar-rect" onClick={() => setMenuOpen((s) => !s)}>
                {user ? `${(user.nombres || '').charAt(0)}${(user.apellidos || '').charAt(0)}` : 'U'}
              </div>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="item">Perfil</div>
                  <div className="item">Configuración</div>
                  <div
                    className="item logout"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    Cerrar sesión
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
