import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [flowers, setFlowers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("flowers");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFlower, setEditingFlower] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "bouquet"
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [flowersRes, messagesRes] = await Promise.all([
        fetch(`${API}/flowers`),
        fetch(`${API}/admin/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
        })
      ]);
      
      const flowersData = await flowersRes.json();
      const messagesData = await messagesRes.json();
      
      setFlowers(flowersData);
      setMessages(messagesData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate("/admin/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddFlower = async (e) => {
    e.preventDefault();
    
    try {
      await fetch(`${API}/admin/flowers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(formData)
      });
      
      setFormData({ name: "", price: "", image: "", category: "bouquet" });
      setShowAddForm(false);
      loadData();
      alert("Flower added successfully!");
    } catch (err) {
      alert("Error adding flower");
    }
  };

  const handleUpdateFlower = async (e) => {
    e.preventDefault();
    
    try {
      await fetch(`${API}/admin/flowers/${editingFlower.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(formData)
      });
      
      setFormData({ name: "", price: "", image: "", category: "bouquet" });
      setEditingFlower(null);
      loadData();
      alert("Flower updated successfully!");
    } catch (err) {
      alert("Error updating flower");
    }
  };

  const handleEditClick = (flower) => {
    setEditingFlower(flower);
    setFormData({
      name: flower.name,
      price: flower.price,
      image: flower.image,
      category: flower.category
    });
    setShowAddForm(false);
  };

  const handleDeleteFlower = async (flowerId) => {
    if (!window.confirm("Are you sure you want to delete this flower?")) return;
    
    try {
      await fetch(`${API}/admin/flowers/${flowerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      
      loadData();
      alert("Flower deleted successfully!");
    } catch (err) {
      alert("Error deleting flower");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", image: "", category: "bouquet" });
    setShowAddForm(false);
    setEditingFlower(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🌸</span>
              <h1 className="text-2xl font-serif font-bold text-rose-800">Mon Fleur Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" target="_blank" className="text-gray-600 hover:text-rose-600 transition">View Site →</a>
              <button onClick={handleLogout} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button onClick={() => setActiveTab("flowers")} className={`py-4 px-2 border-b-2 font-medium transition ${activeTab === "flowers" ? "border-rose-600 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>🌸 Flowers ({flowers.length})</button>
            <button onClick={() => setActiveTab("messages")} className={`py-4 px-2 border-b-2 font-medium transition ${activeTab === "messages" ? "border-rose-600 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>📧 Messages ({messages.length})</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "flowers" && (
          <div>
            {(showAddForm || editingFlower) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingFlower ? "Edit Flower" : "Add New Flower"}</h2>
                <form onSubmit={editingFlower ? handleUpdateFlower : handleAddFlower} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-700 font-medium mb-2">Flower Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none" placeholder="e.g., Pink Roses Bouquet" required /></div>
                    <div><label className="block text-gray-700 font-medium mb-2">Price</label><input type="text" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none" placeholder="e.g., $45 or 45€" required /></div>
                  </div>
                  <div><label className="block text-gray-700 font-medium mb-2">Image URL</label><input type="url" name="image" value={formData.image} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none" placeholder="https://example.com/image.jpg" required /></div>
                  <div><label className="block text-gray-700 font-medium mb-2">Category</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"><option value="bouquet">Bouquet</option><option value="arrangement">Arrangement</option><option value="special">Special Occasions</option></select></div>
                  <div className="flex space-x-4">
                    <button type="submit" className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition">{editingFlower ? "Update Flower" : "Add Flower"}</button>
                    <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Flowers</h2>
                {!showAddForm && !editingFlower && (<button onClick={() => setShowAddForm(true)} className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition">+ Add New Flower</button>)}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flowers.map((flower) => (
                      <tr key={flower.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><img src={flower.image} alt={flower.name} className="w-16 h-16 object-cover rounded" /></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{flower.name}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{flower.price}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">{flower.category}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button onClick={() => handleEditClick(flower)} className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button onClick={() => handleDeleteFlower(flower.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Messages</h2>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div><h3 className="font-semibold text-gray-900">{message.name}</h3><p className="text-sm text-gray-600">{message.email}</p></div>
                    <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mt-2">{message.message}</p>
                </div>
              ))}
              {messages.length === 0 && (<p className="text-gray-500 text-center py-8">No messages yet</p>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
