import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChefHat, Clock3, MonitorDot, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categories = [
  {
    name: 'Breakfast',
    description: 'Fuel your mornings with South Indian classics, quick sandwiches and healthy bowls.',
    image: 'https://images.unsplash.com/photo-1604908177079-1b6cdb7de371?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Lunch',
    description: 'Balanced thalis, chef specials and wholesome combos for the busy campus day.',
    image: 'https://images.unsplash.com/photo-1604908177522-4023ac76f720?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Snacks',
    description: 'Crispy bites, savoury chaats and grab-and-go favourites between lectures.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Beverages',
    description: 'Cold brews, artisan teas and refreshing coolers all day long.',
    image: 'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=600&q=80',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      <header className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-20 pt-24 text-center md:pt-32">
        <Badge className="mx-auto w-fit bg-primary/90 text-primary-foreground">Introducing V2.0</Badge>
        <h1 className="font-headline text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
          Smart Campus Canteen Ordering for Hungry Students & Busy Admins
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
          Skip the queues, track your token in real-time and experience a delightful dining journey.
          Canteen teams get instant orders, actionable insights and effortless counter management.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/signup">
              Create Student Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Secure JWT auth
          </div>
          <div className="flex items-center gap-2">
            <MonitorDot className="h-4 w-4 text-primary" /> Live order tracking
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Confetti worthy checkout
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-2">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardContent className="flex flex-col gap-6 p-8 md:flex-row">
            <div className="space-y-4 text-left">
              <h2 className="font-headline text-3xl">For Students</h2>
              <p className="text-muted-foreground">
                Curated menus, real-time bill updates, digital payments and QR based pickups. Keep favourites,
                rate dishes and earn early bird discounts.
              </p>
              <Button variant="secondary" className="w-fit" asChild>
                <Link href="/home">Browse Menu</Link>
              </Button>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"
              alt="Student ordering food using mobile app"
              width={320}
              height={240}
              className="rounded-xl object-cover shadow-lg"
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-muted bg-card/60">
          <CardContent className="flex flex-col gap-6 p-8 md:flex-row">
            <Image
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
              alt="Canteen staff preparing orders"
              width={320}
              height={240}
              className="rounded-xl object-cover shadow-lg"
            />
            <div className="space-y-4 text-left">
              <h2 className="font-headline text-3xl">For Canteen Admins</h2>
              <p className="text-muted-foreground">
                Manage counters, update menus, view sales heatmaps and broadcast offers – all from a unified,
                responsive dashboard.
              </p>
              <Button variant="outline" className="w-fit" asChild>
                <Link href="/admin/login">Access Admin Console</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-card/60 py-16">
        <div className="mx-auto max-w-6xl space-y-10 px-6">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl">Explore the Foodscape</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              From hearty breakfasts to smoothie bowls, find dishes curated for every mood, diet and timetable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card key={category.name} className="overflow-hidden border-none shadow-lg shadow-primary/10">
                <div className="relative h-40 w-full">
                  <Image src={category.image} alt={category.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20" />
                  <div className="absolute bottom-4 left-4 text-left text-white">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-sm text-white/80">{category.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: 'Instant Counter Tokens',
              description: 'Checkout triggers token generation like TN102 with QR for seamless pick-up.',
              icon: Clock3,
            },
            {
              title: 'Live Kitchen Feed',
              description: 'Admins update orders from Pending → Cooking → Ready → Delivered in real-time.',
              icon: ChefHat,
            },
            {
              title: 'Insightful Reports',
              description: 'Monitor daily sales, total revenue and counter-wise performance at a glance.',
              icon: MonitorDot,
            },
          ].map((feature) => (
            <Card key={feature.title} className="h-full border-2 border-primary/20">
              <CardHeader className="space-y-3">
                <feature.icon className="h-10 w-10 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
