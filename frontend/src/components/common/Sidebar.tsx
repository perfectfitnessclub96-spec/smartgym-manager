// src/components/common/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, RefreshCw, Sparkles, Calendar, Dumbbell, User, 
  Users, PlusCircle, LogOut, Menu, X, Shield, Bell, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface SidebarProps {
  role: 'ADMIN' | 'MEMBER';
  onLogout: () => void;
}

export default function Sidebar({ role, onLogout }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setRenderKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Member Menu Items with translations
  const memberMenuItems = [
    { 
      path: '/member/dashboard', 
      icon: LayoutDashboard, 
      labelKey: 'common.dashboard',
      fallback: 'Dashboard'
    },
    { 
      path: '/member/renew', 
      icon: RefreshCw, 
      labelKey: 'member.dashboard.requestRenewal',
      fallback: 'Request Renewal'
    },
    { 
      path: '/member/book-wellness', 
      icon: Sparkles, 
      labelKey: 'member.wellness.bookWellness',
      fallback: 'Book Spa Service'
    },
    { 
      path: '/member/my-spa-bookings', 
      icon: Calendar, 
      labelKey: 'member.bookings.myBookings',
      fallback: 'My Bookings'
    },
    { 
      path: '/member/equipment', 
      icon: Dumbbell, 
      labelKey: 'member.equipment.viewEquipment',
      fallback: 'View Equipment'
    },
    { 
      path: '/member/profile', 
      icon: User, 
      labelKey: 'common.profile',
      fallback: 'Profile'
    },
  ];

  // Admin Menu Items with translations
  const adminMenuItems = [
    { 
      path: '/admin/dashboard', 
      icon: LayoutDashboard, 
      labelKey: 'admin.dashboard',
      fallback: 'Dashboard'
    },
    { 
      path: '/admin/members', 
      icon: Users, 
      labelKey: 'admin.members',
      fallback: 'Members'
    },
    { 
      path: '/admin/members/add', 
      icon: PlusCircle, 
      labelKey: 'admin.addMember',
      fallback: 'Add Member'
    },
    { 
      path: '/admin/renewal-requests', 
      icon: RefreshCw, 
      labelKey: 'admin.renewalRequests',
      fallback: 'Renewal Requests'
    },
    { 
      path: '/admin/manage-bookings', 
      icon: Calendar, 
      labelKey: 'admin.bookings',
      fallback: 'Bookings'
    },
    { 
      path: '/admin/equipment', 
      icon: Dumbbell, 
      labelKey: 'admin.equipment',
      fallback: 'Equipment'
    },
    { 
      path: '/admin/notifications', 
      icon: Bell, 
      labelKey: 'admin.notifications',
      fallback: 'Notifications'
    },
    { 
      path: '/admin/admins', 
      icon: Shield, 
      labelKey: 'admin.manageAdmins',
      fallback: 'Manage Admins'
    },
  ];

  const menuItems = role === 'ADMIN' ? adminMenuItems : memberMenuItems;
  const isActive = (path: string) => location.pathname === path;

  // Helper function to get translated text
  const getLabel = (labelKey: string, fallback: string): string => {
    try {
      const translated = t(labelKey);
      if (translated === labelKey || !translated) {
        return fallback;
      }
      return translated;
    } catch {
      return fallback;
    }
  };

  const Logo = () => (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Gym Logo"
        className="w-10 h-10 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = 'bg-red-600 p-2 rounded-xl';
            fallback.innerHTML = '💪';
            fallback.style.fontSize = '20px';
            fallback.style.color = 'white';
            parent.appendChild(fallback);
          }
        }}
      />
      <div>
        <span className="text-xl font-bold text-gray-800">Perfect</span>
        <span className="text-xl font-bold text-red-600"> Fitness</span>
        <p className="text-xs text-gray-500">Club</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-red-600 text-white rounded-xl shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-xl z-40 transition-transform duration-300 w-64 lg:w-72 border-r border-gray-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`} 
        key={renderKey}
      >
        {/* Logo Section - NOT CLICKABLE */}
        <div className="p-6 border-b border-gray-200">
          <Logo />
          <p className="text-xs text-gray-500 mt-3">
            {role === 'ADMIN' ? t('admin.dashboard') : 'Member Portal'}
          </p>
        </div>

        {/* User Info Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <Users className="text-red-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {user?.name || (role === 'ADMIN' ? 'Admin' : 'Member')}
              </p>
              <p className="text-xs text-gray-500">
                {role === 'ADMIN' ? 'Administrator' : 'Active Member'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1 overflow-y-auto h-[calc(100%-200px)]">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const label = getLabel(item.labelKey, item.fallback);
              
              return (
                <button 
                  key={item.path} 
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
                  <span className="text-sm font-medium">{label}</span>
                  {active && <div className="ml-auto w-1.5 h-6 bg-white rounded-full"></div>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200 absolute bottom-0 left-0 right-0 bg-white">
          {/* Language Switcher */}
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher />
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">{t('common.logout', 'Logout')}</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
    </>
  );
}