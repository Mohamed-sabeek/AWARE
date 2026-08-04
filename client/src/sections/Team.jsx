import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Globe, Mail, Camera } from 'lucide-react';
import sabeekImg from '../assets/sabeek.png';
import nivethaImg from '../assets/nivetha.png';
import abiramiImg from '../assets/abirami.png';
import monishImg from '../assets/monish.png';

const Github = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const teamData = [
  {
    id: 1,
    name: 'Mohamed Sabeek',
    role: 'Team Lead • Full-Stack Developer • UI/UX Designer',
    description: 'Leading the development of AWARE by designing the user experience and building the complete full-stack platform, integrating AI, IoT, GIS, and cloud technologies into a unified environmental monitoring solution.',
    badges: ['React', 'Node.js', 'MongoDB'],
    image: sabeekImg,
    socials: {
      portfolio: 'https://myportfolio-alpha-gules-77.vercel.app/',
      linkedin: 'https://www.linkedin.com/in/mohamed-sabeek-1a272a327/',
      github: 'https://github.com/Mohamed-sabeek',
      email: 'mailto:safeeofficial1730@gmail.com'
    }
  },
  {
    id: 4,
    name: 'Monish',
    role: 'GIS & Data Engineer',
    description: 'Expert in processing satellite imagery and geospatial analysis.',
    badges: ['GIS', 'Mapbox', 'Data'],
    image: monishImg,
    socials: {
      portfolio: '#',
      linkedin: '#',
      github: '#',
      email: 'mailto:#'
    }
  },
  {
    id: 2,
    name: 'Abirami S',
    role: 'Software Developer ',
    image: abiramiImg,
    socials: {
      portfolio: 'https://portfolio-deploy-pi-six.vercel.app/',
      linkedin: 'https://www.linkedin.com/in/abirami-s-7138a8332/',
      github: 'https://github.com/abiramiit',
      email: 'mailto:abirami.s2024it@sece.ac.in'
    }
  },
  {
    id: 3,
    name: 'Nivetha',
    role: 'Software Developer',
    image: nivethaImg,
    socials: {
      portfolio: 'https://nivetha-k-software-developer-portfolio-9mlooyr3q.vercel.app',
      linkedin: 'https://www.linkedin.com/in/nivetha-k-1b4832327',
      github: 'https://github.com/Nivetha-K-max',
      email: 'mailto:nivetha.k2024it@sece.ac.in'
    }
  }
];

const badgePositions = [
  { top: '-5%', left: '-5%', delay: 0 },
  { top: '35%', right: '-10%', delay: 0.1 },
  { bottom: '15%', left: '-10%', delay: 0.2 }
];

const SocialIcon = ({ Icon, tooltip, href, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a 
        href={href}
        style={{ transitionDelay: `0s, ${delay}s, 0s` }}
        className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-primary/10 flex items-center justify-center text-text-secondary transition-all duration-300 hover:!bg-gradient-to-br hover:!from-primary hover:!to-blue-600 hover:!text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(47,128,237,0.4)] hover:border-transparent relative z-10 group-hover:-translate-y-1.5"
      >
        <Icon className="w-4 h-4 transition-colors" strokeWidth={2.5} />
      </a>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-xl text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 flex flex-col items-center"
          >
            {tooltip}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45 border-r border-b border-gray-700/50"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Team = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="team" className="py-32 bg-[var(--color-bg-light)] relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-blue-400/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[45rem] h-[45rem] bg-indigo-400/15 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-[1400px]">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight"
          >
            AWARE{' '}
            <span className="bg-gradient-to-r from-blue-500 via-primary to-blue-700 bg-[length:200%_auto] animate-gradient text-transparent bg-clip-text">
              Team
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium"
          >
            Meet the passionate engineers behind AWARE, combining AI, IoT, Computer Vision, GIS, and Full-Stack Development to build intelligent environmental monitoring solutions.
          </motion.p>
        </div>

        {/* Team Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1400px] mx-auto"
        >
          {teamData.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="relative bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] overflow-hidden flex flex-col items-center text-center shadow-[0_8px_32px_rgba(47,128,237,0.04)] hover:shadow-[0_16px_48px_rgba(47,128,237,0.12)] hover:-translate-y-2 hover:border-primary/30 transition-all duration-500 group h-[460px]"
            >
              {/* Profile Image Section (Approx 65%) */}
              <div className="w-full h-[65%] relative pt-4 px-4">
                {/* Background Gradient & Glow */}
                <div className="absolute inset-4 rounded-[24px] bg-gradient-to-b from-blue-100/40 to-indigo-50/20 group-hover:from-blue-200/50 group-hover:to-primary/10 transition-colors duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-primary/10 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                </div>
                
                {/* Image / Placeholder */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full relative z-10 flex items-end justify-center pb-2"
                >
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-[90%] h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(47,128,237,0.15)] group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-primary/30 group-hover:text-primary/60 transition-colors pb-8">
                      <Camera className="w-10 h-10 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Photo</span>
                    </div>
                  )}
                </motion.div>
              </div>
              
              {/* Bottom Information Panel (Approx 35%) */}
              <div className="w-full flex-1 flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md border-t border-white/50 relative z-20">
                <h3 className="text-lg font-extrabold text-blue-950 mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                <p className="text-[11px] font-bold text-primary uppercase tracking-widest leading-snug px-2 text-center">
                  {member.role.split('•').map((part, i, arr) => (
                    <span key={i}>
                      {part.trim()}
                      {i < arr.length - 1 && <span className="mx-1 text-primary/50">•</span>}
                    </span>
                  ))}
                </p>
                
                {/* Social Links */}
                <div className="flex justify-center gap-3 mt-4 w-full">
                  <SocialIcon Icon={Globe} tooltip="Portfolio" href={member.socials.portfolio} delay={0} />
                  <SocialIcon Icon={Linkedin} tooltip="LinkedIn" href={member.socials.linkedin} delay={0.05} />
                  <SocialIcon Icon={Github} tooltip="GitHub" href={member.socials.github} delay={0.1} />
                  <SocialIcon Icon={Mail} tooltip="Email" href={member.socials.email} delay={0.15} />
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Team;
