import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await api.get('/customers/');
    setCustomers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers/', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (err) {
      alert('Error saving customer');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Customer Management</h1>
        <button className="btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone || 'N/A'}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDelete(c.id)}>
                    <Trash2 size={16} />
                  </button>
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
              <h3>Register Customer</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
