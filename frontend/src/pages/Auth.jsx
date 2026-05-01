import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import * as z from 'zod';
import { CheckCircle2, Users, Clock3, ShieldCheck } from 'lucide-react';
import API from '../api/axios';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const schema = isLogin ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const submitHandler = async (data) => {
    setLoading(true);
    setServerError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: data.email, password: data.password }
        : data;

      const res = await API.post(endpoint, payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setLoading(true);
    setServerError('');

    try {
      const res = await API.post('/auth/google', {
        token: credentialResponse.credential,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setServerError('');
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-32px)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl md:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_35%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-200">
              <ShieldCheck size={16} />
              Secure Team Workflow
            </div>

            <h1 className="mt-8 max-w-md text-5xl font-black leading-tight">
              Manage projects without the chaos.
            </h1>

            <p className="mt-5 max-w-lg text-slate-300">
              Assign tasks, track deadlines, and keep your team aligned in one clean workspace.
            </p>
          </div>

          <div className="relative z-10 grid gap-4">
            <Feature icon={Users} title="Role-based access" text="Admins manage everything. Members see only what is assigned." />
            <Feature icon={CheckCircle2} title="Task progress" text="Move work through To Do, In Progress, Review, and Done." />
            <Feature icon={Clock3} title="Deadline tracking" text="Spot overdue work quickly with a simple dashboard." />
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-50 p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-2 text-slate-500">
                {isLogin ? 'Sign in to continue to your workspace.' : 'Start organizing your team with a better flow.'}
              </p>
            </div>

            {serverError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
              {!isLogin && (
                <Field
                  label="Full name"
                  error={errors.name?.message}
                  inputProps={register('name')}
                  placeholder="Pratyush Kumar"
                />
              )}

              <Field
                label="Email"
                error={errors.email?.message}
                inputProps={register('email')}
                placeholder="you@example.com"
                type="email"
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {errors.password?.message && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-70"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Sign up'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setServerError('Google sign-in failed')}
                theme="filled_blue"
                shape="pill"
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={toggleMode} className="font-semibold text-blue-600 hover:underline">
                  {isLogin ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-300">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, inputProps, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        {...inputProps}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}