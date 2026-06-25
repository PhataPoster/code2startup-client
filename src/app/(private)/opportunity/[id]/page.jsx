'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@/lib/use-session';
import { proxyApi } from '@/lib/api';

const OpportunityDetails = () => {
  const { id } = useParams();
  const { user } = useSession();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [formData, setFormData] = useState({
    portfolio_link: '',
    motivation: '',
  });

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        // Authenticated fetch via the Next.js proxy route.
        const { data } = await proxyApi.get(`/opportunities/${id}`);
        setOpportunity(data);
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOpportunity();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      alert('You must be signed in to apply.');
      return;
    }
    setApplying(true);
    try {
      // Authenticated POST via the Next.js proxy route. The proxy injects the
      // caller's JWT, so the backend can trust applicant_email on the server.
      await proxyApi.post('/applications', {
        opportunity_id: id,
        applicant_email: user.email,
        applicant_name: user.name || '',
        portfolio_link: formData.portfolio_link,
        motivation: formData.motivation,
      });
      alert('Application submitted successfully!');
      setFormData({ portfolio_link: '', motivation: '' });
    } catch (error) {
      console.error('Error applying:', error);
      alert(error?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-white text-xl">Opportunity not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-linear-to-br from-zinc-900 via-zinc-900 to-orange-950/40 p-8 sm:p-12">
            <h1 className="text-4xl font-black sm:text-5xl">{opportunity.role_title}</h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200">
                {opportunity.work_type}
              </span>
              <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
                {opportunity.commitment_level}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold">Required Skills</h2>
                <p className="mt-3 text-lg text-zinc-300">{opportunity.required_skills || 'No specific skills required'}</p>

                <h2 className="mt-8 text-2xl font-bold">Details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-zinc-400">Work Type</p>
                    <p className="mt-2 text-lg font-bold">{opportunity.work_type}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-zinc-400">Commitment Level</p>
                    <p className="mt-2 text-lg font-bold">{opportunity.commitment_level}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-zinc-400">Deadline</p>
                    <p className="mt-2 text-lg font-bold">{new Date(opportunity.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-zinc-400">Posted On</p>
                    <p className="mt-2 text-lg font-bold">{new Date(opportunity.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Apply Form */}
              <div className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-6">
                <h3 className="text-xl font-bold">Apply Now</h3>
                <form onSubmit={handleApply} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Portfolio Link</label>
                    <input
                      type="url"
                      placeholder="https://example.com/portfolio"
                      value={formData.portfolio_link}
                      onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Motivation</label>
                    <textarea
                      placeholder="Tell us why you're interested..."
                      value={formData.motivation}
                      onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-400 focus:outline-none"
                      rows="5"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full rounded-lg bg-orange-500 px-4 py-2 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OpportunityDetails;
