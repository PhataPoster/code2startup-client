'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from session or auth
    const getUser = async () => {
      try {
        // For now, using localStorage or you can use Better Auth session
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          // Redirect to role-specific dashboard
          if (parsedUser.role === 'founder') {
            router.push('/dashboard/founder');
          } else if (parsedUser.role === 'collaborator') {
            router.push('/dashboard/collaborator');
          } else if (parsedUser.role === 'admin') {
            router.push('/dashboard/admin');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error getting user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <p>Redirecting...</p>
    </div>
  );
};

export default Dashboard;
