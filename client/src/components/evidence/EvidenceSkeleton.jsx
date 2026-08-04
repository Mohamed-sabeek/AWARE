import React from 'react';

const EvidenceSkeleton = () => {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-[#DCEEFF] shadow-sm flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 w-full bg-slate-200 shrink-0" />

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="w-2/3">
            <div className="h-5 bg-slate-200 rounded-md mb-2 w-full" />
            <div className="h-3 bg-slate-100 rounded-md w-3/4" />
          </div>
          <div className="h-5 bg-slate-100 rounded-md w-16" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div>
            <div className="h-3 bg-slate-200 rounded-md mb-2 w-10" />
            <div className="h-4 bg-slate-200 rounded-md w-16" />
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded-md mb-2 w-20" />
            <div className="h-4 bg-slate-200 rounded-md w-16" />
          </div>
        </div>

        <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-5 mt-auto" />

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
          <div className="h-9 bg-slate-100 rounded-lg flex-1" />
          <div className="w-9 h-9 bg-slate-100 rounded-lg" />
          <div className="w-9 h-9 bg-slate-100 rounded-lg" />
          <div className="w-9 h-9 bg-slate-100 rounded-lg ml-auto" />
        </div>
      </div>
    </div>
  );
};

export default EvidenceSkeleton;
