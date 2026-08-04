import Hero from '../sections/Hero';
import Features from '../sections/Features';
import Workflow from '../sections/Workflow';
import TechnologyStack from '../sections/TechnologyStack';
import Team from '../sections/Team';
import Contact from '../sections/Contact';

const Home = () => {
  return (
    <div className="flex flex-col w-full bg-[var(--color-bg-light)]">
      <Hero />
      <Features />
      <Workflow />
      <TechnologyStack />
      <Team />
      <Contact />
    </div>
  );
};

export default Home;
