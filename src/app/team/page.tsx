'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { 
  Users, 
  Mail, 
  Instagram, 
  Linkedin, 
  Youtube, 
  ExternalLink,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function TeamPage() {
  const { t } = useLanguage();

  const socialLinks = [
    {
      name: 'Gmail',
      icon: Mail,
      url: 'mailto:achayapathra@gmail.com',
      label: 'achayapathra@gmail.com',
      color: 'text-red-500'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/achayapathra',
      label: '@achayapathra',
      color: 'text-pink-600'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com/company/achayapathra',
      label: 'Achayapathra Foundation',
      color: 'text-blue-700'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://youtube.com/@achayapathra',
      label: 'Achayapathra Official',
      color: 'text-red-600'
    },
    {
      name: 'Website',
      icon: Globe,
      url: 'https://achayapathra.org',
      label: 'www.achayapathra.org',
      color: 'text-primary'
    }
  ];

  return (
    <>
      <Header title={t('nav.team')} />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl shadow-lg border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Achayapathra Team</CardTitle>
            <CardDescription className="text-md mt-2">
              Connect with us across our social platforms. We'd love to hear your ideas and stay in touch!
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {socialLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className="h-16 flex items-center justify-between px-6 hover:bg-muted/50 transition-all border-muted"
                asChild
              >
                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-4">
                    <div className={`${link.color} p-2 bg-muted rounded-full`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{link.name}</p>
                      <p className="text-xs text-muted-foreground">{link.label}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
