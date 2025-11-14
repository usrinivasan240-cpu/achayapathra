import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Coffee, Receipt, ShieldCheck, Timer, UtensilsCrossed } from 'lucide-react';

const featureHighlights = [
  {
    title: 'Frictionless Ordering',
    description:
      'Browse curated menus, apply campus offers, and checkout with live billing that includes GST, service charges, and coupons in a single view.',
    icon: UtensilsCrossed,
  },
  {
    title: 'Real-time Order Tracking',
    description:
      'Track orders from pending to delivered with instant status updates, token alerts, and ready notifications on web and mobile.',
    icon: Timer,
  },
  {
    title: 'Role-based Dashboards',
    description:
      'Dedicated workspaces for students, canteen admins, and super admins with revenue analytics, counter management, and audit logs.',
    icon: ShieldCheck,
  },
];

const valueProps = [
  'Online payment simulation with instant token generation',
  'Discount engine with campus-exclusive coupons',
  'Built-in review & rating workflows for every menu item',
  'Favorites, offer banners, and personalised recommendations',
  'Daily sales reports and counter-level performance insights',
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1600&q=80"
            alt="Canteen Service"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950" />
        </div>

        <div className="relative z-10 flex flex-col gap-12 px-6 py-24 pb-32 md:px-12 lg:px-32 lg:py-32">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-200 ring-1 ring-emerald-400/30">
              Campus-first smart canteen experience
            </span>
            <h1 className="font-headline text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Eat smarter with Achayapathra &mdash; the full-stack MERN canteen platform.
            </h1>
            <p className="text-lg text-slate-200 md:text-xl">
              Achayapathra connects hungry students, agile canteen teams, and strategic super admins with a single platform featuring JWT-secured authentication, live order updates, and Tailwind-powered responsive design.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                Launch App <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:border-emerald-400"
              >
                Create a student account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 -mt-16 px-6 pb-20 md:px-12 lg:px-32">
        <div className="grid gap-6 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
            >
              <feature.icon className="mb-4 h-10 w-10 text-emerald-300" />
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-200/90">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 grid gap-10 px-6 pb-24 md:grid-cols-2 md:px-12 lg:px-32">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-emerald-200">
            <Coffee className="h-4 w-4" />
            Built with the MERN stack
          </div>
          <h2 className="font-headline text-3xl text-white md:text-4xl">
            One control centre for every stakeholder on campus
          </h2>
          <p className="text-slate-200">
            Students enjoy curated menus, live billing, QR-powered tokens, and progress tracking. Canteen admins manage counters, inventory, and live orders, while super admins onboard new canteens, configure roles, and audit revenue across the platform.
          </p>
          <div className="space-y-3">
            {valueProps.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Student App</h3>
              <p className="mt-2 text-sm text-slate-200">
                Browse by categories like breakfast, lunch, snacks, and beverages with vibrant imagery, add favourites, and trigger simulated online payments that instantly confirm orders.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Admin Console</h3>
              <p className="mt-2 text-sm text-slate-200">
                Update menu availability, manage multiple counters, mark orders cooking/ready/delivered, and export daily sales or GST-ready summaries with a click.
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-purple-500/20" />
          <Image
            src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80"
            alt="Campus Canteen"
            width={900}
            height={680}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6">
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Receipt className="h-4 w-4" />
              Token TN102 is ready for pickup from Counter 2. Students receive a push alert instantly.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 px-6 py-10 text-sm text-slate-300 md:px-12 lg:px-32">
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between">
          <p className="font-headline text-lg text-white">Achayapathra</p>
          <p className="text-xs text-slate-400">
            Built on Next.js, Express, MongoDB, and TailwindCSS &mdash; deployable to Vercel, Render, or Railway with ready-to-use configuration templates.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login" className="text-xs font-semibold uppercase tracking-wider text-emerald-200 hover:text-white">
              Sign In
            </Link>
            <Link href="/signup" className="text-xs font-semibold uppercase tracking-wider text-emerald-200 hover:text-white">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
