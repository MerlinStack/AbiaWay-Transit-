import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
        showNotification('Account Unlocked', 'You can now try logging in again', 'info');
      }, 300000);
      return () => clearTimeout(timer);
    }
  }, [loginAttempts, showNotification]);

  if (!isOpen) return null;

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      showNotification('Account Locked', 'Too many failed attempts. Please try again later.', 'error');
      return;
    }

    const result = await login(data.email, data.password);
    if (result.success) {
      showNotification('Welcome back!', `Successfully logged in`, 'success');
      setLoginAttempts(0);

      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      onClose();
    } else {
      setLoginAttempts((prev) => prev + 1);
      const remaining = 4 - loginAttempts;
      showNotification('Login Failed', `Invalid credentials. ${remaining} attempts remaining before account lock.`, 'error');
      setError('password', { message: '' });
      setError('root', { message: 'Invalid email or password' });
    }
  };

  const handleForgotPassword = () => {
    if (!watch('email')) {
      showNotification('Email Required', 'Please enter your email address first', 'warning');
      return;
    }
    showNotification('Password Reset', `Reset link sent to ${watch('email')}. Check your inbox.`, 'info');
  };

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 animate-slideUp">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Welcome Back</h3>
              <p className="text-sm text-gray-400 mt-1">Sign in to continue to Abia Way</p>
            </div>
            <div className="flex gap-2">
              {isLocked && (
                <div className="px-2 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs">Locked</div>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <i data-lucide="x" className="w-4 h-4 text-gray-400"></i>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <i data-lucide="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"></i>
                <input
                  type="email"
                  {...register('email')}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setTimeout(() => setActiveField(null), 200)}
                  placeholder="Enter your email"
                  className={`w-full bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition`}
                  disabled={isLocked}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i data-lucide="alert-circle" className="w-3 h-3"></i>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <i data-lucide="lock" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  className={`w-full bg-white/10 border ${errors.password ? 'border-red-500' : 'border-white/20'} rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition`}
                  disabled={isLocked}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <i data-lucide={showPassword ? 'eye-off' : 'eye'} className="w-5 h-5"></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i data-lucide="alert-circle" className="w-3 h-3"></i>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('rememberMe')} className="w-4 h-4 rounded border-white/20 bg-white/10 checked:bg-green-600 focus:ring-green-500" disabled={isLocked} />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <button type="button" onClick={handleForgotPassword} className="text-sm text-green-400 hover:text-green-300 transition" disabled={isLocked}>
                Forgot Password?
              </button>
            </div>

            {loginAttempts > 0 && loginAttempts < 5 && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <i data-lucide="alert-triangle" className="w-4 h-4"></i>
                  {5 - loginAttempts} login attempt(s) remaining before account lock
                </p>
              </div>
            )}

            {errors.root && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <i data-lucide="alert-triangle" className="w-4 h-4"></i>
                  {errors.root.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying credentials...
                </>
              ) : (
                <>
                  <i data-lucide="log-in" className="w-5 h-5"></i>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
