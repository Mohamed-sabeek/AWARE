import { motion } from 'framer-motion';
import { ArrowRight, Activity, Cloud, Camera, Wifi, Database } from 'lucide-react';
import heroBg from '../assets/hero-bg.png'; // Make sure this image is available

const floatingCards = [
  { title: 'Live AQI', value: '42 Good', icon: Activity, position: 'top-[10%] left-[5%]', delay: 0 },
  { title: 'ESP32-CAM', value: 'Online', icon: Camera, position: 'top-[15%] right-[5%]', delay: 0.2 },
  { title: 'MQ135', value: 'Active', icon: Cloud, position: 'top-[45%] -left-[5%]', delay: 0.4 },
  { title: 'Cloud Upload', value: 'Real-time', icon: Wifi, position: 'top-[50%] -right-[5%]', delay: 0.6 },
  { title: 'Auto Capture', value: 'Enabled', icon: Camera, position: 'bottom-[15%] left-[10%]', delay: 0.8 },
  { title: 'Live Data', value: 'Streaming', icon: Database, position: 'bottom-[15%] right-[10%]', delay: 1 },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* FULL SCREEN BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img 
          src={heroBg} 
          alt="AWARE Background" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] z-0 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Side (40%) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full lg:w-[40%] z-10 flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[13px] font-semibold text-text-secondary">Next-Gen Air Quality Monitoring</span>
            </div>
            
            <h1 className="text-6xl lg:text-[72px] font-extrabold text-text-primary leading-[1.05] mb-6 tracking-tight">
              Detect.<br />
              Capture.<br />
              <span className="text-gradient">Report.<br />Protect.</span>
            </h1>
            
            <p className="text-lg text-text-secondary mb-10 max-w-lg leading-relaxed">
              AWARE automatically detects air pollution, captures visual evidence, analyzes air quality using sensors and AI, and reports incidents in real-time for environmental protection.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#platform"
                className="group flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-semibold shadow-[0_8px_25px_rgba(47,128,237,0.3)] hover:shadow-[0_12px_30px_rgba(47,128,237,0.4)] transition-all"
              >
                Explore Platform
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#dashboard"
                className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white border border-primary/15 text-primary font-semibold shadow-sm hover:shadow-md transition-all"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>

            {/* Trusted Users */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
              </div>
              <p className="text-sm font-medium text-text-secondary max-w-[200px] leading-snug">
                Trusted by environmental advocates and smart cities worldwide
              </p>
            </div>
          </motion.div>

          {/* Right Side (60%) */}
          <div className="w-full lg:w-[60%] relative h-[600px] lg:h-[800px] flex items-center justify-center -z-10 pointer-events-none">
            {/* The background image is now full screen behind everything */}

            {/* We recreate the HTML floating cards over the image in case they need to be interactive */}
            {floatingCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -10, 0] }}
                transition={{
                  opacity: { duration: 0.8, delay: card.delay + 0.5 },
                  y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: card.delay }
                }}
                className={`absolute ${card.position} glass-card px-5 py-3 flex items-center gap-4 cursor-pointer hidden md:flex`}
              >
                <div className="text-primary">
                  <card.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">{card.title}</span>
                  <span className="text-[13px] font-semibold text-green-500">{card.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
