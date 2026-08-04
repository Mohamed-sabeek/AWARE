import { motion } from 'framer-motion';
import { Globe, Mail, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Github = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const quickLinks = [
  { name: 'Home', path: '#' },
  { name: 'Features', path: '#features' },
  { name: 'Workflow', path: '#workflow' },
  { name: 'Dashboard', path: '#dashboard' },
  { name: 'Technology', path: '#technology' },
  { name: 'Team', path: '#team' },
  { name: 'Contact', path: '#contact' },
];

const resourcesLinks = [
  { name: 'Project Documentation', path: '#' },
  { name: 'GitHub Repository', path: '#' },
  { name: 'Privacy Policy', path: '#' },
  { name: 'Terms of Service', path: '#' },
  { name: 'Contact Us', path: '#contact' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const SocialButton = ({ Icon, href }) => (
  <motion.a
    href={href}
    variants={itemVariants}
    whileHover={{ y: -4, scale: 1.05 }}
    className="w-11 h-11 rounded-full bg-white/60 backdrop-blur-md border border-primary/10 flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-blue-600 hover:text-white hover:border-transparent hover:shadow-[0_8px_20px_rgba(47,128,237,0.3)] group"
  >
    <Icon className="w-[18px] h-[18px] transition-colors" strokeWidth={2} />
  </motion.a>
);

const FooterLink = ({ text, href }) => (
  <motion.a
    href={href}
    variants={itemVariants}
    className="group flex items-center gap-2 text-[15px] font-medium text-text-secondary hover:text-primary transition-colors w-fit relative"
  >
    <div className="overflow-hidden flex items-center relative pr-2">
      <ArrowRight className="w-3.5 h-3.5 absolute -left-4 opacity-0 group-hover:left-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-primary" />
      <span className="transform group-hover:translate-x-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {text}
      </span>
    </div>
    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary/40 transition-all duration-300 group-hover:w-full group-hover:translate-x-5"></span>
  </motion.a>
);

const Footer = () => {
  return (
    <footer className="relative bg-[var(--color-bg-light)] pt-24 pb-8 overflow-hidden">
      
      {/* Subtle Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-400/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-indigo-400/15 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.1] mix-blend-soft-light"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-[1400px]">
        
        {/* Main Footer Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20 text-center lg:text-left"
        >
          {/* Left Section - Brand & Info */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            <motion.a 
              href="#" 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }} 
              className="mb-8 block"
            >
              <img src={logoImg} alt="AWARE" className="h-[70px] w-auto object-contain" />
            </motion.a>
            
            <motion.h3 
              variants={itemVariants}
              className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-5 text-center lg:text-left leading-relaxed"
            >
              Automated Warning and Air Pollution Reporting & Evidence System
            </motion.h3>
            
            <motion.p 
              variants={itemVariants}
              className="text-[15px] text-text-secondary leading-relaxed mb-10 max-w-md text-center lg:text-left font-medium"
            >
              AWARE is an AI-powered environmental monitoring platform that combines IoT, Computer Vision, GIS, and Cloud technologies to detect pollution, capture evidence, and deliver real-time insights for smarter environmental protection.
            </motion.p>
            
            <motion.div 
              variants={containerVariants}
              className="flex gap-4 justify-center lg:justify-start"
            >
              <SocialButton Icon={Globe} href="#" />
              <SocialButton Icon={Linkedin} href="#" />
              <SocialButton Icon={Github} href="#" />
              <SocialButton Icon={Mail} href="#" />
            </motion.div>
          </div>

          {/* Center Section - Quick Links */}
          <div className="lg:col-span-3 lg:col-start-7 flex flex-col items-center lg:items-start">
            <motion.h4 variants={itemVariants} className="text-sm font-bold uppercase tracking-wider text-text-primary mb-8">
              Quick Links
            </motion.h4>
            <ul className="flex flex-col gap-4 items-center lg:items-start">
              {quickLinks.map((link) => (
                <li key={link.name} className="overflow-visible">
                  <FooterLink text={link.name} href={link.path} />
                </li>
              ))}
            </ul>
          </div>

          {/* Right Section - Resources */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start">
            <motion.h4 variants={itemVariants} className="text-sm font-bold uppercase tracking-wider text-text-primary mb-8">
              Resources
            </motion.h4>
            <ul className="flex flex-col gap-4 items-center lg:items-start">
              {resourcesLinks.map((link) => (
                <li key={link.name} className="overflow-visible">
                  <FooterLink text={link.name} href={link.path} />
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="pt-8 border-t border-primary/10 flex flex-col lg:flex-row items-center justify-between gap-6 text-[13px] font-medium text-text-secondary"
        >
          <p className="text-center lg:text-left">&copy; {new Date().getFullYear()} AWARE Team. All Rights Reserved.</p>
          
          <p className="flex items-center gap-1.5 text-center">
            Made with <span className="text-red-500 text-[15px] animate-pulse">❤️</span> for Cleaner Air
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className="font-semibold text-text-primary/70">Version 1.0</span>
          </div>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;
