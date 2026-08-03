import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

const stats = [
  { label: 'Detection Time (ms)', value: 450, suffix: 'ms' },
  { label: 'Detection Accuracy', value: 98, suffix: '%' },
  { label: 'Cloud Upload Success', value: 99.9, suffix: '%' },
  { label: 'Active Devices', value: 1200, suffix: '+' }
];

const AnimatedCounter = ({ value, suffix }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: 2000
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        // If value has decimals, show 1 decimal place, else integer
        const isFloat = value % 1 !== 0;
        ref.current.textContent = isFloat ? latest.toFixed(1) + suffix : Math.floor(latest) + suffix;
      }
    });
  }, [springValue, value, suffix]);

  return <span ref={ref} className="text-4xl md:text-5xl font-bold text-white mb-2 block tracking-tighter">0{suffix}</span>;
};

const Statistics = () => {
  return (
    <section className="py-20 border-y border-white/5 bg-slate-950">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-white/10 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-4">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
