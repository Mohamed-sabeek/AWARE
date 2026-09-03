import { memo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wind, Activity, Cpu, Sparkles, Camera, Cloud, Database, LayoutDashboard, Bell, Users, Check } from 'lucide-react';

const workflowSteps = [
  { id: 1, title: 'Air Pollution', desc: 'Gas emission', icon: Wind },
  { id: 2, title: 'MQ135 Sensor', desc: 'IoT detection', icon: Activity },
  { id: 3, title: 'ESP32-CAM', desc: 'Edge processing', icon: Cpu },
  { id: 4, title: 'AI Detection', desc: 'Vision analysis', icon: Sparkles },
  { id: 5, title: 'Evidence Capture', desc: 'Image saved', icon: Camera },
  { id: 6, title: 'Cloud Upload', desc: 'AWS/GCP sync', icon: Cloud },
  { id: 7, title: 'MongoDB', desc: 'Data stored', icon: Database },
  { id: 8, title: 'Dashboard', desc: 'Live charts', icon: LayoutDashboard },
  { id: 9, title: 'Authority Alert', desc: 'SMS/Email sent', icon: Bell },
  { id: 10, title: 'Citizen Report', desc: 'App updated', icon: Users },
];

const WorkflowNode = memo(({ step, index, total, isInView = true }) => {
  const getMicroAnimation = (id) => {
     if (!isInView) return null;
     switch(id) {
       case 2: return <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-full border border-primary pointer-events-none transform-gpu" />;
       case 3: return <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="absolute top-[18px] right-[18px] w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e] transform-gpu" />;
       case 4: return <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-[2px] bg-accent shadow-[0_0_8px_#6FC8FF] pointer-events-none transform-gpu" />;
       case 5: return <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 1] }} className="absolute inset-0 bg-white/80 rounded-full pointer-events-none transform-gpu" />;
       case 6: return <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 flex items-center justify-center pointer-events-none transform-gpu"><Cloud className="w-10 h-10 text-primary opacity-20 blur-[2px]" /></motion.div>;
       case 7: return <motion.div animate={{ scaleY: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute bottom-[15px] w-5 h-1.5 bg-primary/40 rounded pointer-events-none origin-bottom transform-gpu" />;
       case 8: return <div className="absolute bottom-[20px] flex gap-1 pointer-events-none items-end"><motion.div animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-3 bg-primary rounded-sm origin-bottom transform-gpu"/><motion.div animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-4 bg-primary rounded-sm origin-bottom transform-gpu"/><motion.div animate={{ scaleY: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-3.5 bg-primary rounded-sm origin-bottom transform-gpu"/></div>;
       case 9: return <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 flex items-center justify-center pointer-events-none transform-gpu"><Bell className="w-10 h-10 text-red-500/20 blur-[2px]" /></motion.div>;
       case 10: return <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.4 + 0.5, type: "spring" }} className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-md pointer-events-none transform-gpu"><Check className="w-4 h-4 text-white stroke-[3]" /></motion.div>;
       default: return null;
     }
  };

  return (
    <div className="flex items-center relative flex-shrink-0">
      
      {/* Node */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.3, type: "spring", stiffness: 200 }}
        className="group relative flex flex-col items-center z-10 cursor-pointer"
      >
        <motion.div 
          animate={isInView ? { y: [-4, 4, -4] } : { y: 0 }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
          className="w-28 h-28 rounded-full bg-white/90 border border-white shadow-[0_20px_40px_rgba(47,128,237,0.1)] flex items-center justify-center relative group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_20px_50px_rgba(47,128,237,0.3)] group-hover:bg-white transition-all duration-300 overflow-hidden transform-gpu"
        >
           {/* Soft Blue Glow behind icon */}
           <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(47,128,237,0.15)_0%,_rgba(255,255,255,0)_70%)] pointer-events-none" />
           
           <step.icon className="w-11 h-11 text-primary relative z-10 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
           
           {/* Data reached glow flash */}
           <motion.div 
             initial={{ opacity: 0 }} 
             whileInView={{ opacity: [0, 1, 0] }} 
             viewport={{ once: true }} 
             transition={{ duration: 1, delay: index * 0.3 }} 
             className="absolute inset-0 bg-primary/30 pointer-events-none" 
           />

           {getMicroAnimation(step.id)}
        </motion.div>
        
        {/* Title & Desc */}
        <div className="absolute top-[130px] w-[150px] text-center">
          <h4 className="text-[14px] font-extrabold text-text-primary tracking-tight leading-tight">{step.title}</h4>
          <p className="text-[11px] text-text-secondary font-medium mt-1">{step.desc}</p>
        </div>
      </motion.div>

      {/* Animated Connector (if not last) */}
      {index !== total - 1 && (
        <div className="w-16 md:w-24 lg:w-32 h-[2px] items-center justify-center relative z-0 mx-2 mt-[-60px]">
          <motion.div 
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.3 + 0.2, originX: 0 }}
            className="w-full h-full bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 relative overflow-hidden rounded-full"
          >
             {/* Animated Particle traveling along path (GPU accelerated translate) */}
             {isInView && (
               <motion.div 
                 animate={{ x: ["-100%", "400%"] }} 
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
                 className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#2F80ED] transform-gpu"
               />
             )}
          </motion.div>
        </div>
      )}
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';

const Workflow = memo(() => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { margin: "50px 0px 50px 0px" });

  return (
    <section ref={sectionRef} id="workflow" className="py-32 bg-[var(--color-bg-light)] relative overflow-hidden">
      
      {/* Background Ambience (No expensive mix-blend-multiply) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse,_rgba(47,128,237,0.08)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none transform-gpu" />

      <div className="container mx-auto relative z-10 w-full max-w-[1600px]">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[48px] md:text-[64px] font-extrabold text-text-primary mb-6 tracking-tight leading-tight"
          >
            End-to-End <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Data Pipeline</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed"
          >
            Watch real-time environmental data seamlessly travel from our physical IoT sensors, through AI verification, directly to government command centers.
          </motion.p>
        </div>

        {/* Horizontal Scrolling Pipeline Container */}
        <div className="w-full overflow-x-auto pb-48 pt-10 px-10 md:px-20 hide-scrollbar flex cursor-grab active:cursor-grabbing snap-x snap-mandatory">
          <div className="flex items-center mx-auto min-w-max pr-20">
            {workflowSteps.map((step, idx) => (
              <div key={step.id} className="snap-center">
                <WorkflowNode step={step} index={idx} total={workflowSteps.length} isInView={isInView} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hide Scrollbar CSS injection */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
});

Workflow.displayName = 'Workflow';

export default Workflow;
