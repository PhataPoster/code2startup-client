'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Users, Zap, Globe } from 'lucide-react';

const reasons = [
  {
    icon: Users,
    title: 'Connect with Talent',
    description: 'Find skilled collaborators who share your vision and passion for building amazing products.',
  },
  {
    icon: Zap,
    title: 'Accelerate Growth',
    description: 'Build your team faster and bring your startup ideas to life with the right people on board.',
  },
  {
    icon: CheckCircle2,
    title: 'Verified Profiles',
    description: 'All collaborators are verified to ensure quality matches and genuine opportunities.',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with talented individuals from around the world to build diverse, dynamic teams.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export default function WhyJoinSection() {
  return (
    <section className="bg-gradient-to-b from-zinc-950 to-orange-950/20 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
            Why Join Us
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Why StartupForge?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            Join thousands of founders and collaborators building the next generation of startups.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur-sm transition duration-300 hover:border-orange-400/30 hover:bg-orange-500/5"
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <motion.div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-orange-400 group-hover:text-orange-300"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
                <h3 className="text-lg font-bold text-white">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{reason.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {[
            { number: '5K+', label: 'Active Founders' },
            { number: '12K+', label: 'Opportunities Posted' },
            { number: '2K+', label: 'Successful Teams' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-6 text-center"
              whileHover={{ scale: 1.05, borderColor: 'rgb(249, 115, 22, 0.5)' }}
            >
              <motion.p
                className="text-3xl font-black text-orange-400 sm:text-4xl"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {stat.number}
              </motion.p>
              <p className="mt-2 text-sm font-semibold text-orange-200">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
