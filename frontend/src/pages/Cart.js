import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Cart({ cart, user, removeFromCart, clearCart }) {
  const navigate = useNavigate();
  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [availableModes, setAvailableModes] = useState(['pickup', 'delivery']);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  useEffect(() => {
    if (cart.length > 0) {
      const fetchRestaurantModes = async () => {
        try {
          const res = await axios.get(`http://localhost:3000/restaurants/${cart[0].restaurantId}`);
          setAvailableModes(res.data.available_modes || ['pickup', 'delivery']);
          // If pickup is not available but delivery is, default to delivery
          if (res.data.available_modes && !res.data.available_modes.includes('pickup') && res.data.available_modes.includes('delivery')) {
            setDeliveryMode('delivery');
          }
        } catch (err) {
          console.error("Error fetching modes:", err);
        }
      };
      fetchRestaurantModes();
    }
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("PLEASE LOGIN TO PLACE AN ORDER");
      return;
    }
    if (cart.length === 0) {
      alert("YOUR CART IS EMPTY");
      return;
    }

    try {
      const orderData = {
        user_id: user._id,
        restaurant_id: cart[0].restaurantId,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total_price: totalPrice,
        delivery_mode: deliveryMode,
        status: 'pending'
      };

      await axios.post('http://localhost:3000/orders', orderData);
      alert("ORDER PLACED SUCCESSFULLY!");
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error("Error placing order:", error);
      alert("FAILED TO PLACE ORDER");
    }
  };

  return (
    <div>
      <h1>YOUR CART</h1>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p>YOUR CART IS EMPTY</p>
          <button className="button" onClick={() => navigate('/')}>BROWSE RESTAURANTS</button>
        </div>
      ) : (
        <>
          <div className="menu-list">
            {cart.map(item => (
              <div key={item._id} className="menu-item">
                <div>
                  <h3>{item.name} x {item.quantity}</h3>
                  <button 
                    style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
                    onClick={() => removeFromCart(item._id)}
                  >
                    REMOVE
                  </button>
                </div>
                <div style={{ fontWeight: 900 }}>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3>SELECT ORDER MODE</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {availableModes.includes('pickup') && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', border: `2px solid ${deliveryMode === 'pickup' ? 'var(--primary-color)' : '#eee'}`, borderRadius: '4px' }}>
                  <input type="radio" name="mode" value="pickup" checked={deliveryMode === 'pickup'} onChange={(e) => setDeliveryMode(e.target.value)} />
                  PICKUP
                </label>
              )}
              {availableModes.includes('delivery') && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', border: `2px solid ${deliveryMode === 'delivery' ? 'var(--primary-color)' : '#eee'}`, borderRadius: '4px' }}>
                  <input type="radio" name="mode" value="delivery" checked={deliveryMode === 'delivery'} onChange={(e) => setDeliveryMode(e.target.value)} />
                  DELIVERY
                </label>
              )}
            </div>
            {deliveryMode === 'delivery' && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Delivery will be sent to your registered address: <strong>{user.address}</strong>
              </p>
            )}
          </div>

          <div className="cart-total">
            TOTAL: ${totalPrice.toFixed(2)}
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'right' }}>
            <button className="button button-outline" onClick={clearCart} style={{ marginRight: '1rem' }}>CLEAR CART</button>
            <button className="button" onClick={handlePlaceOrder}>PLACE ORDER</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;