import { memo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = memo(() => {
  return (
    <section id="contact" className="py-24 bg-[var(--color-bg-light)] relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none transform-gpu" />

      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight">
              Get in <span className="text-primary">Touch</span>
            </h2>
            <p className="text-lg text-text-secondary mb-12">
              Interested in deploying AWARE in your city? Reach out to our team for a consultation and live demonstration.
            </p>

            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary">Email Us</h4>
                  <p className="text-text-secondary mt-1">safeeofficial1730@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary">Call Us</h4>
                  <p className="text-text-secondary mt-1">6383028607</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary">Location</h4>
                  <p className="text-text-secondary mt-1">Coimbatore</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-2/3"
          >
            <div className="glass-card p-10">
              <form className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-text-primary mb-2">First Name</label>
                    <input type="text" className="px-5 py-4 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:outline-none focus:border-primary/50 transition-colors shadow-sm" placeholder="Monkey D" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-text-primary mb-2">Last Name</label>
                    <input type="text" className="px-5 py-4 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:outline-none focus:border-primary/50 transition-colors shadow-sm" placeholder="Luffy" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-text-primary mb-2">Email Address</label>
                  <input type="email" className="px-5 py-4 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:outline-none focus:border-primary/50 transition-colors shadow-sm" placeholder="luffy@strawhat.com" />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-text-primary mb-2">Message</label>
                  <textarea rows="4" className="px-5 py-4 rounded-xl border border-primary/10 bg-white/50 focus:bg-white focus:outline-none focus:border-primary/50 transition-colors shadow-sm resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-[0_8px_20px_rgba(47,128,237,0.3)] hover:shadow-[0_12px_25px_rgba(47,128,237,0.4)] transition-all"
                >
                  Send Message
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
});

Contact.displayName = 'Contact';

export default Contact;
