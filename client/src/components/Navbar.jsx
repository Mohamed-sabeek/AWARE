import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

const navLinks = [
  { name: 'Home', path: '#' },
  { name: 'Features', path: '#features' },
  { name: 'Workflow', path: '#workflow' },
  { name: 'Technology', path: '#technology' },
  { name: 'Team', path: '#team' },
  { name: 'Contact', path: '#contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center h-[90px] ${
        isScrolled ? 'bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(47,128,237,0.05)]' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between w-full max-w-[1400px]">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src={logoImg} 
            alt="AWARE Logo" 
            className="h-[90px] scale-[1.2] origin-left w-auto object-contain" 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="text-[15px] font-medium text-text-primary hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-5">
          <Link
            to="/login"
            className="flex items-center justify-center px-[30px] py-[15px] rounded-full bg-white/80 backdrop-blur-md ring-1 ring-inset ring-primary/20 text-[15px] font-semibold tracking-wide text-primary shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out hover:bg-primary/5 hover:ring-primary/30 hover:shadow-[0_4px_15px_rgba(47,128,237,0.1)] hover:-translate-y-[2px] hover:scale-[1.03]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex items-center justify-center px-[30px] py-[15px] rounded-full bg-gradient-to-r from-primary to-accent text-[15px] font-semibold tracking-wide text-white shadow-[0_4px_14px_rgba(47,128,237,0.2)] transition-all duration-300 ease-in-out hover:brightness-105 hover:shadow-[0_6px_20px_rgba(47,128,237,0.3)] hover:-translate-y-[2px] hover:scale-[1.03]"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-text-primary hover:text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[90px] left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-primary/10 p-6 flex flex-col gap-4 lg:hidden shadow-2xl"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-text-primary hover:text-primary"
              >
                {link.name}
              </a>
            ))}
            <hr className="border-primary/10 my-2" />
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="text-center py-3 rounded-xl border border-primary text-primary font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-3 rounded-xl bg-primary text-white font-semibold"
              >
                Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
