// frontend/src/utils/membershipUtils.ts

export interface MembershipStatusInfo {
  status: string;
  daysRemaining: number;
  isActive: boolean;
  isExpiringSoon: boolean;
  statusColor: string;
  badgeColor: string;
  bgColor: string;
}

export const getMembershipStatusInfo = (expiryDate?: string | Date): MembershipStatusInfo => {
  if (!expiryDate) {
    return {
      status: 'No Membership',
      daysRemaining: 0,
      isActive: false,
      isExpiringSoon: false,
      statusColor: 'text-gray-600',
      badgeColor: 'bg-gray-100 text-gray-700',
      bgColor: 'bg-gray-50'
    };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  if (daysRemaining < 0) {
    return {
      status: 'Expired',
      daysRemaining: 0,
      isActive: false,
      isExpiringSoon: false,
      statusColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700',
      bgColor: 'bg-red-50'
    };
  } else if (daysRemaining === 0) {
    return {
      status: 'Expires Today',
      daysRemaining: 0,
      isActive: false,
      isExpiringSoon: true,
      statusColor: 'text-orange-600',
      badgeColor: 'bg-orange-100 text-orange-700',
      bgColor: 'bg-orange-50'
    };
  } else if (daysRemaining <= 7) {
    return {
      status: 'Expiring Soon',
      daysRemaining,
      isActive: true,
      isExpiringSoon: true,
      statusColor: 'text-yellow-600',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      bgColor: 'bg-yellow-50'
    };
  } else {
    return {
      status: 'Active',
      daysRemaining,
      isActive: true,
      isExpiringSoon: false,
      statusColor: 'text-green-600',
      badgeColor: 'bg-green-100 text-green-700',
      bgColor: 'bg-green-50'
    };
  }
};

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

export const calculateDaysRemaining = (expiryDate: string | Date): number => {
  if (!expiryDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
  return days < 0 ? 0 : days;
};

export const isMembershipExpired = (expiryDate: string | Date): boolean => {
  if (!expiryDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
};

export const isMembershipExpiringSoon = (expiryDate: string | Date, daysThreshold: number = 7): boolean => {
  if (!expiryDate) return false;
  const daysRemaining = calculateDaysRemaining(expiryDate);
  return daysRemaining > 0 && daysRemaining <= daysThreshold;
};