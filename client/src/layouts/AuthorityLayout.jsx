import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/dashboard-logo.png';
import textLogo from '../assets/awaredashboard-logo.png';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Camera, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const authorityNavItems = [
  { path: '/authority/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/authority/incidents', icon: ShieldAlert, label: 'Incident Response' },
  { path: '/authority/evidence', icon: Camera, label: 'Evidence' },
];

const AuthorityLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = React.useCallback(() => {
    logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const handleMediaChange = (e) => {
      if (e.matches) {
        setIsSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsSidebarOpen(true);
        setIsMobile(false);
      }
    };
    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const sidebarVariants = {
    open: { width: 280, transition: { duration: 0.3, ease: 'easeInOut' } },
    closed: { width: 88, transition: { duration: 0.3, ease: 'easeInOut' } },
    mobileOpen: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    mobileClosed: { x: '-100%', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  return (
    <div className="flex h-screen bg-[#F8FBFF] overflow-hidden font-sans selection:bg-[#3B82F6]/20 relative">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={isMobile ? "mobileClosed" : "open"}
        animate={
          isMobile 
            ? (isSidebarOpen ? "mobileOpen" : "mobileClosed") 
            : (isSidebarOpen ? "open" : "closed")
        }
        className={`fixed lg:relative top-0 left-0 h-full bg-white/80 backdrop-blur-xl border-r border-[#DCEEFF] z-40 flex flex-col shadow-[4px_0_24px_rgba(96,165,250,0.05)] ${
          isMobile ? 'w-[280px]' : ''
        }`}
      >
        {/* Logo Area */}
        <div className={`h-24 shrink-0 flex items-center gap-3 relative ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : 'px-6'}`}>
          <img 
            src={logo} 
            alt="AWARE Logo" 
            className={`object-contain shrink-0 transition-all duration-[250ms] ease-in-out hover:scale-105 hover:drop-shadow-[0_0_16px_rgba(96,165,250,0.6)] ${
              !isSidebarOpen && !isMobile ? 'h-12 w-auto' : 'h-[56px] w-auto'
            }`} 
          />
          <AnimatePresence>
            {(isSidebarOpen || isMobile) && (
              <motion.img 
                src={textLogo}
                alt="AWARE"
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                className="h-[42px] w-auto object-contain mt-3"
              />
            )}
          </AnimatePresence>
          
          {/* Collapse Toggle (Desktop only) */}
          {!isMobile && (
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-[#D6E8FF] rounded-full flex items-center justify-center text-gray-400 hover:text-[#60A5FA] shadow-sm transition-colors z-10 hover:shadow-[0_0_12px_rgba(96,165,250,0.25)] cursor-pointer"
            >
              {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-1 custom-scrollbar">
          {authorityNavItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/authority/dashboard' && location.pathname === '/authority') ||
              (item.path === '/authority/incidents' && location.pathname.startsWith('/authority/incidents'));
            return (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  aria-label={item.label}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] ${
                    isActive 
                      ? 'text-white' 
                      : 'text-[#64748B] hover:text-[#60A5FA] hover:bg-[#DBEAFE]/30'
                  }`}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  {/* Active Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeAuthorityNavBg"
                      className="absolute inset-0 bg-gradient-to-r from-[#7DD3FC] to-[#60A5FA] rounded-2xl shadow-[0_4px_16px_rgba(96,165,250,0.25)] -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative shrink-0 transition-transform duration-300 group-hover:scale-[1.08] group-focus-within:scale-[1.08] ${!isSidebarOpen && !isMobile ? 'mx-auto' : ''}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#60A5FA] group-hover:brightness-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <AnimatePresence>
                    {(isSidebarOpen || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
                
                {/* Tooltip for collapsed state */}
                {!isSidebarOpen && !isMobile && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2.5 bg-white/80 backdrop-blur-md text-[#0F172A] font-semibold text-[14px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible group-hover:translate-x-0 group-focus-within:translate-x-0 -translate-x-2 scale-95 group-hover:scale-100 group-focus-within:scale-100 transition-all duration-200 whitespace-nowrap shadow-[0_4px_12px_rgba(96,165,250,0.15)] border border-[#D6E8FF] z-50 pointer-events-none">
                    {item.label}
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-white border-l border-b border-[#D6E8FF]" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="px-6 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-[#D6E8FF] to-transparent" />
        </div>

        {/* Bottom Area (Sign Out) */}
        <div className="p-4 space-y-1">
          <div className="relative group">
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign Out"
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-colors relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
            >
              <div className={`relative shrink-0 transition-transform duration-300 group-hover:scale-[1.08] group-focus-within:scale-[1.08] ${!isSidebarOpen && !isMobile ? 'mx-auto' : ''}`}>
                <LogOut className="w-5 h-5" strokeWidth={2} />
              </div>
              <AnimatePresence>
                {(isSidebarOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {!isSidebarOpen && !isMobile && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2.5 bg-white/80 backdrop-blur-md text-[#0F172A] font-semibold text-[14px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible group-hover:translate-x-0 group-focus-within:translate-x-0 -translate-x-2 scale-95 group-hover:scale-100 group-focus-within:scale-100 transition-all duration-200 whitespace-nowrap shadow-[0_4px_12px_rgba(96,165,250,0.15)] border border-[#D6E8FF] z-50 pointer-events-none">
                Sign Out
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-white border-l border-b border-[#D6E8FF]" />
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-[#F8FBFF]">
          <Outlet context={{ isMobile, setIsSidebarOpen }} />
        </div>
      </main>
    </div>
  );
};

export default AuthorityLayout;
