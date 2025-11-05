
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlaceHolderImages from '@/lib/placeholder-images.json';
import { Utensils, Users, Globe, Smile } from 'lucide-react';
import Image from 'next/image';

export default function ImpactPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'impact-hero');
  const galleryImages = [
    PlaceHolderImages.find((img) => img.id === 'impact-gallery-1'),
    PlaceHolderImages.find((img) => img.id === 'impact-gallery-2'),
    PlaceHolderImages.find((img) => img.id === 'impact-gallery-3'),
  ].filter(Boolean) as (typeof PlaceHolderImages)[0][];

  const stats = [
    {
      icon: Utensils,
      value: '12,500+',
      label: 'Meals Donated',
    },
    {
      icon: Users,
      value: '4,200+',
      label: 'People Fed',
    },
    {
      icon: Globe,
      value: '8 Tons',
      label: 'Reduced Waste',
    },
    {
        icon: Smile,
        value: '35+',
        label: 'Partner NGOs',
      },
  ];

  return (
    <>
      <Header title="Our Impact" />
      <main className="flex-1">
        {heroImage && (
          <div className="relative h-[400px] w-full">
            <Image
              src="https://picsum.photos/seed/community-love/1600/400"
              alt="People sharing food and smiling."
              fill
              objectFit="cover"
              data-ai-hint="people sharing food"
              className="brightness-50"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
              <h1 className="text-5xl font-bold font-headline">
                Building Humanity Through Sharing
              </h1>
              <p className="mt-4 max-w-2xl text-lg italic">
                &quot;The best way to find yourself is to lose yourself in the service of others.&quot; - Mahatma Gandhi
              </p>
            </div>
          </div>
        )}

        <div className="p-4 md:p-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                        <stat.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-3xl font-bold text-primary">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        <div className="p-4 md:p-8">
          <h2 className="mb-6 text-center text-3xl font-bold font-headline">Moments of Hope</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={400}
                  height={300}
                  data-ai-hint={image.imageHint}
                  className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <CardContent className='p-4'>
                    <p className='text-sm text-muted-foreground italic'>{image.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
