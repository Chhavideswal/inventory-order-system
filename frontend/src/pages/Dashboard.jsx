import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="grid grid-cols-3">
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package color="var(--primary-color)" size={32} />
            <div>
              <div className="label">Total Products</div>
              <div className="value">{stats.total_products}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users color="var(--secondary-color)" size={32} />
            <div>
              <div className="label">Total Customers</div>
              <div className="value">{stats.total_customers}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingCart color="var(--success-color)" size={32} />
            <div>
              <div className="label">Total Orders</div>
              <div className="value">{stats.total_orders}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle color="var(--danger-color)" />
          Low Stock Alerts
        </h2>
        
        <div className="glass-panel data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Stock Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className="badge badge-danger">Critical</span>
                  </td>
                </tr>
              ))}
              {stats.low_stock_products.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Inventory levels are healthy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
