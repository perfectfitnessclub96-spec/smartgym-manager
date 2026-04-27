import React from 'react';

export const MemberCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="flex p-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      <div className="ml-4 flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
    <div className="bg-gray-50 p-4 border-t border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    ))}
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-24"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
  </div>
);