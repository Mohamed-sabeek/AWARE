import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-[24px] border border-[#E2F0FF] p-5 shadow-sm h-[160px] flex flex-col justify-between">
            <div className="w-[52px] h-[52px] rounded-[16px] bg-slate-200 animate-pulse"></div>
            <div>
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
        <div className="flex-1 bg-white rounded-[24px] border border-[#E2F0FF] overflow-hidden flex flex-col">
          {/* Map Toolbar Skeleton */}
          <div className="h-20 bg-slate-50 border-b border-[#E2F0FF] flex items-center px-6 gap-4">
            <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
          {/* Map Body Skeleton */}
          <div className="flex-1 bg-slate-100 animate-pulse"></div>
        </div>

        {/* Panel Skeleton */}
        <div className="w-full lg:w-96 bg-white rounded-[24px] border border-[#E2F0FF] p-6 hidden lg:flex flex-col gap-6">
          <div className="h-16 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 w-full bg-slate-100 rounded animate-pulse mt-4"></div>
          <div className="h-48 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse mt-4"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
