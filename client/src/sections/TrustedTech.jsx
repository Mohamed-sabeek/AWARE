import { motion } from 'framer-motion';

const technologies = [
  { name: 'ESP32-CAM', desc: 'Smart Camera Module', logo: '🚀' },
  { name: 'MQ135', desc: 'Air Quality Sensor', logo: '💨' },
  { name: 'Cloudinary', desc: 'Cloud Image Storage', logo: '☁️' },
  { name: 'MongoDB', desc: 'Real-time Database', logo: '🍃' },
  { name: 'Node.js', desc: 'Backend Server', logo: '🟢' },
  { name: 'React', desc: 'Frontend Library', logo: '⚛️' },
  { name: 'Socket.IO', desc: 'Real-time Sync', logo: '⚡' },
  { name: 'YOLOv8', desc: 'AI Object Detection', logo: '👁️' },
  { name: 'OpenCV', desc: 'Computer Vision', logo: '📷' },
  { name: 'MediaPipe', desc: 'ML Framework', logo: '🤖' }
];

const TrustedTech = () => {
  return (
    <section className="py-16 bg-white border-y border-primary/5">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <p className="text-center text-sm font-bold text-text-secondary mb-10 uppercase tracking-[0.2em]">
          Built With Trusted Technologies
        </p>
        
        {/* Continuous scrolling container or wrap */}
        <div className="flex flex-wrap justify-center items-center gap-6">
          {technologies.map((tech, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.4 }}
              className="flex items-center gap-4 px-6 py-4 rounded-[20px] bg-white border border-primary/5 shadow-[0_4px_20px_rgba(47,128,237,0.06)] hover:shadow-[0_10px_30px_rgba(47,128,237,0.12)] transition-shadow cursor-pointer"
            >
              <div className="text-3xl bg-primary/5 p-3 rounded-xl">{tech.logo}</div>
              <div className="flex flex-col">
                <span className="text-text-primary font-bold">{tech.name}</span>
                <span className="text-[12px] text-text-secondary font-medium">{tech.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedTech;
