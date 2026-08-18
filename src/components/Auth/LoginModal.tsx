import { X, Mail, AlertCircle, Lock, EyeOff, Eye, AlertTriangle, LogIn, UserPlus, Phone, ArrowLeft, User, Bus, Shield, ChevronRight, BadgeCheck, Ticket, KeyRound } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import SegmentedControl from '../ui/SegmentedControl';
import { getRole, HOME_ROUTE } from '../../config/navConfig';

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

type AuthTab = 'role' | 'signin' | 'register' | 'reset' | 'driver' | 'admin';

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
  const [staffRole, setStaffRole] = useState<'driver' | 'conductor'>('driver');
  const [badgeId, setBadgeId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [portalError, setPortalError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const staffLogin = useAuthStore((s) => s.staffLogin);
  const adminLogin = useAuthStore((s) => s.adminLogin);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const navigate = useNavigate();

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
      setBadgeId('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminKey('');
      setPortalError('');
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
      navigate(HOME_ROUTE[getRole(result.user ?? null)]);
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
      showNotification('Account Created', `Welcome to Abia Way, ${result.user?.name}! You're signed in.`, 'success');
      onClose();
      navigate(HOME_ROUTE[getRole(result.user ?? null)]);
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

  const onStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    if (!badgeId.trim()) {
      setPortalError('Please enter your operational badge number.');
      return;
    }
    setPortalLoading(true);
    const result = await staffLogin(badgeId.trim().toUpperCase(), staffRole);
    setPortalLoading(false);
    if (!result.success) {
      setPortalError(result.error || 'Authentication failed.');
      return;
    }
    showNotification('Welcome!', `Signed in as ${staffRole === 'driver' ? 'Fleet Pilot' : 'Terminal Conductor'}`, 'success');
    onClose();
    navigate(HOME_ROUTE[getRole(result.user ?? null)]);
  };

  const onAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    if (!adminEmail.trim() || !adminPassword || !adminKey.trim()) {
      setPortalError('Please enter your email, password, and admin access key.');
      return;
    }
    setPortalLoading(true);
    const result = await adminLogin(adminEmail.trim().toLowerCase(), adminPassword, adminKey.trim().toUpperCase());
    setPortalLoading(false);
    if (!result.success) {
      setPortalError(result.error || 'Authentication failed.');
      return;
    }
    showNotification('Welcome back!', 'Signed in as Administrator', 'success');
    onClose();
    navigate(HOME_ROUTE[getRole(result.user ?? null)]);
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

  const roleCards = [
    {
      key: 'signin' as AuthTab,
      title: 'Passenger',
      subtitle: 'Sign in or create a passenger account',
      icon: User,
      iconClass: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      key: 'driver' as AuthTab,
      title: 'Driver',
      subtitle: 'Sign in with your issued badge',
      icon: Bus,
      iconClass: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      key: 'admin' as AuthTab,
      title: 'Admin',
      subtitle: 'Sign in with issued credentials',
      icon: Shield,
      iconClass: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  const tabMeta: Record<AuthTab, { title: string; subtitle: string }> = {
    role: { title: 'Welcome to Abia Way', subtitle: 'Select your role to continue' },
    signin: { title: 'Welcome Back', subtitle: 'Sign in to continue to Abia Way' },
    register: { title: 'Create Account', subtitle: 'Join Abia Way in under a minute' },
    reset: { title: 'Reset Password', subtitle: 'We will send you a reset link' },
    driver: { title: 'Driver Sign In', subtitle: 'Enter your operational badge number' },
    admin: { title: 'Admin Sign In', subtitle: 'Enter your administrator credentials' },
  };

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 animate-slideUp">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{tabMeta[tab].title}</h3>
              <p className="text-sm text-gray-400 mt-1">{tabMeta[tab].subtitle}</p>
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

          {tab === 'role' ? (
            <div className="space-y-3">
              {roleCards.map(({ key, title, subtitle, icon: Icon, iconClass, iconColor }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setPortalError(''); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 transition text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl ${iconClass} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 transition shrink-0" />
                </button>
              ))}
              <button
                onClick={() => navigate('/login')}
                className="w-full text-sm text-gray-400 hover:text-green-400 transition flex items-center justify-center gap-1 pt-1"
              >
                <Shield className="w-4 h-4" />
                Visit the Staff &amp; Admin Portal
              </button>
            </div>
          ) : tab === 'driver' ? (
            <form onSubmit={onStaffSubmit} className="space-y-4">
              {portalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {portalError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role Type</label>
                <SegmentedControl
                  size="md"
                  fill
                  ariaLabel="Staff role"
                  value={staffRole}
                  onChange={(v) => setStaffRole(v as 'driver' | 'conductor')}
                  options={[
                    { label: <span className="flex items-center justify-center gap-1.5"><Bus className="w-4 h-4" /> Driver</span>, value: 'driver' },
                    { label: <span className="flex items-center justify-center gap-1.5"><Ticket className="w-4 h-4" /> Conductor</span>, value: 'conductor' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Operational Badge Number</label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                    placeholder="e.g. PLT-8837"
                    className={inputClass(false)}
                    disabled={portalLoading}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-400" />
                Badges are vetted and issued by Abia Way administration. Staff cannot self-register.
              </p>
              <button
                type="submit"
                disabled={portalLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {portalLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying badge...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-5 h-5" />
                    Sign In with Badge
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab('role')}
                className="w-full text-sm text-gray-400 hover:text-green-400 transition flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </button>
            </form>
          ) : tab === 'admin' ? (
            <form onSubmit={onAdminSubmit} className="space-y-4">
              {portalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {portalError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@abiaway.gov.ng"
                    className={inputClass(false)}
                    disabled={portalLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={inputClass(false)}
                    disabled={portalLoading}
                  />
                  <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Access Key</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value.toUpperCase())}
                    placeholder="e.g. ABW-AK-XXXX-XXXX"
                    className={inputClass(false)}
                    disabled={portalLoading}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-400" />
                Access keys are vetted and issued by Abia Way administration. Admins cannot self-register.
              </p>
              <button
                type="submit"
                disabled={portalLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {portalLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying credentials...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Sign In as Admin
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab('role')}
                className="w-full text-sm text-gray-400 hover:text-green-400 transition flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </button>
            </form>
          ) : tab === 'reset' ? (
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
