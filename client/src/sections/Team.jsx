import { motion } from 'framer-motion';
import { Globe, Link as LinkIcon, Mail } from 'lucide-react';

const team = [
  {
    name: 'Alex Developer',
    role: 'Full Stack & Hardware',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    github: '#',
    linkedin: '#'
  },
  {
    name: 'Sarah Designer',
    role: 'UI/UX & Product',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    github: '#',
    linkedin: '#'
  },
  {
    name: 'Michael Engineer',
    role: 'AI & Data Processing',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    github: '#',
    linkedin: '#'
  }
];

const Team = () => {
  return (
    <section id="team" className="py-24 bg-[var(--color-bg-light)] relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight"
          >
            The Hackathon <span className="text-primary">Team</span>
          </motion.h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            A diverse group of engineers and designers committed to building sustainable tech solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="glass-card p-8 flex flex-col items-center text-center group"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-1">{member.name}</h3>
              <p className="text-[14px] text-primary font-semibold mb-6 uppercase tracking-wider">{member.role}</p>
              
              <div className="flex justify-center gap-4">
                <a href={member.github} className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <Globe className="w-5 h-5" strokeWidth={2} />
                </a>
                <a href={member.linkedin} className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <LinkIcon className="w-5 h-5" strokeWidth={2} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <Mail className="w-5 h-5" strokeWidth={2} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
