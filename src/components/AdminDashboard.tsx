import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminDashboard() {
  const { user, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-text">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Total Members</h3>
            <p className="text-3xl font-bold text-text mt-2">0</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Active Memberships</h3>
            <p className="text-3xl font-bold text-text mt-2">0</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-text mt-2">$0</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Today's Bookings</h3>
            <p className="text-3xl font-bold text-text mt-2">0</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Member Management</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                View All Members
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                Add New Member
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                Manage Memberships
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Operations</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                Manage Wellness Services
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                View Bookings
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                Manage Equipment
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}