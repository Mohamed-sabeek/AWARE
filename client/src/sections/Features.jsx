import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Activity, Flame, Camera, Cloud, Bell, LayoutDashboard, FileText, Map, History, Users, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

// --- Extra Animated Visuals for Premium Feel ---
const AISmokeVisual = () => (
  <div className="absolute right-[-20px] top-[20px] w-48 h-48 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500 z-0">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="w-full h-full rounded-full border border-primary border-t-transparent border-l-transparent border-dashed" />
    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-0 m-auto w-12 h-12 bg-primary rounded-full blur-xl" />
  </div>
);

const CameraVisual = () => (
  <div className="absolute right-[20px] bottom-[20px] w-24 h-24 opacity-10 pointer-events-none group-hover:opacity-30 transition-opacity duration-500 z-0">
    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-full h-full border-2 border-primary rounded-lg flex items-center justify-center">
      <div className="w-12 h-12 border border-primary rounded-full" />
      <div className="absolute w-full h-[1px] bg-primary/50" />
      <div className="absolute h-full w-[1px] bg-primary/50" />
    </motion.div>
  </div>
);

const GraphVisual = () => (
  <div className="absolute right-[20px] bottom-[20px] w-32 h-20 opacity-20 pointer-events-none group-hover:opacity-50 flex items-end gap-1.5 transition-opacity duration-500 z-0">
    {[40, 70, 45, 90, 65, 80].map((h, i) => (
      <motion.div key={i} animate={{ height: [`${h}%`, `${Math.min(h+20, 100)}%`, `${h}%`] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} className="w-4 bg-primary rounded-t-sm" />
    ))}
  </div>
);

const ParticlesVisual = () => (
  <div className="absolute right-[10%] top-[30%] w-20 h-20 opacity-20 pointer-events-none group-hover:opacity-50 transition-opacity duration-500 z-0">
    {[...Array(5)].map((_, i) => (
      <motion.div key={i} animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }} transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} className="absolute w-2 h-2 bg-primary rounded-full blur-[1px]" style={{ left: `${i * 20}%` }} />
    ))}
  </div>
);

// --- The Core Interactive Feature Card ---
const FeatureCard = ({ feature }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt (Parallax effect)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse coordinates to rotation (-5 to 5 degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set((mouseX / width) - 0.5);
    y.set((mouseY / height) - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      variants={{
        hidden: { opacity: 0, y: 60, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
      }}
      className={`group relative rounded-[28px] overflow-hidden ${feature.colSpan || 'col-span-1'} transition-all duration-300 hover:-translate-y-3 hover:scale-[1.03] hover:z-20 cursor-pointer`}
    >
      {/* Background layer with blur and inner border */}
      <div className="absolute inset-0 bg-[rgba(255,255,255,0.75)] backdrop-blur-xl border border-white group-hover:border-primary/20 shadow-[0_8px_30px_rgba(47,128,237,0.03)] group-hover:shadow-[0_20px_50px_rgba(47,128,237,0.12)] transition-all duration-300 rounded-[28px]" />
      
      {/* Ambient Blue Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent rounded-[28px] transition-opacity duration-300 pointer-events-none" />

      {/* Actual Content Wrapper (Lifted in 3D space for parallax) */}
      <div className="relative h-full flex flex-col p-8 z-10 pointer-events-none" style={{ transform: "translateZ(40px)" }}>
        
        {/* Header: Icon & Badge */}
        <div className="flex justify-between items-start mb-10">
          <div className="w-[72px] h-[72px] rounded-[24px] bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 group-hover:shadow-[0_0_25px_rgba(47,128,237,0.2)] transition-all duration-300">
            <feature.icon className="w-8 h-8 text-primary group-hover:text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" strokeWidth={1.5} />
            <div className="absolute inset-0 rounded-[24px] bg-primary opacity-0 group-hover:opacity-10 group-hover:animate-ping transition-all duration-300" />
          </div>
          
          {feature.badge && (
            <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-primary/15 text-[11px] font-bold text-primary shadow-sm tracking-widest uppercase">
              {feature.badge}
            </div>
          )}
        </div>

        {/* Text */}
        <div className="mt-auto relative z-10">
          <h3 className="text-[22px] font-extrabold text-text-primary mb-3 leading-tight tracking-tight">{feature.title}</h3>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-8">{feature.desc}</p>
        </div>

        {/* Learn More Arrow */}
        <div className="flex items-center gap-2 text-primary font-semibold text-[14px] mt-auto opacity-0 translate-x-[-15px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
        
        {/* Feature-specific animated visual background */}
        {feature.visual && feature.visual()}
      </div>
    </motion.div>
  );
};

// --- Features Data ---
const features = [
  { title: 'AI Smoke Detection', desc: 'Computer vision algorithms identify visual smoke plumes automatically in real-time, eliminating false positives.', icon: Flame, badge: 'AI Powered', colSpan: 'lg:col-span-2', visual: AISmokeVisual },
  { title: 'Real-time AQI', desc: 'Instantaneous tracking of dangerous pollutants like PM2.5 and CO2.', icon: Activity, badge: 'Live', colSpan: 'lg:col-span-1', visual: ParticlesVisual },
  { title: 'Evidence Capture', desc: 'High-res photo capture the moment a threshold is crossed.', icon: Camera, badge: 'Secure', colSpan: 'lg:col-span-1', visual: CameraVisual },
  { title: 'Government Dashboard', desc: 'A centralized command center tailored for municipality response teams and officials.', icon: LayoutDashboard, badge: 'Government', colSpan: 'lg:col-span-2', visual: GraphVisual },
  { title: 'Instant Alerts', desc: 'WebSocket alerts instantly notify authorities of breaches.', icon: Bell, badge: 'Real-time', colSpan: 'lg:col-span-1' },
  { title: 'Heatmaps', desc: 'Visualize pollution concentration zones dynamically across the city.', icon: Map, badge: 'Live', colSpan: 'lg:col-span-1' },
  { title: 'Cloud Storage', desc: 'Redundant, scalable storage for all violation evidence.', icon: Cloud, badge: 'Cloud', colSpan: 'lg:col-span-1' },
  { title: 'Citizen Reporting', desc: 'Empower locals to report anomalies directly into the platform.', icon: Users, badge: 'App', colSpan: 'lg:col-span-2' },
  { title: 'Historical Analytics', desc: 'Analyze trends over months to form data-driven policies.', icon: History, badge: 'Data', colSpan: 'lg:col-span-1', visual: GraphVisual },
];

// --- Main Section ---
const Features = () => {
  return (
    <section id="features" className="py-32 bg-[var(--color-bg-light)] relative overflow-hidden">
      {/* Background ambient visuals */}
      <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Subtle floating particles in bg */}
      <motion.div animate={{ y: [0, -50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[20%] left-[20%] w-3 h-3 bg-primary/20 rounded-full blur-[2px]" />
      <motion.div animate={{ y: [0, 60, 0], x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[60%] right-[25%] w-4 h-4 bg-accent/20 rounded-full blur-[3px]" />

      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center w-full mx-auto mb-24"
        >
          <h2 className="text-[56px] lg:text-[72px] font-extrabold text-text-primary mb-8 tracking-tight leading-[1.1]">
            <span className="inline-block">A Complete Environmental</span> <br className="hidden md:block" />
            {/* Moving Gradient Text */}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
              Ecosystem
            </span>
          </h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[20px] text-text-secondary leading-relaxed max-w-2xl mx-auto"
          >
            Everything you need to monitor air quality, record violations, and empower authorities to take swift action—all in one immersive platform.
          </motion.p>
        </motion.div>

        {/* Asymmetrical Bento Grid */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[340px]"
          style={{ perspective: "1000px" }}
        >
          {features.map((feat, idx) => (
            <FeatureCard key={idx} feature={feat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
