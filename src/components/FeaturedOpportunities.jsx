'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchFeaturedOpportunities } from '@/lib/fetch';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function FeaturedOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchFeaturedOpportunities();
        if (!cancelled) setOpportunities(data);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading opportunities:', error);
          setOpportunities([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Featured Opportunities</h2>
          <div className="mt-12 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          className="mb-10 max-w-2xl"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
            Featured Opportunities
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Join Amazing Teams
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Explore the latest opportunities to collaborate with exciting startups.
          </p>
        </motion.div>

        {opportunities.length > 0 ? (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {opportunities.map((opp) => (
              <motion.article
                key={opp._id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-sm duration-300 hover:border-orange-400/30"
              >
                <div className="flex h-32 items-center justify-center bg-linear-to-br from-zinc-900 via-zinc-900 to-orange-950/40 p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-orange-300">{opp.role_title}</h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                      {opp.work_type}
                    </span>
                    <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                      {opp.commitment_level}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">
                    <strong>Skills:</strong> {opp.required_skills || 'No specific skills'}
                  </p>
                  <div className="mt-auto">
                    <p className="mt-3 text-xs text-zinc-500">
                      <strong>Deadline:</strong> {new Date(opp.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-zinc-300"
          >
            No opportunities available yet.
          </motion.div>
        )}
      </div>
    </section>
  );
}

