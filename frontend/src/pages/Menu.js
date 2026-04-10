import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Menu({ addToCart }) {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/restaurants/${id}`);
        setRestaurant(response.data);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (!restaurant) return <div>LOADING...</div>;

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <button className="button button-outline" onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>BACK TO RESTAURANTS</button>
        <h1>{restaurant.name}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <p className="status-badge">{restaurant.cuisine}</p>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            {(restaurant.available_modes || []).includes('pickup') && <span style={{ marginRight: '0.5rem' }}>🥡 PICKUP</span>}
            {(restaurant.available_modes || []).includes('delivery') && <span>🚚 DELIVERY</span>}
          </div>
        </div>
      </div>

      <div className="menu-list">
        {restaurant.menu.map(item => (
          <div key={item._id} className="menu-item">
            <div>
              <h3>{item.name}</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{item.description}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>${item.price.toFixed(2)}</div>
              <button className="button" onClick={() => addToCart(item, restaurant._id)}>ADD TO CART</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;
