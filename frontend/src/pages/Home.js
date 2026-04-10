import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisine, setCuisine] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [cuisine, foodSearch]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/restaurants?cuisine=${cuisine}&foodSearch=${foodSearch}`);
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1>CAFETERIAS</h1>
          <div style={{ display: 'flex', gap: '1rem', flexGrow: 1, maxWidth: '500px' }}>
            <input 
              type="text" 
              placeholder="SEARCH FOR FOOD (e.g. Burger, Sushi)..." 
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              style={{ flexGrow: 1, padding: '0.8rem', borderRadius: '8px', border: '2px solid #d35400' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className={`button ${cuisine === '' ? '' : 'button-outline'}`} onClick={() => setCuisine('')}>ALL CUISINES</button>
          <button className={`button ${cuisine === 'American' ? '' : 'button-outline'}`} onClick={() => setCuisine('American')}>AMERICAN</button>
          <button className={`button ${cuisine === 'Japanese' ? '' : 'button-outline'}`} onClick={() => setCuisine('Japanese')}>JAPANESE</button>
          <button className={`button ${cuisine === 'Italian' ? '' : 'button-outline'}`} onClick={() => setCuisine('Italian')}>ITALIAN</button>
        </div>
      </div>
      
      {restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
          <h3>NO FOOD FOUND MATCHING "{foodSearch}"</h3>
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map(restaurant => (
            <div key={restaurant._id} className="card" onClick={() => navigate(`/restaurant/${restaurant._id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3>{restaurant.name}</h3>
                <div style={{ display: 'flex', gap: '0.3rem', fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>
                  {(restaurant.available_modes || []).includes('pickup') && <span>PICKUP</span>}
                  {(restaurant.available_modes || []).includes('delivery') && <span>DELIVERY</span>}
                </div>
              </div>
              <p className="status-badge" style={{ marginBottom: '1rem' }}>{restaurant.cuisine}</p>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <strong>MENU PREVIEW:</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                  {restaurant.menu.slice(0, 3).map((item, i) => (
                    <li key={i}>{item.name} - ${item.price}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
