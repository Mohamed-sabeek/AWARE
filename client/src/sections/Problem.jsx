import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Activity, ShieldAlert } from 'lucide-react';

const problems = [
  {
    title: 'Rising Air Pollution',
    description: 'Urban areas face unprecedented levels of toxic emissions and particulate matter.',
    icon: AlertTriangle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10'
  },
  {
    title: 'Lack of Evidence',
    description: 'Authorities struggle to penalize polluters without verifiable visual proof.',
    icon: ShieldAlert,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10'
  },
  {
    title: 'Delayed Reporting',
    description: 'Manual data collection leads to slow response times during critical incidents.',
    icon: Clock,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  },
  {
    title: 'Health Risks',
    description: 'Communities remain unaware of immediate dangers in their local environment.',
    icon: Activity,
    color: 'text-red-400',
    bg: 'bg-red-500/10'
  }
];

const Problem = () => {
  return (
    <section id="problem" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-900/10 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            The Challenge
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            Traditional monitoring systems are inadequate for modern environmental crises. We need a faster, smarter, and more reliable way to detect and report pollution.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className={`w-14 h-14 rounded-2xl ${prob.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <prob.icon className={`w-7 h-7 ${prob.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">{prob.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{prob.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
