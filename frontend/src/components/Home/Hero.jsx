import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AiOutlineArrowRight } from "react-icons/ai";

const statCards = [
  { value: "24h", label: "Roast-to-ship window" },
  { value: "40+", label: "Flavor-profiled products" },
  { value: "AI", label: "Concierge product matching" },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-8">
      <div className="container relative z-10 mx-auto grid items-center gap-10 lg:grid-cols-[1.15fr,0.85fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="eyebrow"
          >
            Roasted for espresso shots, pour-over clarity, and slow weekend rituals
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl text-5xl font-heading text-white md:text-7xl"
          >
            A modern coffee store with an AI barista that helps.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-stone-300 md:text-xl"
          >
            Arabica beans, espresso machines, and recommendations built around how you brew.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              to="/shop"
              className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-stone-950 shadow-lg shadow-primary/25 transition-all hover:bg-[#dfa15d]"
            >
              Explore the coffee shelf
              <AiOutlineArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#concierge"
              className="rounded-full border border-white/15 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/5"
            >
              Meet the AI concierge
            </a>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {statCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 + index * 0.08 }}
                className="coffee-panel grain-surface p-5"
              >
                <div className="text-3xl font-heading text-white">{card.value}</div>
                <div className="mt-2 text-sm text-stone-400">{card.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="coffee-panel grain-surface relative overflow-hidden p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(208,143,73,0.22),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(93,58,35,0.26),_transparent_34%)]" />
          <div className="relative z-10">
            <div className="rounded-[1.8rem] border border-white/10 bg-[#231712] p-6">
              <div className="eyebrow">Featured Workflow</div>
              <h2 className="mt-3 text-3xl font-heading text-white">Build your complete brew station</h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm uppercase tracking-[0.28em] text-amber-200/70">Build your station</div>
                  <div className="mt-2 text-lg text-white">Beans, gear, and AI shortlists</div>
                  <div className="mt-1 text-sm text-stone-400">
                    Everything you need to brew better, curated for your specific ritual.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
