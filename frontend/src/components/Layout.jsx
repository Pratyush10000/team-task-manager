import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu } from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden md:flex w-72 flex-col bg-slate-950 text-white">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Menu size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Team Task Manager</h1>
              <p className="text-xs text-slate-400">Projects. Tasks. Progress.</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-5">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
            <p className="mt-1 inline-flex rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300">
              {user.role || 'MEMBER'}
            </p>
          </div>

          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs text-slate-500">Welcome back</p>
              <h1 className="text-lg font-bold text-slate-900">{user.name || 'Team Member'}</h1>
            </div>
            <button
              onClick={logout}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 pb-4">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`
                }
              >
                <Icon size={16} />
                {name}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}