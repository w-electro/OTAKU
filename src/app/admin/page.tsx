import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Film, Download, CreditCard, TrendingUp, Clock } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard - AnimeUltra 4K',
};

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch dashboard stats
  const [
    totalUsers,
    totalAnime,
    totalEpisodes,
    activeSubscriptions,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.anime.count(),
    prisma.episode.count(),
    prisma.subscription.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscription: {
          select: { tier: true, status: true },
        },
      },
    }),
  ]);

  // Subscription breakdown
  const subscriptionStats = await prisma.subscription.groupBy({
    by: ['tier'],
    _count: true,
    where: { status: 'ACTIVE' },
  });

  const enhancedEpisodes = await prisma.episode.count({
    where: { is4KEnhanced: true },
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-gray-800 border-r border-gray-700">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg" />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                  A
                </span>
              </div>
              <span className="text-xl font-bold text-white">Admin</span>
            </Link>
          </div>

          <nav className="px-4 space-y-1">
            <NavItem href="/admin" icon={TrendingUp} active>
              Dashboard
            </NavItem>
            <NavItem href="/admin/users" icon={Users}>
              Users
            </NavItem>
            <NavItem href="/admin/anime" icon={Film}>
              Anime
            </NavItem>
            <NavItem href="/admin/episodes" icon={Clock}>
              Episodes
            </NavItem>
            <NavItem href="/admin/subscriptions" icon={CreditCard}>
              Subscriptions
            </NavItem>
            <NavItem href="/admin/sync" icon={Download}>
              Sync Data
            </NavItem>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Total Anime"
              value={totalAnime}
              icon={Film}
              color="purple"
            />
            <StatCard
              title="4K Episodes"
              value={enhancedEpisodes}
              icon={Clock}
              color="green"
            />
            <StatCard
              title="Active Subs"
              value={activeSubscriptions}
              icon={CreditCard}
              color="yellow"
            />
          </div>

          {/* Content Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionStats.map((stat) => (
                    <div key={stat.tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          stat.tier === 'ULTIMATE' ? 'bg-yellow-500' :
                          stat.tier === 'PREMIUM' ? 'bg-purple-500' :
                          stat.tier === 'BASIC' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-gray-300">{stat.tier}</span>
                      </div>
                      <span className="text-white font-semibold">{stat._count}</span>
                    </div>
                  ))}
                  {subscriptionStats.length === 0 && (
                    <p className="text-gray-400">No active subscriptions</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {user.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                          user.subscription?.tier === 'ULTIMATE' ? 'bg-yellow-500/20 text-yellow-400' :
                          user.subscription?.tier === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400' :
                          user.subscription?.tier === 'BASIC' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.subscription?.tier || 'FREE'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/sync"
                className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
              >
                <Download className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-white mb-1">Sync Anime Data</h3>
                <p className="text-sm text-gray-400">
                  Import trending anime from AniList API
                </p>
              </Link>
              <Link
                href="/admin/episodes/upload"
                className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
              >
                <Film className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold text-white mb-1">Upload Episodes</h3>
                <p className="text-sm text-gray-400">
                  Batch upload 4K enhanced episodes
                </p>
              </Link>
              <Link
                href="/admin/users"
                className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
              >
                <Users className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-white mb-1">Manage Users</h3>
                <p className="text-sm text-gray-400">
                  View and manage user accounts
                </p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  children,
  active = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-primary/20 text-primary'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </Link>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'purple' | 'green' | 'yellow';
}) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
