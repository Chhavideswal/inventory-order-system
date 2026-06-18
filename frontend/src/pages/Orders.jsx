import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [resOrders, resCustomers, resProducts] = await Promise.all([
      api.get('/orders/'),
      api.get('/customers/'),
      api.get('/products/')
    ]);
    setOrders(resOrders.data);
    setCustomers(resCustomers.data);
    setProducts(resProducts.data);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }
    
    // Filter out incomplete items
    const validItems = orderItems
      .filter(item => item.product_id && item.quantity > 0)
      .map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }));
      
    if (validItems.length === 0) {
      alert("Please add at least one valid product");
      return;
    }

    try {
      await api.post('/orders/', {
        customer_id: parseInt(selectedCustomer),
        items: validItems
      });
      setShowModal(false);
      setSelectedCustomer('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving order');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure? This will restore stock levels.')) {
      await api.delete(`/orders/${id}`);
      fetchData();
    }
  };

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Unknown';
  };

  // Subtotal calculation for modal
  const currentTotal = orderItems.reduce((acc, item) => {
    if (!item.product_id) return acc;
    const p = products.find(p => p.id === parseInt(item.product_id));
    if (!p) return acc;
    return acc + (p.price * item.quantity);
  }, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Order Planner</h1>
        <button className="btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Order
        </button>
      </div>

      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td><span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)' }}>#{o.id}</span></td>
                <td>{getCustomerName(o.customer_id)}</td>
                <td><strong style={{ color: 'var(--success-color)' }}>${o.total_amount.toFixed(2)}</strong></td>
                <td>{o.items.length} items</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDelete(o.id)}>
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
          <div className="glass-panel modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Create New Order</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Select Customer</label>
                <select 
                  required 
                  value={selectedCustomer} 
                  onChange={e => setSelectedCustomer(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--glass-border)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Choose a Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order Items</label>
                  <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={handleAddItem}>
                    + Add Row
                  </button>
                </div>
                
                {orderItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select
                      value={item.product_id}
                      onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--glass-border)',
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-main)'
                      }}
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock === 0}>
                          {p.name} - ${p.price} ({p.stock} in stock)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      style={{
                        width: '80px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--glass-border)',
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-main)'
                      }}
                    />
                    <button type="button" className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleRemoveItem(index)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                  ${currentTotal.toFixed(2)}
                </span>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Confirm Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
