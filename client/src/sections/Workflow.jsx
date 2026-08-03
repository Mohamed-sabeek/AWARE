import { motion } from 'framer-motion';
import { Wind, Activity, Cpu, Sparkles, Camera, Cloud, Database, LayoutDashboard, Bell, Users } from 'lucide-react';

const workflowSteps = [
  { id: 1, title: 'Air Pollution', icon: Wind },
  { id: 2, title: 'MQ135 Sensor', icon: Activity },
  { id: 3, title: 'ESP32-CAM', icon: Cpu },
  { id: 4, title: 'AI Detection', icon: Sparkles },
  { id: 5, title: 'Evidence Capture', icon: Camera },
  { id: 6, title: 'Cloud Upload', icon: Cloud },
  { id: 7, title: 'MongoDB', icon: Database },
  { id: 8, title: 'Dashboard', icon: LayoutDashboard },
  { id: 9, title: 'Authority Notification', icon: Bell },
  { id: 10, title: 'Citizen Report', icon: Users },
];

const Workflow = () => {
  return (
    <section id="workflow" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight"
          >
            End-to-End <span className="text-primary">Workflow</span>
          </motion.h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            A fully automated pipeline that turns raw environmental data into actionable intelligence in milliseconds.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row flex-wrap justify-center items-center gap-y-12 gap-x-6">
          {workflowSteps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="flex items-center"
            >
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full bg-white border border-primary/10 shadow-[0_8px_30px_rgba(47,128,237,0.1)] flex items-center justify-center mb-4 group-hover:border-primary/40 group-hover:shadow-[0_12px_40px_rgba(47,128,237,0.2)] transition-all z-10 relative">
                  <step.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  {/* Subtle pulsing ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-20" />
                </div>
                <span className="text-sm font-bold text-text-primary text-center max-w-[100px] leading-tight">
                  {step.title}
                </span>
              </div>

              {/* Glowing Connector (hide on last item, adjust layout for mobile) */}
              {idx !== workflowSteps.length - 1 && (
                <div className="hidden md:block w-12 h-1 bg-gradient-to-r from-primary/20 to-primary/60 rounded-full mx-4 mb-8 shadow-[0_0_10px_rgba(47,128,237,0.4)]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
