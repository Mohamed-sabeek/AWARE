import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Globe, Mail, Camera } from 'lucide-react';

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
    name: 'Alex Developer',
    role: 'Full Stack Developer',
    description: 'Specializes in scalable backend architecture and responsive web interfaces.',
    badges: ['React', 'Node.js', 'MongoDB'],
    socials: {
      portfolio: '#',
      linkedin: '#',
      github: '#',
      email: 'mailto:#'
    }
  },
  {
    id: 2,
    name: 'Sarah Engineer',
    role: 'AI Engineer',
    description: 'Focuses on computer vision models and real-time inference pipelines.',
    badges: ['AI', 'YOLOv8', 'OpenCV'],
    socials: {
      portfolio: '#',
      linkedin: '#',
      github: '#',
      email: 'mailto:#'
    }
  },
  {
    id: 3,
    name: 'Michael Maker',
    role: 'IoT & Embedded Systems',
    description: 'Designs custom hardware integrations for sensor data collection.',
    badges: ['IoT', 'ESP32', 'C++'],
    socials: {
      portfolio: '#',
      linkedin: '#',
      github: '#',
      email: 'mailto:#'
    }
  },
  {
    id: 4,
    name: 'Emma Mapper',
    role: 'GIS & Data Engineer',
    description: 'Expert in processing satellite imagery and geospatial analysis.',
    badges: ['GIS', 'Mapbox', 'Data'],
    socials: {
      portfolio: '#',
      linkedin: '#',
      github: '#',
      email: 'mailto:#'
    }
  }
];

const badgePositions = [
  { top: '-5%', left: '-5%', delay: 0 },
  { top: '35%', right: '-10%', delay: 0.1 },
  { bottom: '15%', left: '-10%', delay: 0.2 }
];

const SocialIcon = ({ Icon, tooltip, href }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a 
        href={href}
        className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-primary/10 flex items-center justify-center text-text-secondary transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(47,128,237,0.4)] hover:border-primary/50 relative z-10"
      >
        <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
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
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
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
              className="relative bg-white/50 backdrop-blur-3xl border border-white/60 rounded-[32px] p-8 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(47,128,237,0.06)] hover:shadow-[0_16px_48px_rgba(47,128,237,0.15)] hover:-translate-y-2.5 hover:border-primary/20 transition-all duration-500 group h-full"
            >
              {/* Optional Floating Tech Badges (Visible on Hover) */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {member.badges.map((badge, bIdx) => (
                  <motion.div
                    key={bIdx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    className="absolute px-2.5 py-1 bg-white/80 backdrop-blur-md border border-primary/10 rounded-full shadow-sm text-[10px] font-bold text-primary tracking-wide z-20"
                    style={{ ...badgePositions[bIdx] }}
                  >
                    {badge}
                  </motion.div>
                ))}
              </div>

              {/* Profile Placeholder */}
              <div className="w-28 h-28 mx-auto rounded-full border-2 border-dashed border-primary/30 bg-gradient-to-br from-blue-50 to-indigo-50/50 flex flex-col items-center justify-center mb-6 relative group-hover:scale-105 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(47,128,237,0.15)] transition-all duration-500 overflow-hidden z-10">
                <Camera className="w-7 h-7 text-primary/50 mb-1.5 group-hover:text-primary/80 transition-colors" />
                <span className="text-[10px] font-bold text-primary/50 group-hover:text-primary/80 uppercase tracking-widest transition-colors">Photo</span>
              </div>
              
              {/* Details */}
              <h3 className="text-xl font-bold text-text-primary mb-1.5 relative z-10">{member.name}</h3>
              <p className="text-[13px] text-primary font-bold mb-4 uppercase tracking-wider relative z-10 group-hover:text-blue-600 transition-colors drop-shadow-sm">
                {member.role}
              </p>
              <p className="text-[14px] text-text-secondary leading-relaxed mb-8 flex-grow relative z-10">
                {member.description}
              </p>
              
              {/* Social Links */}
              <div className="flex justify-center gap-3 relative z-10 mt-auto">
                <SocialIcon Icon={Globe} tooltip="Portfolio" href={member.socials.portfolio} />
                <SocialIcon Icon={Linkedin} tooltip="LinkedIn" href={member.socials.linkedin} />
                <SocialIcon Icon={Github} tooltip="GitHub" href={member.socials.github} />
                <SocialIcon Icon={Mail} tooltip="Email" href={member.socials.email} />
              </div>

            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Team;
