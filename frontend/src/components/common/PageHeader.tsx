// src/components/common/PageHeader.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, User, Clock } from 'lucide-react'; // ✅ ADDED - Import Clock icon
import { useAuthStore } from '../../store/authStore';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onForceExpiry?: () => void; // ✅ ADDED - New prop for force expiry
}

export default function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onRefresh, 
  refreshing = false,
  onForceExpiry  // ✅ ADDED - Destructure the new prop
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* ✅ ADDED - Force Expiry Button */}
            {onForceExpiry && (
              <button 
                onClick={onForceExpiry} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Force update expired memberships"
              >
                <Clock size={18} className="text-orange-500" />
              </button>
            )}
            {onRefresh && (
              <button 
                onClick={onRefresh} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <RefreshCw size={18} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
            {/* Profile Button - Navigates to Manage Admins for Admin, Profile for Member */}
            <button 
              onClick={() => {
                if (user?.role === 'ADMIN') {
                  navigate('/admin/admins');
                } else {
                  navigate('/member/profile');
                }
              }}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
              title={user?.role === 'ADMIN' ? 'Manage Admins' : 'Profile'}
            >
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || (user?.role === 'ADMIN' ? 'A' : 'M')}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}