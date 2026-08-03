import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Wind, Cpu, Camera, Cloud, Database, LayoutDashboard } from 'lucide-react';

const steps = [
  { id: 1, title: 'Gas Detection', desc: 'MQ135 sensor detects harmful gases and spikes in AQI.', icon: Wind },
  { id: 2, title: 'Processing', desc: 'ESP32-CAM analyzes the data instantly on the edge.', icon: Cpu },
  { id: 3, title: 'Image Capture', desc: 'Camera module captures visual evidence of the source.', icon: Camera },
  { id: 4, title: 'Cloud Storage', desc: 'Evidence is securely uploaded to Cloudinary.', icon: Cloud },
  { id: 5, title: 'Data Logging', desc: 'Metrics and metadata are logged into MongoDB Atlas.', icon: Database },
  { id: 6, title: 'Instant Alert', desc: 'Municipality dashboard receives real-time web socket alert.', icon: LayoutDashboard },
];

const Solution = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="workflow" className="py-24 relative" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            How It Works
          </motion.h2>
          <p className="text-lg text-slate-400">
            A seamless, automated pipeline from detection to action.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-white/10 rounded-full transform md:-translate-x-1/2" />
          <motion.div 
            className="absolute left-[39px] md:left-1/2 top-0 w-1 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.8)] rounded-full transform md:-translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={step.id} className={`relative flex items-center mb-16 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}>
                
                {/* Timeline Dot */}
                <div className="absolute left-[39px] md:left-1/2 w-8 h-8 rounded-full bg-slate-900 border-4 border-sky-500 transform -translate-x-1/2 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}
                >
                  <div className="glass-card p-6 inline-block w-full">
                    <div className={`w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-4 ${isEven ? 'md:ml-auto' : ''}`}>
                      <step.icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
                
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Solution;
