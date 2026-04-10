import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

function RestaurantOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [restaurantData, setRestaurantData] = useState(null);
  const [analytics, setAnalytics] = useState({ sales: null, topItems: [] });
  const [trendData, setTrendData] = useState([]);
  const [period, setPeriod] = useState('daily'); // daily, weekly, monthly
  const [activeTab, setActiveTab] = useState('orders'); // orders, menu, analytics, charts, settings

  useEffect(() => {
    if (user && user.restaurant_id) {
      fetchOrders();
      fetchMenu();
      fetchAnalytics();
      fetchTrend();
      fetchRestaurantData();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.restaurant_id && activeTab === 'charts') {
      fetchTrend();
    }
  }, [period, activeTab]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/orders/restaurant/${user.restaurant_id}`);
      setOrders(res.data.reverse());
    } catch (err) { console.error(err); }
  };

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/restaurants/${user.restaurant_id}`);
      setMenu(res.data.menu);
    } catch (err) { console.error(err); }
  };

  const fetchRestaurantData = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/restaurants/${user.restaurant_id}`);
      setRestaurantData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAnalytics = async () => {
    try {
      const [salesRes, itemsRes] = await Promise.all([
        axios.get(`http://localhost:3000/analytics/sales/${user.restaurant_id}`),
        axios.get(`http://localhost:3000/analytics/most-ordered-items/${user.restaurant_id}`)
      ]);
      setAnalytics({ sales: salesRes.data, topItems: itemsRes.data });
    } catch (err) { console.error(err); }
  };

  const fetchTrend = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/analytics/sales-trend/${user.restaurant_id}?period=${period}`);
      setTrendData(res.data);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchAnalytics();
      fetchTrend();
    } catch (err) { console.error(err); }
  };

  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
  const [editingItem, setEditingItem] = useState(null);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/restaurants/${user.restaurant_id}/menu`, newItem);
      setNewItem({ name: '', price: '', description: '' });
      fetchMenu();
    } catch (err) { console.error(err); }
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/restaurants/${user.restaurant_id}/menu/${editingItem._id}`, editingItem);
      setEditingItem(null);
      fetchMenu();
    } catch (err) { console.error(err); }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("DELETE THIS ITEM?")) return;
    try {
      await axios.delete(`http://localhost:3000/restaurants/${user.restaurant_id}/menu/${itemId}`);
      fetchMenu();
    } catch (err) { console.error(err); }
  };

  const toggleMode = async (mode) => {
    const currentModes = restaurantData.available_modes || [];
    let newModes;
    if (currentModes.includes(mode)) {
      if (currentModes.length === 1) {
        alert("AT LEAST ONE MODE MUST BE ENABLED");
        return;
      }
      newModes = currentModes.filter(m => m !== mode);
    } else {
      newModes = [...currentModes, mode];
    }

    try {
      const res = await axios.put(`http://localhost:3000/restaurants/${user.restaurant_id}/modes`, { available_modes: newModes });
      setRestaurantData(res.data);
    } catch (err) {
      console.error(err);
      alert("FAILED TO UPDATE MODES");
    }
  };

  const menuUrl = `${window.location.origin}/restaurant/${user.restaurant_id}`;

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`button ${activeTab === 'orders' ? '' : 'button-outline'}`} onClick={() => setActiveTab('orders')}>ORDERS</button>
        <button className={`button ${activeTab === 'menu' ? '' : 'button-outline'}`} onClick={() => setActiveTab('menu')}>MANAGE MENU</button>
        <button className={`button ${activeTab === 'analytics' ? '' : 'button-outline'}`} onClick={() => setActiveTab('analytics')}>DASHBOARD</button>
        <button className={`button ${activeTab === 'charts' ? '' : 'button-outline'}`} onClick={() => setActiveTab('charts')}>CHART</button>
        <button className={`button ${activeTab === 'settings' ? '' : 'button-outline'}`} onClick={() => setActiveTab('settings')}>SETTINGS</button>
      </div>

      {activeTab === 'orders' && (
        <div className="restaurant-grid">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 900 }}>ORDER #{order._id.slice(-6)}</span>
                <span className="status-badge" style={{ background: order.delivery_mode === 'delivery' ? '#e67e22' : '#f1c40f', color: '#fff' }}>
                  {order.delivery_mode ? order.delivery_mode.toUpperCase() : 'PICKUP'}
                </span>
                <span className="status-badge">{order.status}</span>
              </div>
              <p>Customer: {order.user_id.name}</p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>{order.delivery_mode === 'delivery' ? `Delivery to: ${order.user_id.address}` : 'Pickup at Cafeteria'}</p>
              <hr />
              {order.items.map((item, idx) => (
                <div key={idx}>{item.name} x {item.quantity}</div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {order.status === 'pending' && (
                  <>
                    <button className="button" style={{ padding: '0.5rem' }} onClick={() => updateStatus(order._id, 'preparing')}>START PREPARING</button>
                    <button className="button button-outline" style={{ padding: '0.5rem' }} onClick={() => updateStatus(order._id, 'cancelled')}>CANCEL</button>
                  </>
                )}
                {order.status === 'preparing' && (
                  <button className="button" style={{ padding: '0.5rem', background: '#27ae60' }} onClick={() => updateStatus(order._id, 'delivered')}>DELIVER / READY</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'menu' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
          {editingItem ? (
            <>
              <h2>EDIT ITEM</h2>
              <form onSubmit={handleUpdateMenuItem} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input type="text" placeholder="NAME" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required className="input" style={{ padding: '0.8rem', border: '1px solid #ddd' }} />
                <input type="number" placeholder="PRICE" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} required className="input" style={{ padding: '0.8rem', border: '1px solid #ddd' }} />
                <input type="text" placeholder="DESCRIPTION" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="input" style={{ padding: '0.8rem', border: '1px solid #ddd' }} />
                <button type="submit" className="button">SAVE</button>
                <button type="button" className="button button-outline" onClick={() => setEditingItem(null)}>CANCEL</button>
              </form>
            </>
          ) : (
            <>
              <h2>ADD NEW ITEM</h2>
              <form onSubmit={handleAddMenuItem} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input type="text" placeholder="NAME" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required className="input" style={{ padding: '0.8rem', border: '1px solid #ddd' }} />
                <input type="number" placeholder="PRICE" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required className="input" style={{ padding: '0.8rem', border: '1px solid #ddd' }} />
                <input type="text" placeholder="DESCRIPTION" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="input" style={{ padding: '0.8rem', border: '1px solid #ddd' }} />
                <button type="submit" className="button">ADD</button>
              </form>
            </>
          )}
          <hr />
          <h2>CURRENT MENU</h2>
          {menu.map(item => (
            <div key={item._id} className="menu-item">
              <div>
                <strong>{item.name}</strong> - ${item.price}
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{item.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="button button-outline" onClick={() => setEditingItem(item)}>EDIT</button>
                <button className="button button-outline" style={{ color: 'red', borderColor: 'red' }} onClick={() => handleDeleteMenuItem(item._id)}>DELETE</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && analytics.sales && (
        <div>
          <div className="analytics-grid">
            <div className="analytic-card">
              <p>TOTAL SALES</p>
              <div className="value">${analytics.sales.totalSales.toFixed(2)}</div>
            </div>
            <div className="analytic-card">
              <p>TOTAL ORDERS</p>
              <div className="value">{analytics.sales.orderCount}</div>
            </div>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <h2>TOP SELLING ITEMS</h2>
            <table style={{ width: '100%' }}>
              <thead><tr><th>ITEM</th><th>QUANTITY</th><th>REVENUE</th></tr></thead>
              <tbody>
                {analytics.topItems.map(item => (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>{item.totalQuantity}</td>
                    <td>${item.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>SALES PERFORMANCE</h2>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '2px solid var(--primary-color)', fontWeight: 'bold' }}
            >
              <option value="daily">DAILY</option>
              <option value="weekly">WEEKLY</option>
              <option value="monthly">MONTHLY</option>
            </select>
          </div>
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="_id" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="totalSales" stroke="#d35400" fill="#f39c12" fillOpacity={0.6} strokeWidth={4} activeDot={{ r: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="analytic-card" style={{ textAlign: 'left' }}>
              <p>PERIOD TOTAL REVENUE</p>
              <div className="value" style={{ fontSize: '1.8rem' }}>${trendData.reduce((acc, curr) => acc + curr.totalSales, 0).toFixed(2)}</div>
            </div>
            <div className="analytic-card" style={{ textAlign: 'left' }}>
              <p>PERIOD TOTAL ORDERS</p>
              <div className="value" style={{ fontSize: '1.8rem' }}>{trendData.reduce((acc, curr) => acc + curr.orderCount, 0)}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && restaurantData && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
          <h2>RESTAURANT SETTINGS</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', marginTop: '2rem' }}>
            <div>
              <h3>AVAILABLE ORDER MODES</h3>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>Select which modes are available for your cafeteria.</p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div 
                  onClick={() => toggleMode('pickup')}
                  style={{ 
                    flex: 1, padding: '2rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                    border: `3px solid ${(restaurantData.available_modes || []).includes('pickup') ? 'var(--primary-color)' : '#eee'}`,
                    background: (restaurantData.available_modes || []).includes('pickup') ? '#fff9f5' : '#fff'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>PICKUP</div>
                  <span style={{ color: (restaurantData.available_modes || []).includes('pickup') ? 'green' : '#999', fontWeight: 'bold' }}>
                    {(restaurantData.available_modes || []).includes('pickup') ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div 
                  onClick={() => toggleMode('delivery')}
                  style={{ 
                    flex: 1, padding: '2rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                    border: `3px solid ${(restaurantData.available_modes || []).includes('delivery') ? 'var(--primary-color)' : '#eee'}`,
                    background: (restaurantData.available_modes || []).includes('delivery') ? '#fff9f5' : '#fff'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>DELIVERY</div>
                  <span style={{ color: (restaurantData.available_modes || []).includes('delivery') ? 'green' : '#999', fontWeight: 'bold' }}>
                    {(restaurantData.available_modes || []).includes('delivery') ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #eee', paddingLeft: '3rem', textAlign: 'center' }}>
              <h3>YOUR MENU QR CODE</h3>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Display this at your cafeteria for instant ordering.</p>
              <div style={{ background: '#fff', padding: '1.5rem', border: '1px solid #eee', display: 'inline-block', borderRadius: '8px' }}>
                <QRCodeSVG value={menuUrl} size={150} />
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: '#888', wordBreak: 'break-all' }}>{menuUrl}</p>
              <button className="button" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => window.print()}>PRINT QR CODE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantOrders;