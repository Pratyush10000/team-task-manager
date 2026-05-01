import { useEffect, useMemo, useState } from 'react';
import { FolderKanban, Plus, Trash2, Users, Loader2, CircleDotDashed } from 'lucide-react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = {
  name: '',
  description: '',
  startDate: '',
  dueDate: '',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [form, setForm] = useState(emptyForm);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsRes, usersRes] = await Promise.all([
        API.get('/projects'),
        user.role === 'ADMIN' ? API.get('/users') : Promise.resolve({ data: [] }),
      ]);

      setProjects(projectsRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableUsers = useMemo(() => {
    if (!selectedProject) return allUsers;
    const memberIds = (selectedProject.members || []).map((m) => m.user.id);
    return allUsers.filter((u) => !memberIds.includes(u.id));
  }, [allUsers, selectedProject]);

  const createProject = async (e) => {
    e.preventDefault();
    await API.post('/projects', form);
    setShowCreate(false);
    setForm(emptyForm);
    loadData();
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project? This will also remove tasks and members.')) return;
    await API.delete(`/projects/${id}`);
    loadData();
  };

  const addMember = async () => {
    if (!selectedProject || !memberToAdd) return;
    await API.post(`/projects/${selectedProject.id}/members`, {
      userId: Number(memberToAdd),
    });
    setMemberToAdd('');
    setShowManage(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading projects...
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-black text-slate-900">
            <FolderKanban className="text-blue-600" />
            Projects
          </h1>
          <p className="mt-2 text-slate-500">Create projects and manage who is part of them.</p>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
          >
            <Plus size={18} />
            New project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No projects yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const members = project.members || [];
            const memberNames = members.map((m) => m.user.name).slice(0, 3);

            return (
              <div key={project.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      <CircleDotDashed size={14} />
                      {project.status}
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-slate-900">{project.name}</h2>
                  </div>

                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <p className="line-clamp-3 min-h-[48px] text-sm text-slate-600">
                  {project.description || 'No description added yet.'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <InfoBox label="Start" value={new Date(project.startDate).toLocaleDateString()} />
                  <InfoBox label="Due" value={new Date(project.dueDate).toLocaleDateString()} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {memberNames.length > 0 ? (
                    memberNames.map((name) => (
                      <span key={name} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      No members yet
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowManage(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
                >
                  <Users size={16} />
                  Manage members ({members.length})
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <Modal title="Create project" onClose={() => setShowCreate(false)}>
          <form onSubmit={createProject} className="space-y-4">
            <Input label="Project name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Start date" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
              <Input label="Due date" type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
            </div>

            <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white">
              Create project
            </button>
          </form>
        </Modal>
      )}

      {showManage && selectedProject && (
        <Modal title={`Manage members · ${selectedProject.name}`} onClose={() => setShowManage(false)}>
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Add member</label>
              <select
                value={memberToAdd}
                onChange={(e) => setMemberToAdd(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select a user</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <button
                onClick={addMember}
                className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white"
              >
                Add to project
              </button>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Current members
              </h3>

              <div className="space-y-2">
                {(selectedProject.members || []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-slate-800">{m.user.name}</span>
                    <span className="text-xs text-slate-500">{m.user.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}