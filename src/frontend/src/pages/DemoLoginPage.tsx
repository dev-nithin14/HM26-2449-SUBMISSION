import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Check,
  Cog,
  Eye,
  EyeOff,
  HardHat,
  Home,
  Info,
  LockKeyhole,
  LogIn,
  Mail,
  Phone,
  Recycle,
  Shield,
  Truck,
  User,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SeedAccount {
  role: UserRole;
  label: string;
  email: string;
  password: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

const SEED_ACCOUNTS: SeedAccount[] = [
  {
    role: 'CITIZEN',
    label: 'Citizen',
    email: 'citizen@rebuildmysore.org',
    password: 'ReBuild@Mysuru2026!',
    description: 'Report localized debris, request pickup, and track resolution.',
    path: '/citizen',
    icon: <Home className="h-5 w-5" />
  },
  {
    role: 'BUILDER',
    label: 'Builder',
    email: 'builder@rebuildmysore.org',
    password: 'ReBuild@Mysuru2026!',
    description: 'Commercial construction debris scheduling and compliance.',
    path: '/citizen',
    icon: <HardHat className="h-5 w-5" />
  },
  {
    role: 'COLLECTION_TEAM',
    label: 'Collection Crew',
    email: 'collection@rebuildmysore.org',
    password: 'ReBuild@Mysuru2026!',
    description: 'Vehicle routing, site pickups, weight logs, and proof upload.',
    path: '/collection',
    icon: <Truck className="h-5 w-5" />
  },
  {
    role: 'PROCESSING_TEAM',
    label: 'Processing Plant',
    email: 'processing@rebuildmysore.org',
    password: 'ReBuild@Mysuru2026!',
    description: 'Batch sorting, crushing recovery, and recycled materials ledger.',
    path: '/processing',
    icon: <Cog className="h-5 w-5" />
  },
  {
    role: 'ADMIN',
    label: 'MCC Admin',
    email: 'admin@rebuildmysore.gov.in',
    password: 'Admin@Mysuru2026!',
    description: 'City-wide monitoring, verification, fleet dispatch, and analytics.',
    path: '/admin',
    icon: <Shield className="h-5 w-5" />
  }
];

const roleRedirects: Record<UserRole, string> = {
  CITIZEN: '/citizen',
  BUILDER: '/citizen',
  COLLECTION_TEAM: '/collection',
  PROCESSING_TEAM: '/processing',
  ADMIN: '/admin'
};

export const DemoLoginPage: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading, login, signUp } = useAuth();
  const navigate = useNavigate();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('citizen@rebuildmysore.org');
  const [loginPassword, setLoginPassword] = useState('ReBuild@Mysuru2026!');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [selectedQuickRole, setSelectedQuickRole] = useState<UserRole>('CITIZEN');

  // Register form state (only CITIZEN or BUILDER allowed)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'CITIZEN' | 'BUILDER'>('CITIZEN');
  const [regPhone, setRegPhone] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to appropriate role home
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const targetPath = roleRedirects[currentUser.role] || '/citizen';
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      // Auth state listener handles navigation
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setLoginError('Invalid email or password. Please verify credentials.');
      } else if (err.message?.includes('Email not confirmed')) {
        setLoginError('Your email address has not been confirmed yet. Please check your inbox for the verification link.');
      } else {
        setLoginError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMessage('');

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }

    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    if (regRole === 'BUILDER' && !regOrganization.trim()) {
      setRegError('Please enter your construction company or firm name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone || undefined,
        organization: regOrganization || undefined
      });

      if (result.emailConfirmationRequired) {
        setRegSuccessMessage(
          `Registration submitted! A verification link has been sent to ${regEmail}. Please confirm your email to sign in.`
        );
      } else {
        setRegSuccessMessage('Account created and verified successfully! Redirecting...');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectQuickAccount = (acc: SeedAccount) => {
    setSelectedQuickRole(acc.role);
    setLoginEmail(acc.email);
    setLoginPassword(acc.password);
    setLoginError('');
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-forest-50 via-sand-50 to-white px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-xl shadow-charcoal-900/10 lg:grid-cols-[0.88fr_1.12fr]">
        {/* Left column: Brand & civic context */}
        <div className="flex flex-col justify-between bg-charcoal-950 p-7 text-white sm:p-10 lg:p-12">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-700">
                <Recycle className="h-6 w-6 text-forest-200" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">
                  ReBuild <span className="text-terracotta-400">Mysore</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-sand-400">Civic circularity platform</p>
              </div>
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-forest-300">Mysuru civic operations</p>
            <h1 className="max-w-md font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              One coordinated path from debris to community value.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-sand-300">
              Connecting residents, builders, collection crews, and recycling supervisors in one persistent, traceable
              construction-waste workflow powered by Supabase PostgreSQL.
            </p>

            <div className="mt-8 space-y-3 rounded-2xl border border-charcoal-800 bg-charcoal-900/70 p-4 text-xs text-sand-300">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Shield className="h-4 w-4 text-forest-400" />
                <span>Supabase Security Architecture</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-sand-400 text-[11px]">
                <li>Row-Level Security (RLS) policies enforced on all tables.</li>
                <li>Public registration restricted to Citizens and Builders.</li>
                <li>Collection & Processing crews invited by Municipal Admin.</li>
                <li>Cryptographic JWT Bearer token authentication.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 border-t border-charcoal-800 pt-5 text-xs text-sand-400">
            <Building2 className="h-4 w-4 text-terracotta-400 shrink-0" />
            <span>Mysuru City Corporation (MCC) C&D Waste Management Desk</span>
          </div>
        </div>

        {/* Right column: Auth Tabs (Login / Register) */}
        <div className="p-6 sm:p-10 lg:p-12">
          {/* Mode Switcher Tabs */}
          <div className="mb-6 flex rounded-xl border border-sand-200 bg-sand-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                authMode === 'login'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegError('');
                setRegSuccessMessage('');
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                authMode === 'register'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Register (Citizen / Builder)
            </button>
          </div>

          {authMode === 'login' ? (
            /* =================== LOGIN TAB =================== */
            <div>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-700">Supabase Authentication</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-charcoal-900">Sign in to ReBuild Mysore</h2>
                <p className="mt-1 text-xs text-charcoal-600">
                  Enter your credentials, or click a verified role card below to autofill.
                </p>
              </div>

              {/* Seeded Quick-Fill Account Selector */}
              <div className="mb-5 space-y-1.5">
                <p className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">Quick Fill Evaluation Accounts</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SEED_ACCOUNTS.map((acc) => {
                    const isSelected = selectedQuickRole === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => selectQuickAccount(acc)}
                        className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition focus:outline-none ${
                          isSelected
                            ? 'border-forest-600 bg-forest-50/80 ring-1 ring-forest-600'
                            : 'border-sand-200 bg-white hover:border-forest-300 hover:bg-sand-50'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            isSelected ? 'bg-forest-700 text-white' : 'bg-sand-100 text-forest-700'
                          }`}
                        >
                          {acc.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between text-xs font-bold text-charcoal-900">
                            {acc.label}
                            {isSelected && <Check className="h-3.5 w-3.5 text-forest-700 shrink-0" />}
                          </span>
                          <span className="block text-[10px] text-charcoal-500 truncate">{acc.email}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-charcoal-800">Email address</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
                    <input
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-3 text-sm text-charcoal-900 outline-none transition placeholder:text-charcoal-400 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-charcoal-800">Password</span>
                  <span className="relative block">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
                    <input
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-10 text-sm text-charcoal-900 outline-none transition placeholder:text-charcoal-400 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-2 top-1.5 rounded-md p-1 text-charcoal-500 hover:bg-sand-100"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                {loginError && (
                  <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? 'Authenticating with Supabase...' : 'Sign In'}
                  {!isSubmitting && <LogIn className="h-4 w-4" />}
                </button>
              </form>
            </div>
          ) : (
            /* =================== REGISTRATION TAB =================== */
            <div>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-700">Public Registration</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-charcoal-900">Create Citizen or Builder Account</h2>
                <p className="mt-1 text-xs text-charcoal-600">
                  Register to report construction debris and track circular recovery across Mysuru.
                </p>
              </div>

              {/* Security Policy Badge */}
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sand-300 bg-sand-50 p-3 text-xs text-charcoal-700">
                <Info className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  <strong>Role Policy:</strong> Only <strong>Citizens</strong> and <strong>Builders</strong> can register publicly.
                  Collection and Processing staff are invited by MCC Admins. Administrative accounts cannot be self-registered.
                </span>
              </div>

              {regSuccessMessage ? (
                <div className="rounded-xl border border-forest-300 bg-forest-50 p-5 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-forest-600 text-white">
                    <Check className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-forest-900 text-sm">Verify Your Email Address</h3>
                  <p className="mt-1.5 text-xs text-forest-800 leading-relaxed">{regSuccessMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setRegSuccessMessage('');
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800 transition"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Proceed to Sign In</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3">
                  {/* Role Selection */}
                  <div>
                    <span className="mb-1 block text-xs font-semibold text-charcoal-800">Select Account Type</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('CITIZEN')}
                        className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition ${
                          regRole === 'CITIZEN'
                            ? 'border-forest-600 bg-forest-50 text-forest-900 ring-1 ring-forest-600'
                            : 'border-sand-200 bg-white text-charcoal-700 hover:bg-sand-50'
                        }`}
                      >
                        <Home className="h-4 w-4 text-forest-700 shrink-0" />
                        <span>Citizen / Resident</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('BUILDER')}
                        className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition ${
                          regRole === 'BUILDER'
                            ? 'border-forest-600 bg-forest-50 text-forest-900 ring-1 ring-forest-600'
                            : 'border-sand-200 bg-white text-charcoal-700 hover:bg-sand-50'
                        }`}
                      >
                        <HardHat className="h-4 w-4 text-terracotta-600 shrink-0" />
                        <span>Commercial Builder</span>
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-charcoal-800">Full Name / Contact Person</span>
                    <span className="relative block">
                      <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
                      <input
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-3 text-sm text-charcoal-900 outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                      />
                    </span>
                  </label>

                  {/* Organization (for Builder) */}
                  {regRole === 'BUILDER' && (
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-charcoal-800">Firm / Company Name</span>
                      <span className="relative block">
                        <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
                        <input
                          value={regOrganization}
                          onChange={(e) => setRegOrganization(e.target.value)}
                          type="text"
                          required
                          placeholder="e.g. Cauvery Infra & Developers"
                          className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-3 text-sm text-charcoal-900 outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                        />
                      </span>
                    </label>
                  )}

                  {/* Email */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-charcoal-800">Email Address</span>
                    <span className="relative block">
                      <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
                      <input
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-3 text-sm text-charcoal-900 outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                      />
                    </span>
                  </label>

                  {/* Phone */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-charcoal-800">Contact Phone (Optional)</span>
                    <span className="relative block">
                      <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
                      <input
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        type="tel"
                        placeholder="+91 98450 12345"
                        className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-3 text-sm text-charcoal-900 outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                      />
                    </span>
                  </label>

                  {/* Password */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-charcoal-800">Create Password (min. 6 characters)</span>
                    <span className="relative block">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
                      <input
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Choose a secure password"
                        className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-10 text-sm text-charcoal-900 outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((v) => !v)}
                        className="absolute right-2 top-1.5 rounded-md p-1 text-charcoal-500 hover:bg-sand-100"
                        aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </span>
                  </label>

                  {regError && (
                    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSubmitting ? 'Registering with Supabase...' : `Register as ${regRole === 'BUILDER' ? 'Builder' : 'Citizen'}`}
                    {!isSubmitting && <UserPlus className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default DemoLoginPage;
