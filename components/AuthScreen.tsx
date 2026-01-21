
import React, { useState } from 'react';
import { User } from '../types';
import { LogoIcon, LoadingSpinner } from './icons';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const simulateGoogleLogin = () => {
    setIsLoggingIn(true);
    // Simulate API delay
    setTimeout(() => {
      const mockUser: User = {
        id: 'google-123',
        name: 'Interview Candidate',
        email: 'candidate@gmail.com',
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      };
      onLogin(mockUser);
    }, 1500);
  };

  return (
    <div className="h-full w-full bg-brand-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-fade-in-scale">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center">
              <LogoIcon className="w-12 h-12 text-brand-text-dark" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-brand-text-dark tracking-tight">Coach.AI</h1>
          <p className="text-brand-text-light text-lg">Your personal career architect.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-white space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-brand-text-dark">Welcome Back</h2>
            <p className="text-brand-text-light text-sm">Please sign in with your Google account to continue practicing.</p>
          </div>

          <button
            onClick={simulateGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-gray-200 p-4 rounded-2xl transition-all duration-300 active:scale-95 group relative overflow-hidden"
          >
            {isLoggingIn ? (
              <LoadingSpinner className="w-6 h-6 text-brand-accent-green" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="font-bold text-brand-text-dark">Sign in with Google</span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Enterprise Grade AI Coaching
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <a href="#" className="text-xs text-brand-text-light hover:text-brand-text-dark transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-brand-text-light hover:text-brand-text-dark transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
