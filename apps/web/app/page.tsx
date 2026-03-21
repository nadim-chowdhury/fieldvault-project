import Link from 'next/link';
import { HardHat, QrCode, Wrench, FileText, Wifi, Shield, Users, ArrowRight, Check, Zap, Globe, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'QR Code Asset Tracking',
    description: 'Generate unique QR codes for every piece of equipment. Workers scan to check-out, check-in, or report issues instantly.',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  {
    icon: Wrench,
    title: 'Maintenance Scheduler',
    description: 'Automated maintenance calendar with push notifications. Never miss an oil change, safety inspection, or calibration again.',
    color: '#059669',
    bg: '#d1fae5',
  },
  {
    icon: FileText,
    title: 'Audit-Ready PDF Reports',
    description: 'Generate branded compliance reports showing complete asset history. Pass government inspections and insurance audits effortlessly.',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    icon: Wifi,
    title: 'Offline-First Mobile App',
    description: 'Works without internet on remote sites. All actions queue locally and auto-sync when connectivity returns.',
    color: '#ea580c',
    bg: '#ffedd5',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant SaaS',
    description: 'Built-in company isolation with role-based access. Host once, serve unlimited organizations with Admin/Supervisor/Worker roles.',
    color: '#0891b2',
    bg: '#cffafe',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Invite team members, assign roles, and track who has what equipment checked out across all your job sites.',
    color: '#be185d',
    bg: '#fce7f3',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    period: '14-day trial',
    description: 'Try FieldVault risk-free',
    features: ['Up to 50 assets', '3 team members', 'QR code scanning', 'Basic reports', 'Email support'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing construction firms',
    features: ['Up to 500 assets', '25 team members', 'Offline mobile app', 'PDF audit reports', 'Maintenance scheduler', 'Priority support'],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$149',
    period: '/month',
    description: 'For large organizations',
    features: ['Unlimited assets', 'Unlimited team members', 'API access & webhooks', 'Custom branding', 'Dedicated account manager', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const stats = [
  { value: '10K+', label: 'Assets Tracked' },
  { value: '500+', label: 'Companies' },
  { value: '99.8%', label: 'Audit Pass Rate' },
  { value: '24/7', label: 'Uptime' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FieldVault</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link
              href="/login"
              className="px-5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-20 px-6" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Built for Construction & Engineering Firms
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Stop Losing Equipment.<br />
            <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start Passing Audits.
            </span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
            FieldVault is the offline-first asset management platform that helps construction firms
            track every tool, schedule maintenance, and generate audit-ready compliance reports.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl text-white font-bold text-base flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl text-slate-700 font-semibold text-base border border-slate-200 hover:bg-slate-50 transition-all"
            >
              See Features
            </a>
          </div>
          <p className="text-sm text-slate-400 mt-4">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Everything You Need to Manage Equipment
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From QR code scanning to audit-ready reports, FieldVault covers every aspect of field equipment management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: feature.bg }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-500">Get up and running in minutes, not months.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register Your Company', desc: 'Create an account, add your team members, and configure your asset categories in under 5 minutes.' },
              { step: '02', title: 'Scan & Track Assets', desc: 'Generate QR codes, print labels, and start scanning. Every checkout, checkin, and inspection is logged automatically.' },
              { step: '03', title: 'Pass Every Audit', desc: 'Generate branded PDF reports with full asset history, maintenance records, and compliance data — ready for inspectors.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-extrabold text-white"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-500">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 transition-all hover:shadow-lg ${
                  plan.highlighted
                    ? 'bg-slate-900 text-white border-2 border-blue-500 shadow-xl scale-[1.02]'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Most Popular</div>
                )}
                <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
                <div className="mt-5 mb-6">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-blue-400' : 'text-emerald-500'}`} />
                      <span className={plan.highlighted ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block w-full py-2.5 rounded-lg text-center text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6">
        <div
          className="max-w-4xl mx-auto rounded-3xl py-16 px-8 text-center"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        >
          <HardHat className="w-12 h-12 text-blue-400 mx-auto mb-5" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Take Control of Your Equipment?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Join hundreds of construction firms who trust FieldVault to track their most valuable assets.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">FieldVault</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
          </div>
          <p className="text-sm text-slate-400">© 2024 FieldVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
