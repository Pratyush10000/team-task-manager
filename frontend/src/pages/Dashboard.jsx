import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FolderKanban, Loader2, Clock3 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import API from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        } else {
          setError('Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Completed', value: stats.completedTasks || 0 },
      { name: 'Pending', value: stats.pendingTasks || 0 },
      { name: 'Overdue', value: stats.overdueTasks || 0 },
    ];
  }, [stats]);

  const totalTasks = chartData.reduce((sum, item) => sum + item.value, 0) || 1;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">A quick view of projects and task progress.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={<FolderKanban className="text-blue-600" />} />
        <StatCard title="Completed Tasks" value={stats?.completedTasks || 0} icon={<CheckCircle2 className="text-green-600" />} />
        <StatCard title="Pending Tasks" value={stats?.pendingTasks || 0} icon={<Clock3 className="text-amber-600" />} />
        <StatCard title="Overdue Tasks" value={stats?.overdueTasks || 0} icon={<AlertTriangle className="text-rose-600" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Task distribution</h2>
              <p className="text-sm text-slate-500">A simple breakdown of current task status.</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={110} paddingAngle={3}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Progress</h2>
          <p className="text-sm text-slate-500">Quick view of how work is distributed.</p>

          <div className="mt-6 space-y-5">
            {chartData.map((item) => {
              const percent = Math.round((item.value / totalTasks) * 100);
              const barColor =
                item.name === 'Completed'
                  ? 'bg-green-500'
                  : item.name === 'Pending'
                    ? 'bg-amber-500'
                    : 'bg-rose-500';

              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="text-slate-500">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
          {icon}
        </div>
      </div>
    </div>
  );
}