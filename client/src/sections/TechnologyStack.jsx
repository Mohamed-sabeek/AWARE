import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Cpu, Radio, ScanEye, Network, Satellite, Database, Zap, Bot, Cloud, Lock, Wifi } from 'lucide-react';

const techGroups = [
  {
    title: 'IoT',
    items: [
      { id: 'esp32', name: 'ESP32-CAM', tooltip: 'Wireless Camera Module', icon: Cpu, color: '#3b82f6', isLucide: true },
      { id: 'mq135', name: 'MQ135', tooltip: 'Air Quality Sensor', icon: Radio, color: '#eab308', isLucide: true },
    ]
  },
  {
    title: 'AI & Computer Vision',
    items: [
      { id: 'yolo', name: 'YOLOv8', tooltip: 'Object Detection', icon: ScanEye, color: '#06b6d4', isLucide: true },
      { id: 'opencv', name: 'OpenCV', tooltip: 'Computer Vision', src: 'https://cdn.simpleicons.org/opencv/5C3EE8' },
      { id: 'mediapipe', name: 'MediaPipe', tooltip: 'ML Pipeline', icon: Network, color: '#0ea5e9', isLucide: true },
    ]
  },
  {
    title: 'GIS & Mapping',
    items: [
      { id: 'sentinel', name: 'Sentinel-5P', tooltip: 'Satellite Imagery', icon: Satellite, color: '#3b82f6', isLucide: true },
      { id: 'mapbox', name: 'Mapbox', tooltip: 'Custom Maps', src: 'https://cdn.simpleicons.org/mapbox/000000' },
      { id: 'cpcb', name: 'CPCB Data', tooltip: 'Air Quality Data', icon: Database, color: '#10b981', isLucide: true },
    ]
  },
  {
    title: 'Backend',
    items: [
      { id: 'node', name: 'Node.js', tooltip: 'Runtime Environment', src: 'https://cdn.simpleicons.org/nodedotjs/5FA04E' },
      { id: 'express', name: 'Express.js', tooltip: 'Web Framework', src: 'https://cdn.simpleicons.org/express/000000' },
      { id: 'socket', name: 'Socket.IO', tooltip: 'Real-Time Data', src: 'https://cdn.simpleicons.org/socketdotio/010101' },
    ]
  },
  {
    title: 'Frontend',
    items: [
      { id: 'react', name: 'React', tooltip: 'Frontend Framework', src: 'https://cdn.simpleicons.org/react/61DAFB' },
      { id: 'tailwind', name: 'Tailwind CSS', tooltip: 'Styling', src: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
      { id: 'framer', name: 'Framer Motion', tooltip: 'Animations', src: 'https://cdn.simpleicons.org/framer/000000' },
    ]
  },
  {
    title: 'Cloud & Database',
    items: [
      { id: 'mongo', name: 'MongoDB', tooltip: 'Database', src: 'https://cdn.simpleicons.org/mongodb/47A248' },
      { id: 'cloudinary', name: 'Cloudinary', tooltip: 'Media Storage', src: 'https://cdn.simpleicons.org/cloudinary/3448C5' },
      { id: 'jwt', name: 'JWT Auth', tooltip: 'Authentication', src: 'https://cdn.simpleicons.org/jsonwebtokens/000000' },
    ]
  }
];

const statusBadges = [
  { text: 'Real-Time Processing', icon: Zap },
  { text: 'AI Powered', icon: Bot },
  { text: 'Satellite Intelligence', icon: Satellite },
  { text: 'Cloud Connected', icon: Cloud },
  { text: 'Secure Architecture', icon: Lock },
  { text: 'IoT Enabled', icon: Wifi },
];

const TechnologyStack = () => {
  const [hoveredTech, setHoveredTech] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="technology" className="py-32 relative bg-[var(--color-bg-light)] overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-blue-400/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-indigo-400/15 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-[1400px]">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight">
            Powered by Advanced{' '}
            <span className="bg-gradient-to-r from-blue-500 via-primary to-blue-700 bg-[length:200%_auto] animate-gradient text-transparent bg-clip-text">
              Technologies
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
            AWARE combines AI, IoT, GIS, Cloud Computing, Computer Vision, and Real-Time Communication to build an intelligent environmental monitoring platform.
          </p>
        </motion.div>

        {/* Premium Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {techGroups.map((group, gIdx) => (
            <motion.div
              key={gIdx}
              variants={cardVariants}
              className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[32px] p-8 md:p-10 shadow-[0_8px_32px_rgba(47,128,237,0.04)] hover:shadow-[0_16px_48px_rgba(47,128,237,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col relative group"
            >
              {/* Card Hover Glow */}
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary/70 mb-8 text-center relative z-10">
                {group.title}
              </h3>
              
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 relative z-10">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex flex-col items-center gap-3 cursor-pointer"
                    onMouseEnter={() => setHoveredTech(item.id)}
                    onMouseLeave={() => setHoveredTech(null)}
                  >
                    {/* Logo Container */}
                    <motion.div 
                      whileHover={{ y: -6, scale: 1.1 }}
                      animate={{ rotate: hoveredTech === item.id ? 0 : [0, 2, -2, 0] }}
                      transition={{ 
                        rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                        scale: { type: 'spring', stiffness: 400, damping: 25 },
                        y: { type: 'spring', stiffness: 400, damping: 25 }
                      }}
                      className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center relative z-10"
                    >
                      {/* Logo Glow effect on hover */}
                      <div className={`absolute inset-0 blur-md rounded-2xl opacity-0 transition-opacity duration-500 ${hoveredTech === item.id ? 'opacity-30' : ''}`} style={{ backgroundColor: item.isLucide ? item.color : '#3b82f6' }}></div>
                      
                      {item.isLucide ? (
                        <item.icon 
                          className="w-8 h-8 relative z-10 transition-all duration-300"
                          style={{ 
                            color: item.color,
                            filter: hoveredTech === item.id ? 'brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                          }}
                          strokeWidth={1.5}
                        />
                      ) : (
                        <img 
                          src={item.src} 
                          alt={item.name} 
                          className="w-8 h-8 object-contain relative z-10 transition-all duration-300"
                          style={{
                            filter: hoveredTech === item.id ? 'brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Technology Name */}
                    <span className={`text-[13px] font-bold transition-colors duration-300 ${hoveredTech === item.id ? 'text-primary' : 'text-text-secondary'}`}>
                      {item.name}
                    </span>

                    {/* Floating Tooltip */}
                    <AnimatePresence>
                      {hoveredTech === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none z-50 flex flex-col items-center min-w-max"
                        >
                          {item.tooltip}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45 border-r border-b border-gray-700/50"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Status Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px' }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-3 md:gap-5 max-w-5xl mx-auto"
        >
          {statusBadges.map((badge, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2.5 px-5 py-2.5 bg-white/60 backdrop-blur-xl rounded-full border border-primary/10 shadow-[0_2px_10px_rgba(47,128,237,0.05)] text-[13px] font-bold text-text-primary animate-pulse-slow hover:border-primary/30 transition-colors cursor-default"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <badge.icon className="w-4 h-4 text-primary" strokeWidth={2.5} />
              {badge.text}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default TechnologyStack;
