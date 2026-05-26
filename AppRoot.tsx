import React from 'react';
import { useAuth } from './hooks/useAuth';
import App from './App';

const LoadingScreen: React.FC = () => (
  <div
    className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center"
    style={{ backgroundImage: `radial-gradient(circle at top, rgba(37, 99, 235, 0.15), transparent)` }}
  >
    <h1
      className="font-orbitron text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-500 uppercase tracking-tighter mb-6"
      style={{ filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.5))' }}
    >
      R.L.L
    </h1>
    <div className="flex gap-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
    <p className="font-orbitron text-[9px] text-blue-500/50 uppercase tracking-widest mt-4 animate-pulse">
      Initializing System...
    </p>
  </div>
);

const AppRoot: React.FC = () => {
  const { user, loading, signIn, signUp, signOut, resetPassword, error, clearError } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <App
      userEmail={user?.email}
      onSignIn={signIn}
      onSignUp={signUp}
      onSignOut={signOut}
      onResetPassword={resetPassword}
      authError={error}
      onClearAuthError={clearError}
      authLoading={loading}
    />
  );
};

export default AppRoot;
