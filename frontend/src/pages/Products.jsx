import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', stock: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get('/products/');
    setProducts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/', formData);
      setShowModal(false);
      setFormData({ name: '', sku: '', price: '', stock: '' });
      fetchProducts();
    } catch (err) {
      alert('Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Products Directory</h1>
        <button className="btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{p.sku}</span></td>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${p.stock < 10 ? 'badge-danger' : 'badge-success'}`}>
                    {p.stock} units
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDelete(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Add New Product</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Product Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>SKU Code</label>
                <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Unit Price ($)</label>
                <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Initial Stock</label>
                <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
