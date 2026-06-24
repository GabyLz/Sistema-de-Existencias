const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('sge_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Error de comunicacion con API');
  }

  return data;
}

export const api = {
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  dashboard: () => request('/dashboard'),
  products: () => request('/products'),
  createProduct: (payload) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: (id, payload) =>
    request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  inactivateProduct: (id) =>
    request(`/products/${id}/inactivar`, {
      method: 'PATCH',
    }),
  suppliers: () => request('/suppliers'),
  createSupplier: (payload) =>
    request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSupplier: (id, payload) =>
    request(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  inactivateSupplier: (id) =>
    request(`/suppliers/${id}/inactivar`, {
      method: 'PATCH',
    }),
  orders: () => request('/reports/movements'),
  createPurchaseOrder: (payload) =>
    request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateOrderStatus: (id, payload) =>
    request(`/purchase-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  receiveOrder: (payload) =>
    request('/purchase-orders/receive', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  assignSupplierProduct: (payload) =>
    request('/suppliers/product', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  purchaseOrders: () => request('/purchase-orders'),
  stockPdf: async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/reports/stock/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Error descargando PDF');
    const blob = await res.blob();
    return blob;
  },
  criticalPdf: async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/reports/critical/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Error descargando PDF');
    const blob = await res.blob();
    return blob;
  },
  movementsPdf: async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/reports/movements/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Error descargando PDF');
    return res.blob();
  },
  suppliersPdf: async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/reports/suppliers/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Error descargando PDF');
    return res.blob();
  },
  auditPdf: async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/reports/audit/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Error descargando PDF');
    return res.blob();
  },
  sendReport: (payload) =>
    request('/reports/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  stockReport: () => request('/reports/stock'),
  criticalReport: () => request('/reports/critical'),
  movementsReport: () => request('/reports/movements'),
  users: () => request('/users'),
  parametros: () => request('/parametros'),
  updateParametros: (payload) =>
    request('/parametros', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
