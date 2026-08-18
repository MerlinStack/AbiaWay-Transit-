import { X, Mail, AlertCircle, Lock, EyeOff, Eye, AlertTriangle, LogIn, UserPlus, Phone, ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import SegmentedControl from '../ui/SegmentedControl';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name is required').max(80, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number (e.g. 08012345678)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((v) => v, 'You must accept the Terms of Service'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const resetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

type AuthTab = 'signin' | 'register' | 'reset';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
}

function LoginModal({ isOpen, onClose, initialTab = 'signin' }: LoginModalProps) {
  const [tab, setTab] = useState<AuthTab>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      loginForm.setValue('email', savedEmail);
      loginForm.setValue('rememberMe', true);
    }
  }, [loginForm]);

  useEffect(() => {
    if (!isOpen) {
      setTab('signin');
      loginForm.clearErrors();
      registerForm.clearErrors();
      resetForm.clearErrors();
    } else {
      setTab(initialTab);
    }
  }, [isOpen, initialTab, loginForm, registerForm, resetForm]);

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

  const onLoginSubmit = async (data: LoginFormData) => {
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
      loginForm.setError('password', { message: '' });
      loginForm.setError('root', { message: 'Invalid email or password' });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    const result = await register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    if (result.success) {
      showNotification('Account Created', `Welcome to Abia Way, ${result.user?.name}!`, 'success');
      onClose();
    } else {
      const friendly =
        result.error?.includes('email-already-in-use') || result.error?.includes('EMAIL_EXISTS')
          ? 'An account with this email already exists. Try signing in instead.'
          : result.error || 'Registration failed. Please try again.';
      showNotification('Registration Failed', friendly, 'error');
      registerForm.setError('root', { message: friendly });
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    const result = await resetPassword(data.email);
    if (result.success) {
      showNotification('Password Reset', `Reset link sent to ${data.email}. Check your inbox.`, 'success');
      setTab('signin');
    } else {
      showNotification('Password Reset Failed', result.error || 'Could not send reset link.', 'error');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-white/10 border ${hasError ? 'border-red-500' : 'border-white/20'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition`;

  const renderFieldError = (message?: string) =>
    message ? (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {message}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 animate-slideUp">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {tab === 'signin' ? 'Welcome Back' : tab === 'register' ? 'Create Account' : 'Reset Password'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {tab === 'signin' ? 'Sign in to continue to Abia Way' : tab === 'register' ? 'Join Abia Way in under a minute' : 'We will send you a reset link'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {isLocked && (
                <div className="px-2 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs">Locked</div>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {tab === 'reset' ? (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    {...resetForm.register('email')}
                    placeholder="Enter your email"
                    className={inputClass(!!resetForm.formState.errors.email)}
                  />
                </div>
                {renderFieldError(resetForm.formState.errors.email?.message)}
              </div>

              <button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetForm.formState.isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => setTab('signin')}
                className="w-full mt-3 text-sm text-gray-400 hover:text-green-400 transition flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          ) : (
            <>
              <SegmentedControl
              size="md"
              fill
              ariaLabel="Sign in or register"
              value={tab}
              onChange={(v) => { setTab(v as 'signin' | 'register'); if (v === 'signin') loginForm.clearErrors(); else registerForm.clearErrors(); }}
              options={[
                {
                  label: <span className="flex items-center justify-center gap-1.5"><LogIn className="w-4 h-4" /> Sign In</span>,
                  value: 'signin',
                },
                {
                  label: <span className="flex items-center justify-center gap-1.5"><UserPlus className="w-4 h-4" /> Create Account</span>,
                  value: 'register',
                },
              ]}
              className="mb-5"
            />

              {tab === 'signin' ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        {...loginForm.register('email')}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setTimeout(() => setActiveField(null), 200)}
                        placeholder="Enter your email"
                        className={inputClass(!!loginForm.formState.errors.email)}
                        disabled={isLocked}
                      />
                    </div>
                    {renderFieldError(loginForm.formState.errors.email?.message)}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...loginForm.register('password')}
                        placeholder="Enter your password"
                        className={inputClass(!!loginForm.formState.errors.password)}
                        disabled={isLocked}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {renderFieldError(loginForm.formState.errors.password?.message)}
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...loginForm.register('rememberMe')} className="w-4 h-4 rounded border-white/20 bg-white/10 checked:bg-green-600 focus:ring-green-500" disabled={isLocked} />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <button type="button" onClick={() => { setTab('reset'); resetForm.setValue('email', loginForm.getValues('email') || localStorage.getItem('rememberedEmail') || ''); }} className="text-sm text-green-400 hover:text-green-300 transition" disabled={isLocked}>
                      Forgot Password?
                    </button>
                  </div>

                  {loginAttempts > 0 && loginAttempts < 5 && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {5 - loginAttempts} login attempt(s) remaining before account lock
                      </p>
                    </div>
                  )}

                  {loginForm.formState.errors.root && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {loginForm.formState.errors.root.message}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting || isLocked}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loginForm.formState.isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying credentials...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      {...registerForm.register('name')}
                      placeholder="e.g. Abuoma David"
                      className={inputClass(!!registerForm.formState.errors.name)}
                    />
                    {renderFieldError(registerForm.formState.errors.name?.message)}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        {...registerForm.register('email')}
                        placeholder="you@example.com"
                        className={inputClass(!!registerForm.formState.errors.email)}
                      />
                    </div>
                    {renderFieldError(registerForm.formState.errors.email?.message)}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        {...registerForm.register('phone')}
                        placeholder="e.g. 08012345678"
                        className={inputClass(!!registerForm.formState.errors.phone)}
                      />
                    </div>
                    {renderFieldError(registerForm.formState.errors.phone?.message)}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...registerForm.register('password')}
                        placeholder="At least 8 characters"
                        className={inputClass(!!registerForm.formState.errors.password)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {renderFieldError(registerForm.formState.errors.password?.message)}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerForm.register('confirmPassword')}
                        placeholder="Re-enter your password"
                        className={inputClass(!!registerForm.formState.errors.confirmPassword)}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {renderFieldError(registerForm.formState.errors.confirmPassword?.message)}
                  </div>

                  <div className="mb-6">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" {...registerForm.register('acceptTerms')} className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 checked:bg-green-600 focus:ring-green-500" />
                      <span className="text-sm text-gray-400">
                        I agree to the <span className="text-green-400">Terms of Service</span> and <span className="text-green-400">Privacy Policy</span>
                      </span>
                    </label>
                    {renderFieldError(registerForm.formState.errors.acceptTerms?.message)}
                  </div>

                  {registerForm.formState.errors.root && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {registerForm.formState.errors.root.message}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {registerForm.formState.isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
