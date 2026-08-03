import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Map, Layout, PieChart, Building } from 'lucide-react';

const roadmapItems = [
  { title: 'AI Smoke Detection', icon: Sparkles, status: 'In Progress' },
  { title: 'AQI Prediction Models', icon: TrendingUp, status: 'Planned' },
  { title: 'Interactive Heatmaps', icon: Map, status: 'Planned' },
  { title: 'Multi-Device Sync', icon: Layout, status: 'In Progress' },
  { title: 'Advanced Analytics', icon: PieChart, status: 'Planned' },
  { title: 'Municipality Portal', icon: Building, status: 'Released' }
];

const Roadmap = () => {
  return (
    <section className="py-24 bg-slate-950/80 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Future Roadmap
            </motion.h2>
            <p className="text-lg text-slate-400">
              We are constantly evolving AWARE to be more intelligent, scalable, and impactful.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <a href="#" className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-2 transition-colors">
              View Full Changelog &rarr;
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapItems.map((item, idx) => {
            const isReleased = item.status === 'Released';
            const isInProgress = item.status === 'In Progress';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 flex flex-col justify-between h-48 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${isReleased ? 'bg-emerald-500/20 text-emerald-400' : isInProgress ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-slate-400'}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isReleased ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    isInProgress ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 
                    'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-white group-hover:text-sky-400 transition-colors">{item.title}</h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
