import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/orders/user/${user._id}`);
      setOrders(response.data.reverse()); // Show newest first
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO CANCEL THIS ORDER?")) return;
    try {
      await axios.delete(`http://localhost:3000/orders/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  if (!user) return <div>PLEASE LOG IN TO SEE YOUR ORDERS</div>;

  return (
    <div>
      <h1>ORDER HISTORY</h1>
      {orders.length === 0 ? (
        <p>NO ORDERS FOUND</p>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>ORDER #{order._id.slice(-6)}</span>
                  <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>{new Date(order.order_date).toLocaleString()}</div>
                </div>
                <div>
                  <span className="status-badge">{order.status}</span>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <span style={{ fontWeight: 900 }}>TOTAL: ${order.total_price.toFixed(2)}</span>
                {order.status === 'pending' && (
                  <button className="button button-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => cancelOrder(order._id)}>CANCEL ORDER</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
