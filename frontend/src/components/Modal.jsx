import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className={`relative w-full ${maxWidth} rounded-3xl bg-white shadow-2xl border border-slate-200`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        </div>

        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}