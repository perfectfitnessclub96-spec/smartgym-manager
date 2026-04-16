import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-text mb-4">
              Welcome to{' '}
              <span className="text-primary">SmartGym Manager</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Perfect Fitness Club - Your Journey to a Healthier You Starts Here
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate('/login', { state: { role: 'MEMBER' } })}
                className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
              >
                Member Login
              </button>
              <button
                onClick={() => navigate('/login', { state: { role: 'ADMIN' } })}
                className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg hover:bg-red-50 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
              >
                Admin / Staff Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="text-primary text-4xl mb-4">💪</div>
            <h3 className="text-xl font-semibold mb-2">Smart Workouts</h3>
            <p className="text-gray-600">Track your fitness journey with personalized workout plans</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="text-primary text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">Book wellness services and classes with ease</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="text-primary text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">Monitor your fitness progress and achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
}