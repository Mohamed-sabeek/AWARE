import React from 'react';
import { motion } from 'framer-motion';

const shimmer = 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-pulse';

const Block = ({ className }) => (
  <div className={`rounded-xl ${shimmer} ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="bg-white rounded-[24px] border border-[#E2F0FF] p-6 shadow-sm min-h-[190px] flex flex-col gap-4"
        >
          <div className="flex justify-between items-start">
            <Block className="w-12 h-12" />
            <Block className="w-20 h-7 rounded-full" />
          </div>
          <Block className="w-1/2 h-4" />
          <Block className="w-3/4 h-10" />
          <Block className="w-full h-1.5 mt-auto" />
        </motion.div>
      ))}
    </div>

    {/* Filter Bar */}
    <div className="bg-white rounded-2xl border border-[#E2F0FF] p-4">
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <Block key={i} className="h-10 flex-1" />
        ))}
        <Block className="h-10 w-28" />
      </div>
    </div>

    {/* Map + Panel */}
    <div className="flex flex-col lg:flex-row gap-6">
      <Block className="flex-1 h-[520px] rounded-[24px]" />
      <div className="lg:w-[360px] flex flex-col gap-4">
        <Block className="h-64 rounded-[24px]" />
        <Block className="h-52 rounded-[24px]" />
      </div>
    </div>

    {/* Bottom Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Block className="h-48 rounded-[24px]" />
      <Block className="h-48 rounded-[24px]" />
    </div>
  </div>
);

export default LoadingSkeleton;
