import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      setMessage(res.data.message || 'Password updated successfully');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Set new password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter a new password to continue.
        </p>

        <form onSubmit={submitHandler} className="mt-6 space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        {message && <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="font-semibold text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}