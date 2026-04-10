import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { QRCodeSVG } from "qrcode.react";

const COLORS = ["#d35400", "#f39c12", "#e67e22", "#f1c40f", "#e74c3c"];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [analytics, setAnalytics] = useState({
    salesPerRest: [],
    topItems: [],
    globalAvg: null,
    salesTrend: [],
  });
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null); // For QR Modal
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [newRest, setNewRest] = useState({
    name: "",
    cuisine: "",
    staffName: "",
    staffEmail: "",
    staffPassword: "",
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    address: "",
    phone: "",
    restaurant_id: "",
  });

  useEffect(() => {
    fetchAnalytics();
    fetchRestaurants();
    fetchUsers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [salesRes, itemsRes, avgRes, trendRes] = await Promise.all([
        axios.get("http://localhost:3000/analytics/sales-per-restaurant"),
        axios.get("http://localhost:3000/analytics/most-ordered-items"),
        axios.get("http://localhost:3000/analytics/average-order-value"),
        axios.get("http://localhost:3000/analytics/sales-trend"),
      ]);
      setAnalytics({
        salesPerRest: salesRes.data || [],
        topItems: itemsRes.data || [],
        globalAvg: avgRes.data || { avgOrderValue: 0 },
        salesTrend: trendRes.data || [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:3000/restaurants");
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      // Direct window location for backup to bypass blob issues
      window.location.href = "http://localhost:3000/analytics/backup";
      setTimeout(() => alert("BACKUP DOWNLOAD STARTED"), 500);
    } catch (err) {
      console.error("Backup failed:", err);
      alert("BACKUP FAILED: CHECK SERVER CONNECTION");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      const restRes = await axios.post("http://localhost:3000/restaurants", {
        name: newRest.name,
        cuisine: newRest.cuisine,
      });

      if (newRest.staffEmail && newRest.staffPassword) {
        await axios.post("http://localhost:3000/users/register", {
          name: newRest.staffName || `${newRest.name} Staff`,
          email: newRest.staffEmail,
          password: newRest.staffPassword,
          role: "restaurant",
          restaurant_id: restRes.data._id,
          address: "Cafeteria Location",
          phone: "N/A",
        });
      }

      setNewRest({
        name: "",
        cuisine: "",
        staffName: "",
        staffEmail: "",
        staffPassword: "",
      });
      fetchRestaurants();
      fetchUsers();
      alert("Cafeteria and Staff account created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating cafeteria/staff");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/users/register", newUser);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
        address: "",
        phone: "",
        restaurant_id: "",
      });
      fetchUsers();
      alert("User credentials registered!");
    } catch (err) {
      console.error(err);
      alert("Error registering user");
    }
  };

  const getMenuUrl = (id) => `${window.location.origin}/restaurant/${id}`;

  return (
    <div className="container">
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          className={`button ${activeTab === "analytics" ? "" : "button-outline"}`}
          onClick={() => setActiveTab("analytics")}
        >
          ANALYTICS
        </button>
        <button
          className={`button ${activeTab === "restaurants" ? "" : "button-outline"}`}
          onClick={() => setActiveTab("restaurants")}
        >
          CAFETERIAS
        </button>
        <button
          className={`button ${activeTab === "users" ? "" : "button-outline"}`}
          onClick={() => setActiveTab("users")}
        >
          USERS
        </button>
      </div>

      {activeTab === "analytics" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ margin: 0 }}>SYSTEM PERFORMANCE</h2>
            <button
              className="button"
              onClick={handleBackup}
              disabled={isBackingUp}
              style={{ background: "#27ae60" }}
            >
              {isBackingUp
                ? "PREPARING BACKUP..."
                : "DOWNLOAD SYSTEM BACKUP (JSON)"}
            </button>
          </div>

          <div className="analytics-grid">
            <div className="analytic-card">
              <p>AVG ORDER VALUE</p>
              <div className="value">
                ${analytics.globalAvg?.avgOrderValue?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div
              className="analytic-card"
              style={{ borderTop: "4px solid #f39c12" }}
            >
              <p>TOTAL ORDERS (7D)</p>
              <div className="value" style={{ color: "#f39c12" }}>
                {analytics.salesTrend?.reduce(
                  (acc, curr) => acc + curr.orderCount,
                  0,
                ) || 0}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "3rem" }}>
            <h3>7-DAY SALES TREND</h3>
            <div
              style={{
                height: "300px",
                width: "100%",
                background: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="totalSales"
                    stroke="#d35400"
                    fill="#f39c12"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "2rem",
              marginTop: "2rem",
            }}
          >
            <div>
              <h3>SALES BY CAFETERIA</h3>
              <div
                style={{
                  height: "300px",
                  width: "100%",
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.salesPerRest}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="restaurantName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalSales" fill="#d35400" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3>TOP ITEMS (GLOBAL)</h3>
              <div
                style={{
                  height: "300px",
                  width: "100%",
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.topItems}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="totalQuantity"
                      nameKey="_id"
                    >
                      {analytics.topItems.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "restaurants" && (
        <div className="card" style={{ padding: "2rem" }}>
          <h2>ADD NEW CAFETERIA</h2>
          <form
            onSubmit={handleAddRestaurant}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <input
              type="text"
              placeholder="CAFETERIA NAME"
              value={newRest.name}
              onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
              required
              className="input"
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              placeholder="CUISINE"
              value={newRest.cuisine}
              onChange={(e) =>
                setNewRest({ ...newRest, cuisine: e.target.value })
              }
              required
              className="input"
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              placeholder="STAFF NAME"
              value={newRest.staffName}
              onChange={(e) =>
                setNewRest({ ...newRest, staffName: e.target.value })
              }
              className="input"
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="email"
              placeholder="STAFF EMAIL"
              value={newRest.staffEmail}
              onChange={(e) =>
                setNewRest({ ...newRest, staffEmail: e.target.value })
              }
              className="input"
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="password"
              placeholder="STAFF PASSWORD"
              value={newRest.staffPassword}
              onChange={(e) =>
                setNewRest({ ...newRest, staffPassword: e.target.value })
              }
              className="input"
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <button
              type="submit"
              className="button"
              style={{ gridColumn: "span 2" }}
            >
              CREATE CAFETERIA
            </button>
          </form>
          <hr />
          <h3>EXISTING CAFETERIAS</h3>
          <div className="restaurant-grid">
            {restaurants.map((r) => (
              <div
                key={r._id}
                className="card"
                style={{
                  padding: "1.5rem",
                  borderLeft: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{r.name.toUpperCase()}</strong>
                  <br />
                  <small>{r.cuisine.toUpperCase()}</small>
                </div>
                <button
                  className="button button-outline"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                  onClick={() => setSelectedQR(r)}
                >
                  GET QR MENU
                </button>
              </div>
            ))}
          </div>

          {selectedQR && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "3rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  position: "relative",
                  maxWidth: "400px",
                }}
              >
                <button
                  onClick={() => setSelectedQR(null)}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    border: "none",
                    background: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
                <h2 style={{ marginBottom: "0.5rem" }}>
                  {selectedQR.name.toUpperCase()}
                </h2>
                <p style={{ color: "#666", marginBottom: "2rem" }}>
                  SCAN TO VIEW MENU
                </p>
                <div
                  style={{
                    background: "#fff",
                    padding: "1rem",
                    border: "1px solid #eee",
                    display: "inline-block",
                  }}
                >
                  <QRCodeSVG value={getMenuUrl(selectedQR._id)} size={200} />
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    marginTop: "1.5rem",
                    color: "#888",
                    wordBreak: "break-all",
                  }}
                >
                  {getMenuUrl(selectedQR._id)}
                </p>
                <button
                  className="button"
                  style={{ marginTop: "2rem", width: "100%" }}
                  onClick={() => window.print()}
                >
                  PRINT QR CODE
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="card" style={{ padding: "2rem" }}>
          <h2>REGISTER USER / STAFF</h2>
          <form
            onSubmit={handleAddUser}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <input
              type="text"
              placeholder="NAME"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="email"
              placeholder="EMAIL"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="password"
              placeholder="PASSWORD"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="user">USER (STUDENT)</option>
              <option value="admin">ADMIN</option>
              <option value="restaurant">RESTAURANT STAFF</option>
            </select>
            {newUser.role === "restaurant" && (
              <select
                value={newUser.restaurant_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, restaurant_id: e.target.value })
                }
                required
                style={{
                  padding: "0.8rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  gridColumn: "span 2",
                }}
              >
                <option value="">SELECT CAFETERIA</option>
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="ADDRESS"
              value={newUser.address}
              onChange={(e) =>
                setNewUser({ ...newUser, address: e.target.value })
              }
              required
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              placeholder="PHONE"
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
              required
              style={{
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <button
              type="submit"
              className="button"
              style={{ gridColumn: "span 2" }}
            >
              REGISTER
            </button>
          </form>
          <hr />
          <h3>EXISTING USERS</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                <th style={{ padding: "1rem" }}>NAME</th>
                <th style={{ padding: "1rem" }}>EMAIL</th>
                <th style={{ padding: "1rem" }}>ROLE</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "1rem" }}>{u.name}</td>
                  <td style={{ padding: "1rem" }}>{u.email}</td>
                  <td style={{ padding: "1rem" }}>
                    <span className="status-badge">{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
