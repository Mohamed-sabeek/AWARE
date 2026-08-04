import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const PageHeader = ({ title, description }) => {
  const { isMobile, setIsSidebarOpen } = useOutletContext() || { isMobile: false, setIsSidebarOpen: () => {} };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-6 lg:px-10 h-24 bg-white/80 backdrop-blur-xl w-full"
    >
      {/* LEFT SECTION: Title, Description */}
      <div className="flex items-center gap-5 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-[#F8FBFF] rounded-xl border border-[#DCEEFF] text-[#64748B] hover:text-[#3B82F6] transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-[24px] lg:text-[28px] font-extrabold text-[#0F172A] tracking-tight truncate leading-tight">
            {title}
          </h1>
          <p className="text-[14px] text-[#64748B] font-medium truncate hidden md:block mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* CENTER SECTION: Global Search */}
      <div className="hidden lg:flex flex-1 max-w-xl mx-8">
        <div className="relative group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search sensors, evidence, alerts, locations..." 
            className="w-full pl-11 pr-4 py-3.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-full text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] focus:bg-white transition-all shadow-sm placeholder:text-[#94A3B8] text-[#0F172A]"
          />
        </div>
      </div>

      {/* RIGHT SECTION: Notifications */}
      <div className="flex items-center gap-4 shrink-0 pl-8">
        
        {/* Search Icon (Mobile Only) */}
        <button className="lg:hidden p-2.5 text-[#64748B] hover:text-[#3B82F6] transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-3 bg-white border border-[#DCEEFF] rounded-full text-[#64748B] hover:text-[#3B82F6] shadow-sm hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] transition-all group">
          <Bell className="w-5 h-5 group-hover:animate-wiggle" />
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
          </span>
        </button>
      </div>
    </motion.header>
  );
};

export default PageHeader;
