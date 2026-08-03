import { CloudRain, Globe, Link as LinkIcon, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-primary/30 to-white" />
      
      <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-primary">
                <CloudRain className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary leading-none">AWARE</span>
            </div>
            <p className="text-text-secondary max-w-sm mb-8 leading-relaxed">
              A smart environmental monitoring system powered by AI and cloud technologies that automatically detects pollution and protects communities.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-colors">
                <LinkIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-text-primary font-bold mb-6">Platform</h4>
            <ul className="flex flex-col gap-4 text-text-secondary font-medium">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#technology" className="hover:text-primary transition-colors">Technology</a></li>
              <li><a href="#workflow" className="hover:text-primary transition-colors">Workflow</a></li>
              <li><a href="#dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-text-primary font-bold mb-6">Company</h4>
            <ul className="flex flex-col gap-4 text-text-secondary font-medium">
              <li><a href="#team" className="hover:text-primary transition-colors">Team</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] font-medium text-text-secondary">
          <p>&copy; {new Date().getFullYear()} AWARE System. All rights reserved.</p>
          <p>Designed for the future of clean air.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
