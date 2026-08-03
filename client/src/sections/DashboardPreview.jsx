import { motion } from 'framer-motion';
import dashboardImg from '../assets/light-dashboard.png';

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="py-24 relative overflow-hidden bg-[var(--color-bg-light)] border-t border-primary/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight"
          >
            The Command <span className="text-primary">Center</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-secondary leading-relaxed"
          >
            Monitor every sensor, view live camera feeds, and manage alerts from a unified, beautiful interface.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden border border-white shadow-[0_20px_80px_rgba(47,128,237,0.15)] bg-white p-2"
        >
          <div className="rounded-[1.5rem] overflow-hidden border border-primary/5">
            <img 
              src={dashboardImg} 
              alt="Dashboard Preview Mockup" 
              className="w-full h-auto object-cover block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
