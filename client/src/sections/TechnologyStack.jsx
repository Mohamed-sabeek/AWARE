import { motion } from 'framer-motion';
import { Monitor, Server, BrainCircuit, Cpu, Database, Cloud } from 'lucide-react';

const stack = [
  { category: 'Frontend', icon: Monitor, tech: 'React, Tailwind CSS, Framer Motion' },
  { category: 'Backend', icon: Server, tech: 'Node.js, Express, Socket.IO' },
  { category: 'AI & Vision', icon: BrainCircuit, tech: 'YOLOv8, OpenCV, MediaPipe' },
  { category: 'Hardware', icon: Cpu, tech: 'ESP32-CAM, MQ135 Sensors' },
  { category: 'Database', icon: Database, tech: 'MongoDB Atlas, Mongoose' },
  { category: 'Cloud Infrastructure', icon: Cloud, tech: 'Cloudinary, JWT Auth' }
];

const TechnologyStack = () => {
  return (
    <section id="technology" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight"
          >
            The Tech <span className="text-primary">Stack</span>
          </motion.h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Built on modern, scalable, and reliable foundations capable of processing thousands of sensor streams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stack.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-8 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <item.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{item.category}</h3>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">{item.tech}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologyStack;
