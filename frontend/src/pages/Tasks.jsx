import { useEffect, useState } from 'react';
import API from '../api/axios';
import { CheckSquare, Plus, Edit, Trash2, X } from 'lucide-react';

const emptyForm = {
  title: '',
  description: '',
  projectId: '',
  assignedTo: '',
  priority: 'MEDIUM',
  dueDate: '',
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [tasksRes, projectsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/projects'),
      ]);

      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!form.projectId) {
        setMembers([]);
        return;
      }

      const res = await API.get(`/projects/${form.projectId}/members`);
      setMembers(res.data);
    };

    fetchMembers();
  }, [form.projectId]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      projectId: String(task.projectId),
      assignedTo: task.assignedTo ? String(task.assignedTo) : '',
      priority: task.priority,
      dueDate: task.dueDate ? String(task.dueDate).split('T')[0] : '',
    });
    setShowModal(true);
  };

  const saveTask = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      projectId: Number(form.projectId),
      assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
    };

    if (editId) {
      await API.put(`/tasks/${editId}`, payload);
    } else {
      await API.post('/tasks', payload);
    }

    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    loadData();
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await API.delete(`/tasks/${id}`);
    loadData();
  };

  const updateStatus = async (id, status) => {
    await API.put(`/tasks/${id}/status`, { status });
    loadData();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading tasks...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckSquare /> Tasks
          </h1>
          <p className="text-slate-500 mt-1">Track work and deadlines</p>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
          >
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No tasks yet.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Project: {task.project?.name || '—'} | Assigned: {task.assignee?.name || 'Unassigned'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Priority: {task.priority} | Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                {user.role === 'ADMIN' && (
                  <>
                    <button onClick={() => openEdit(task)} className="text-slate-400 hover:text-blue-600">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editId ? 'Edit Task' : 'Create Task'} onClose={() => setShowModal(false)}>
          <form onSubmit={saveTask} className="space-y-4">
            <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />

            <div>
              <label className="block text-sm font-medium mb-1">Project</label>
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value, assignedTo: '' })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assign To</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <Input label="Due Date" type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />

            <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold">
              Save Task
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400">
          <X size={18} />
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}