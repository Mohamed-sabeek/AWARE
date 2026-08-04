import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Loader2, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import loginBg from '../assets/login-bg.png';
import loginEarth from '../assets/login.png';
import logo from '../assets/logo.png';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate registration and redirect
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-gray-900 font-sans">
      
      {/* Background with blur and overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={loginBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 backdrop-blur-[6px]"></div>
      </div>

      {/* Ambient noise texture */}
      <div className="absolute inset-0 z-0 bg-[url('/noise.svg')] opacity-[0.15] mix-blend-soft-light pointer-events-none"></div>

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1200px] bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_rgba(47,128,237,0.15)] border border-white/60 overflow-hidden relative z-10 flex flex-col-reverse lg:flex-row min-h-[600px]"
      >
        
        {/* Invisible SVG for Wavy Clip Path */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <clipPath id="wave-divider" clipPathUnits="objectBoundingBox">
              <path d="M 0.15,0 C 0.02,0.25 0.28,0.45 0.15,0.6 C 0.02,0.75 0.22,0.9 0.15,1 L 1,1 L 1,0 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Left Panel - Authentication (Approx 50%) */}
        <div className="w-full lg:w-[50%] flex flex-col justify-center p-6 sm:p-10 lg:pr-24 relative z-20 bg-white/50 lg:bg-transparent">
          
          {/* Logo & Header */}
          <div>
            <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
              <img src={logo} alt="AWARE Logo" className="h-[46px]" />
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-sans font-[700] text-[48px] leading-tight text-gray-900 mb-1 tracking-tight"
            >
              Create an Account
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="font-sans font-[400] text-[18px] text-slate-500 leading-[1.6]"
            >
              Sign up to join the AWARE Environmental Monitoring Platform.
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-[16px]">
            
            {/* Full Name Field */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-[20px] flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
                <User className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <input 
                type="text" 
                id="name" 
                required
                className="peer w-full h-[56px] pl-[52px] pr-[20px] pt-[24px] pb-[8px] transition-all duration-[250ms] bg-white/70 backdrop-blur-md border border-[#DCEBFF] rounded-[16px] text-gray-900 font-sans font-[500] text-[16px] focus:outline-none focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)] focus:shadow-[0_8px_24px_rgba(59,130,246,0.12)] placeholder-transparent"
                placeholder="Full Name"
              />
              <label 
                htmlFor="name" 
                className="absolute left-[52px] top-[18px] text-slate-500 font-sans font-[600] text-[14px] transition-all duration-[250ms] pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-autofill:top-[8px] peer-autofill:text-[11px] peer-autofill:text-blue-500 peer-not-placeholder-shown:top-[8px] peer-not-placeholder-shown:text-[11px]"
              >
                Full Name
              </label>
            </motion.div>

            {/* Email Field */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-[20px] flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
                <Mail className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <input 
                type="email" 
                id="email" 
                required
                className="peer w-full h-[56px] pl-[52px] pr-[20px] pt-[24px] pb-[8px] transition-all duration-[250ms] bg-white/70 backdrop-blur-md border border-[#DCEBFF] rounded-[16px] text-gray-900 font-sans font-[500] text-[16px] focus:outline-none focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)] focus:shadow-[0_8px_24px_rgba(59,130,246,0.12)] placeholder-transparent"
                placeholder="Email Address"
              />
              <label 
                htmlFor="email" 
                className="absolute left-[52px] top-[18px] text-slate-500 font-sans font-[600] text-[14px] transition-all duration-[250ms] pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-autofill:top-[8px] peer-autofill:text-[11px] peer-autofill:text-blue-500 peer-not-placeholder-shown:top-[8px] peer-not-placeholder-shown:text-[11px]"
              >
                Email Address
              </label>
            </motion.div>

            {/* Phone Number Field */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-[20px] flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
                <Phone className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <input 
                type="tel" 
                id="phone" 
                required
                className="peer w-full h-[56px] pl-[52px] pr-[20px] pt-[24px] pb-[8px] transition-all duration-[250ms] bg-white/70 backdrop-blur-md border border-[#DCEBFF] rounded-[16px] text-gray-900 font-sans font-[500] text-[16px] focus:outline-none focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)] focus:shadow-[0_8px_24px_rgba(59,130,246,0.12)] placeholder-transparent"
                placeholder="Phone Number"
              />
              <label 
                htmlFor="phone" 
                className="absolute left-[52px] top-[18px] text-slate-500 font-sans font-[600] text-[14px] transition-all duration-[250ms] pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-autofill:top-[8px] peer-autofill:text-[11px] peer-autofill:text-blue-500 peer-not-placeholder-shown:top-[8px] peer-not-placeholder-shown:text-[11px]"
              >
                Phone Number
              </label>
            </motion.div>

            {/* Password Field */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-[20px] flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
                <Lock className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                required
                className="peer w-full h-[56px] pl-[52px] pr-14 pt-[24px] pb-[8px] transition-all duration-[250ms] bg-white/70 backdrop-blur-md border border-[#DCEBFF] rounded-[16px] text-gray-900 font-sans font-[500] text-[16px] focus:outline-none focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)] focus:shadow-[0_8px_24px_rgba(59,130,246,0.12)] placeholder-transparent"
                placeholder="Password"
              />
              <label 
                htmlFor="password" 
                className="absolute left-[52px] top-[18px] text-slate-500 font-sans font-[600] text-[14px] transition-all duration-[250ms] pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-autofill:top-[8px] peer-autofill:text-[11px] peer-autofill:text-blue-500 peer-not-placeholder-shown:top-[8px] peer-not-placeholder-shown:text-[11px]"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-[20px] flex items-center text-slate-500 hover:text-gray-700 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-[20px] w-[20px]" strokeWidth={2} /> : <Eye className="h-[20px] w-[20px]" strokeWidth={2} />}
              </button>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-[20px] flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
                <Lock className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="confirmPassword" 
                required
                className="peer w-full h-[56px] pl-[52px] pr-14 pt-[24px] pb-[8px] transition-all duration-[250ms] bg-white/70 backdrop-blur-md border border-[#DCEBFF] rounded-[16px] text-gray-900 font-sans font-[500] text-[16px] focus:outline-none focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)] focus:shadow-[0_8px_24px_rgba(59,130,246,0.12)] placeholder-transparent"
                placeholder="Confirm Password"
              />
              <label 
                htmlFor="confirmPassword" 
                className="absolute left-[52px] top-[18px] text-slate-500 font-sans font-[600] text-[14px] transition-all duration-[250ms] pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-autofill:top-[8px] peer-autofill:text-[11px] peer-autofill:text-blue-500 peer-not-placeholder-shown:top-[8px] peer-not-placeholder-shown:text-[11px]"
              >
                Confirm Password
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              disabled={isLoading}
              className="mt-2 h-[56px] w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-[16px] font-sans font-[600] text-[16px] tracking-wide shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_16px_32px_rgba(59,130,246,0.4)] hover:-translate-y-[3px] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
              {/* Ripple effect base */}
              <div className="absolute inset-0 w-full h-full bg-white/20 scale-0 group-hover:scale-150 rounded-[16px] transition-transform duration-700 origin-center opacity-0 group-hover:opacity-100 pointer-events-none"></div>
            </motion.button>
          </form>

          {/* Footer Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 pt-5 border-t border-slate-200/50 flex flex-row items-center justify-between gap-4 whitespace-nowrap"
          >
            <p className="text-slate-600 font-sans text-[15px]">
              Already have an account? <Link to="/login" className="font-[600] text-blue-600 hover:text-blue-700 transition-colors ml-1">Sign In</Link>
            </p>
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-sans font-[600] text-[15px] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>
          
        </div>

        {/* Right Panel - Illustration (Wavy Wave Overlay) */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-[58%] hidden lg:block z-30 pointer-events-none"
          style={{ filter: 'drop-shadow(-6px 0 16px rgba(255,255,255,0.9))' }}
        >
          <div 
            className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-100/50 pointer-events-auto"
            style={{ clipPath: 'url(#wave-divider)' }}
          >
            
            {/* Subtle Ambient Radial Glows */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-[80%] bg-primary/20 blur-[100px] rounded-full animate-[pulse_8s_ease-in-out_infinite]"></div>
              <div className="absolute w-[60%] h-[60%] bg-blue-400/20 blur-[80px] rounded-full mix-blend-overlay"></div>
            </div>

            {/* Animated Orbit Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/10 rounded-full opacity-50 animate-[spin_60s_linear_infinite] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-blue-400/10 rounded-full opacity-50 animate-[spin_40s_linear_infinite_reverse] pointer-events-none"></div>

            {/* Floating Particles */}
            <motion.div 
              animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            />
            <motion.div 
              animate={{ y: [0, 30, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-blue-300 rounded-full blur-[1px] shadow-[0_0_15px_rgba(147,197,253,0.8)]"
            />
            <motion.div 
              animate={{ y: [0, -40, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-indigo-300 rounded-full shadow-[0_0_8px_rgba(165,180,252,0.8)]"
            />

            {/* Earth Illustration */}
            <div className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-hidden">
              <motion.img 
                initial={{ y: 20, x: '10%', opacity: 0, scale: 1.5 }}
                animate={{ y: [-8, 8, -8], x: '10%', rotate: 360, opacity: 1, scale: 1.5 }}
                transition={{ 
                  opacity: { duration: 1 },
                  y: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 120, repeat: Infinity, ease: 'linear' }
                }}
                src={loginEarth} 
                alt="AWARE Global Monitoring" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            
          </div>
        </div>
        
        {/* Mobile / Tablet Image Representation (Visible only on smaller screens) */}
        <div className="w-full h-[250px] sm:h-[350px] relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 lg:hidden rounded-t-[32px]">
           <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
           <motion.img 
              initial={{ scale: 1.5 }}
              animate={{ y: [-5, 5, -5], rotate: 360, scale: 1.5 }}
              transition={{ 
                y: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 120, repeat: Infinity, ease: 'linear' }
              }}
              src={loginEarth} 
              alt="AWARE Global Monitoring" 
              className="absolute inset-0 w-full h-full object-cover object-center z-10 pointer-events-none"
            />
        </div>

      </motion.div>

    </div>
  );
};

export default Register;
