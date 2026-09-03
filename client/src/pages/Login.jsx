import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import loginBg from '../assets/login-bg.png';
import loginEarth from '../assets/login.png';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

// Isolated Memoized Form Component
const LoginForm = memo(({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-[12px] text-sm font-medium">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-[18px] flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
          <Mail className="h-5 w-5" strokeWidth={2} />
        </div>
        <input 
          type="email" 
          id="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="peer w-full h-[54px] pl-[48px] pr-[20px] pt-[22px] pb-[6px] transition-all duration-200 bg-white border border-[#DCEBFF] rounded-[14px] text-gray-900 font-sans font-[500] text-[15px] focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 shadow-xs placeholder-transparent"
          placeholder="Email Address"
        />
        <label 
          htmlFor="email" 
          className="absolute left-[48px] top-[16px] text-slate-500 font-sans font-[600] text-[13.5px] transition-all duration-200 pointer-events-none peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-autofill:top-[6px] peer-autofill:text-[11px] peer-autofill:text-blue-500 peer-not-placeholder-shown:top-[6px] peer-not-placeholder-shown:text-[11px]"
        >
          Email Address
        </label>
      </div>

      {/* Password Field */}
      <div className="relative group mt-1">
        <div className="absolute inset-y-0 left-0 pl-[18px] flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
          <Lock className="h-5 w-5" strokeWidth={2} />
        </div>
        <input 
          type={showPassword ? 'text' : 'password'} 
          id="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="peer w-full h-[54px] pl-[48px] pr-14 pt-[22px] pb-[6px] transition-all duration-200 bg-white border border-[#DCEBFF] rounded-[14px] text-gray-900 font-sans font-[500] text-[15px] focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 shadow-xs placeholder-transparent"
          placeholder="Password"
        />
        <label 
          htmlFor="password" 
          className="absolute left-[48px] top-[16px] text-slate-500 font-sans font-[600] text-[13.5px] transition-all duration-200 pointer-events-none peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-autofill:top-[6px] peer-autofill:text-[11px] peer-autofill:text-blue-500 peer-not-placeholder-shown:top-[6px] peer-not-placeholder-shown:text-[11px]"
        >
          Password
        </label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-[18px] flex items-center text-slate-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
        >
          {showPassword ? <EyeOff className="h-4.5 w-4.5" strokeWidth={2} /> : <Eye className="h-4.5 w-4.5" strokeWidth={2} />}
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 h-[52px] w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-[14px] font-sans font-[600] text-[16px] tracking-wide shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
            <span>Signing In...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
});

LoginForm.displayName = 'LoginForm';

// High-Performance GPU Accelerated Visual Illustration Panel with Smooth Pure-CSS Spin
const EarthIllustration = memo(() => {
  return (
    <>
      {/* Inline styles for 100% compositor-threaded GPU animation */}
      <style>{`
        @keyframes awareGpuSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes awareGpuSpinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes awareGpuFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .gpu-spin-globe {
          animation: awareGpuSpin 90s linear infinite;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .gpu-spin-orbit {
          animation: awareGpuSpinReverse 50s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .gpu-float-wrapper {
          animation: awareGpuFloat 7s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
        }
      `}</style>

      {/* Desktop / Laptop Wavy Illustration Panel */}
      <div 
        className="absolute top-0 bottom-0 right-0 w-[58%] hidden lg:block z-30 pointer-events-none"
      >
        <div 
          className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-100/90 to-indigo-100/90 pointer-events-auto"
          style={{ 
            clipPath: 'url(#wave-divider)',
            contain: 'strict'
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[70%] h-[70%] bg-blue-400/20 rounded-full blur-[60px]" />
          </div>

          {/* GPU Animated Orbit Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] border border-blue-400/20 rounded-full pointer-events-none gpu-spin-orbit" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-indigo-400/20 rounded-full pointer-events-none" />

          {/* Floating Wrapper */}
          <div className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-hidden flex items-center justify-center gpu-float-wrapper">
            {/* Spinning Earth Globe via GPU Compositor */}
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={loginEarth} 
                alt="AWARE Global Monitoring" 
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center scale-[1.42] translate-x-[5%] select-none gpu-spin-globe"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile / Tablet Image Representation */}
      <div className="w-full h-[240px] sm:h-[320px] relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 lg:hidden rounded-t-[32px]">
         <div className="absolute inset-0 bg-blue-400/20 blur-[40px] rounded-full" />
         <div className="w-full h-full flex items-center justify-center gpu-float-wrapper">
           <img 
              src={loginEarth} 
              alt="AWARE Global Monitoring" 
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.4] select-none gpu-spin-globe"
            />
         </div>
      </div>
    </>
  );
});

EarthIllustration.displayName = 'EarthIllustration';

const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'authority') {
        navigate('/authority/dashboard', { replace: true });
      } else if (user.role === 'fire_officer') {
        navigate('/fire/dashboard', { replace: true });
      } else if (user.role === 'pollution_officer') {
        navigate('/pollution/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleLogin = useCallback(async (email, password) => {
    setIsLoading(true);
    setError('');
    
    try {
      const loggedUser = await login(email, password);
      
      // Role based navigation
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'authority') {
        navigate('/authority/dashboard', { replace: true });
      } else if (loggedUser.role === 'fire_officer') {
        navigate('/fire/dashboard', { replace: true });
      } else if (loggedUser.role === 'pollution_officer') {
        navigate('/pollution/dashboard', { replace: true });
      } else {
        setError('This portal is reserved for System Administrators, Environmental Authorities, and Response Officers.');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
      setIsLoading(false);
    }
  }, [login, navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-slate-900 font-sans">
      
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={loginBg} 
          alt="Background" 
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover opacity-75 select-none"
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[1150px] bg-white border border-white/80 rounded-[32px] shadow-2xl overflow-hidden relative z-10 flex flex-col-reverse lg:flex-row min-h-[580px]"
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
        <div className="w-full lg:w-[50%] flex flex-col justify-center p-6 sm:p-10 lg:pr-18 relative z-20 bg-white">
          
          {/* Logo & Header */}
          <div>
            <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
              <img src={logo} alt="AWARE Logo" loading="eager" decoding="async" className="h-12" />
            </Link>
            
            <h1 className="font-sans font-[800] text-[38px] sm:text-[42px] leading-tight text-slate-900 mb-1 tracking-tight">
              Welcome Back
            </h1>
            <p className="font-sans font-[400] text-[15px] sm:text-[16px] text-slate-500 leading-relaxed">
              Sign in to access the AWARE Environmental Monitoring Platform.
            </p>
          </div>

          {/* Isolated Form */}
          <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />

          {/* Footer Links */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-row items-center justify-end gap-4 whitespace-nowrap text-[14px]">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-sans font-[600] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          
        </div>

        {/* Right Panel - Illustration */}
        <EarthIllustration />

      </motion.div>

    </div>
  );
};

export default Login;
