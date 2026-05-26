import React, { useState } from 'react';

type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<{ success: boolean; needsConfirmation: boolean }>;
  onForgotPassword: (email: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

const EyeIcon = ({ open }: { open: boolean }) => (
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
);

export const AuthPage: React.FC<AuthPageProps> = ({
  onSignIn, onSignUp, onForgotPassword, loading, error, onClearError
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setLocalMsg(null);
    onClearError();
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMsg(null);
    onClearError();

    if (mode === 'forgot') {
      if (!email) return;
      const ok = await onForgotPassword(email);
      if (ok) setLocalMsg('Password reset email sent. Check your inbox.');
      return;
    }

    if (!email || !password) return;

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setLocalMsg('Password must be at least 6 characters.');
        return;
      }
      const result = await onSignUp(email, password);
      if (result.success && result.needsConfirmation) {
        setLocalMsg('Account created! Check your email to confirm before logging in.');
        switchMode('login');
      }
      return;
    }

    await onSignIn(email, password);
  };

  return (
    <div
      className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at top, rgba(37, 99, 235, 0.15), transparent), radial-gradient(circle at bottom, rgba(8, 145, 178, 0.1), transparent)`
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="text-center mb-10 relative z-10">
        <h1
          className="font-orbitron text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-500 uppercase tracking-tighter"
          style={{ filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.5))' }}
        >
          REAL LIFE<br />LEVELING
        </h1>
        <div className="h-1 w-24 bg-blue-500 mx-auto mt-3 rounded-full shadow-[0_0_10px_#3b82f6]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-lg p-6 shadow-[0_0_40px_rgba(37,99,235,0.2)] backdrop-blur-sm">
          <div className="flex gap-2 mb-6">
            {(['login', 'signup'] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-[10px] font-orbitron font-black uppercase tracking-widest rounded transition-all ${
                  mode === m
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {mode === 'forgot' && (
            <p className="font-orbitron text-[9px] text-blue-400 uppercase tracking-widest text-center mb-4">
              Reset Password
            </p>
          )}

          {(error || localMsg) && (
            <div className={`mb-4 p-3 rounded border text-[10px] font-bold uppercase tracking-wide ${
              error
                ? 'bg-red-950/60 border-red-500/50 text-red-300'
                : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
            }`}>
              {error || localMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-orbitron font-black uppercase tracking-widest text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="hunter@example.com"
                className="w-full bg-slate-800/80 border border-slate-600/60 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/80 focus:shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-[9px] font-orbitron font-black uppercase tracking-widest text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 border border-slate-600/60 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/80 focus:shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-[9px] font-orbitron font-black uppercase tracking-widest text-gray-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-slate-600/60 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/80 focus:shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-orbitron text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 py-3 rounded shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : mode === 'login' ? 'Initialize Session' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {mode === 'login' && (
            <button
              onClick={() => switchMode('forgot')}
              className="w-full mt-3 text-[9px] font-orbitron text-gray-500 hover:text-blue-400 uppercase tracking-widest transition-colors text-center"
            >
              Forgot password?
            </button>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('login')}
              className="w-full mt-3 text-[9px] font-orbitron text-gray-500 hover:text-blue-400 uppercase tracking-widest transition-colors text-center"
            >
              Back to login
            </button>
          )}
        </div>

        <p className="text-center text-[8px] font-orbitron text-blue-500/30 uppercase tracking-widest mt-4">
          Your progress is saved to your account
        </p>
      </div>

      <footer className="absolute bottom-6 text-[10px] font-orbitron text-blue-500/40 tracking-widest uppercase">
        &copy; {new Date().getFullYear()} ARCHITECT SYSTEM // v2.1.0
      </footer>
    </div>
  );
};
