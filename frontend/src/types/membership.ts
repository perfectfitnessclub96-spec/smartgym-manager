export interface MembershipPlan {
  _id: string;
  name: string;
  duration: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY' | 'COUPLE';
  durationInDays: number;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  photo?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  currentMembership?: {
    _id: string;
    planId: MembershipPlan;
    startDate: string;
    expiryDate: string;
    status: string;
    amount: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RenewalRequest {
  _id: string;
  memberId: {
    _id: string;
    name: string;
    email: string;
    mobileNumber: string;
    photo: string;
  };
  membershipId: {
    _id: string;
    expiryDate: string;
  };
  plan?: MembershipPlan;
  requestedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  member: Member;
  currentMembership: {
    _id: string;
    planId: MembershipPlan;
    startDate: string;
    expiryDate: string;
    status: string;
    amount: number;
  } | null;
  daysRemaining: number;
  status: string;
  hasPendingRenewal: boolean;
}

export interface Membership {
  _id: string;
  memberId: string;
  planId: MembershipPlan;
  startDate: string;
  expiryDate: string;
  gracePeriodEnd?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'GRACE_PERIOD' | 'CANCELLED';
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  membershipId: string;
  memberId: string;
  amount: number;
  paymentMethod: 'ONLINE' | 'CASH';
  paymentStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  invoiceNumber: string;
  paymentDate: string;
  createdAt?: string;
  updatedAt?: string;
}