'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  PremiumCertificate,
  generateCertificateData,
  getCertificateLevel,
  CertificateData,
} from '@/components/certificates/premium-certificate';
import {
  Award,
  Download,
  QrCode,
  CheckCircle2,
  Shield,
  FileText,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Leaf,
  Trophy,
  Heart,
  X,
  Share2,
  Printer,
  Sparkles,
  Zap,
  Users,
  Truck,
  MapPin,
  Clock,
  Medal,
  Star,
  Gem,
  Diamond,
} from 'lucide-react';
import { mockCertificates, mockDonations, mockNGOs } from '@/lib/data';
import { Certificate } from '@/lib/types';
import { useUser } from '@/firebase/provider';

const CERT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType; border: string }
> = {
  donation: { label: 'Donation', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Heart },
  volunteer: { label: 'Volunteer', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: User },
  ngo: { label: 'NGO', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: Building2 },
  corporate: { label: 'Corporate', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Building2 },
  achievement: { label: 'Achievement', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Trophy },
  carbon: { label: 'Carbon Offset', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Leaf },
  government: { label: 'Government', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Shield },
};

const LEVEL_ICONS: Record<string, React.ElementType> = {
  bronze: Medal,
  silver: Star,
  gold: Trophy,
  platinum: Gem,
  diamond: Diamond,
};

const LEVEL_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#94A3B8',
  gold: '#EAB308',
  platinum: '#8B5CF6',
  diamond: '#06B6D4',
};

function generateDemoCertificateData(cert: Certificate, userName?: string, userId?: string): CertificateData {
  const impact = {
    mealsServed: Math.floor(Math.random() * 500) + 50,
    foodRescuedKg: Math.floor(Math.random() * 200) + 20,
    peopleBenefited: Math.floor(Math.random() * 300) + 30,
    carbonSavedKg: Math.floor(Math.random() * 150) + 10,
    volunteerHours: Math.floor(Math.random() * 100) + 10,
    distanceTravelledKm: Math.floor(Math.random() * 200) + 20,
    impactPoints: Math.floor(Math.random() * 5000) + 500,
  };
  return {
    id: cert.id,
    recipientName: userName || cert.userName,
    recipientId: userId || cert.userId,
    role: cert.type,
    title: cert.title,
    description: cert.description,
    issuedDate: cert.issuedDate?.toDate?.() ?? new Date(),
    issuedBy: cert.issuedBy,
    qrCode: cert.qrCode,
    impact,
    level: getCertificateLevel(impact.impactPoints),
    foodDonated: impact.foodRescuedKg,
    mealsContributed: impact.mealsServed,
    deliveriesCompleted: Math.floor(Math.random() * 50) + 5,
  };
}

function CertificateCard({
  cert,
  onPreview,
  userName,
  userId,
}: {
  cert: Certificate;
  onPreview: (cert: Certificate) => void;
  userName?: string;
  userId?: string;
}) {
  const config = CERT_TYPE_CONFIG[cert.type] || CERT_TYPE_CONFIG.achievement;
  const TypeIcon = config.icon;
  const issuedDate = cert.issuedDate?.toDate?.() ?? new Date();
  const validUntil = cert.validUntil?.toDate?.() ?? null;
  const isValid = validUntil ? validUntil > new Date() : true;
  const certData = generateDemoCertificateData(cert, userName, userId);
  const LevelIcon = LEVEL_ICONS[certData.level] || Trophy;
  const levelColor = LEVEL_COLORS[certData.level] || '#EAB308';

  return (
    <Card className="group relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm hover:-translate-y-1">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, #16A34A, #F97316, #1E3A8A)` }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${config.bg} ${config.border} border`}>
            <TypeIcon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)` }}
            >
              <LevelIcon className="h-3.5 w-3.5" />
            </div>
            <Badge
              variant={isValid ? 'default' : 'secondary'}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                isValid
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-red-100 text-red-600 border-red-200'
              }`}
            >
              {isValid ? '● Verified' : '○ Expired'}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-base font-bold mt-3 leading-tight line-clamp-2">
          {cert.title}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed line-clamp-2 mt-1">
          {cert.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium">{cert.userName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{cert.issuedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{issuedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <QrCode className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-[10px] tracking-wider">{cert.qrCode}</span>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs font-semibold border-dashed hover:bg-primary/5 hover:border-primary/30"
          onClick={() => onPreview(cert)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Preview
        </Button>
      </div>
    </Card>
  );
}

function VerifySection() {
  const [verifyInput, setVerifyInput] = React.useState('');
  const [verifyResult, setVerifyResult] = React.useState<'found' | 'not_found' | null>(null);
  const [foundCert, setFoundCert] = React.useState<Certificate | null>(null);

  const handleVerify = () => {
    if (!verifyInput.trim()) return;
    const cert = mockCertificates.find(
      (c) =>
        c.id.toLowerCase() === verifyInput.trim().toLowerCase() ||
        c.qrCode.toLowerCase() === verifyInput.trim().toLowerCase()
    );
    if (cert) {
      setVerifyResult('found');
      setFoundCert(cert);
    } else {
      setVerifyResult('not_found');
      setFoundCert(null);
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #16A34A, #F97316, #1E3A8A)' }} />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200">
            <QrCode className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Verify Certificate</CardTitle>
            <CardDescription className="text-xs">Enter certificate ID or scan QR code to verify authenticity</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter Certificate ID or QR Code..."
            value={verifyInput}
            onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="font-mono text-sm"
          />
          <Button onClick={handleVerify} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shrink-0">
            <Search className="h-4 w-4 mr-1.5" />
            Verify
          </Button>
        </div>

        {verifyResult === 'found' && foundCert && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-700">Certificate Verified Successfully</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-emerald-500 uppercase tracking-wider font-semibold text-[10px]">Title</p>
                <p className="font-bold text-emerald-800">{foundCert.title}</p>
              </div>
              <div>
                <p className="text-emerald-500 uppercase tracking-wider font-semibold text-[10px]">Recipient</p>
                <p className="font-bold text-emerald-800">{foundCert.userName}</p>
              </div>
              <div>
                <p className="text-emerald-500 uppercase tracking-wider font-semibold text-[10px]">Type</p>
                <p className="font-bold text-emerald-800">{CERT_TYPE_CONFIG[foundCert.type]?.label}</p>
              </div>
              <div>
                <p className="text-emerald-500 uppercase tracking-wider font-semibold text-[10px]">Issued By</p>
                <p className="font-bold text-emerald-800">{foundCert.issuedBy}</p>
              </div>
            </div>
          </div>
        )}

        {verifyResult === 'not_found' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-sm font-bold text-red-700">Certificate Not Found</span>
            </div>
            <p className="text-xs text-red-600">No certificate matches the provided ID. Please check and try again.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CertificatesPage() {
  const user = useUser();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [previewCert, setPreviewCert] = React.useState<Certificate | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const filteredCertificates = React.useMemo(() => {
    return mockCertificates.filter((cert) => {
      const matchesSearch =
        searchQuery === '' ||
        cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || cert.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  const stats = React.useMemo(() => {
    const total = mockCertificates.length;
    const byType: Record<string, number> = {};
    mockCertificates.forEach((cert) => {
      byType[cert.type] = (byType[cert.type] || 0) + 1;
    });
    return { total, byType };
  }, []);

  const handlePreview = (cert: Certificate) => {
    setPreviewCert(cert);
    setPreviewOpen(true);
  };

  return (
    <>
      <Header title="Certificate Centre" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card className="col-span-2 md:col-span-4 lg:col-span-1 border-none shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #16A34A, #F97316)' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.total}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">Total Issued</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {Object.entries(CERT_TYPE_CONFIG)
            .filter(([key]) => stats.byType[key])
            .map(([key, config]) => {
              const Icon = config.icon;
              return (
                <Card key={key} className="border-none shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${config.bg}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900">{stats.byType[key]}</p>
                        <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">{config.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="certificates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="certificates" className="text-xs font-bold uppercase py-2.5">
              <FileText className="h-4 w-4 mr-1.5" />
              All Certificates
            </TabsTrigger>
            <TabsTrigger value="verify" className="text-xs font-bold uppercase py-2.5">
              <Shield className="h-4 w-4 mr-1.5" />
              Verify Certificate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificates" className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/70 backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('all')}
                  className="shrink-0 text-xs font-semibold"
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  All
                </Button>
                {Object.entries(CERT_TYPE_CONFIG)
                  .filter(([key]) => stats.byType[key])
                  .map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <Button
                        key={key}
                        variant={typeFilter === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter(key)}
                        className="shrink-0 text-xs font-semibold"
                      >
                        <Icon className="h-3.5 w-3.5 mr-1" />
                        {config.label}
                      </Button>
                    );
                  })}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-semibold">
                Showing <span className="text-foreground">{filteredCertificates.length}</span> of{' '}
                <span className="text-foreground">{mockCertificates.length}</span> certificates
              </p>
            </div>

            {/* Certificate Grid */}
            {filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCertificates.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    cert={cert}
                    onPreview={handlePreview}
                    userName={user?.user?.displayName || user?.user?.email?.split('@')[0] || cert.userName}
                    userId={user?.user?.uid || cert.userId}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-none bg-white/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm font-bold text-muted-foreground">No certificates found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verify" className="mt-6">
            <VerifySection />
          </TabsContent>
        </Tabs>
      </main>

      {/* Premium Certificate Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Award className="h-5 w-5 text-primary" />
                Certificate Preview
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {previewCert && (
            <div className="p-4 pt-0">
              <PremiumCertificate
                data={generateDemoCertificateData(
                  previewCert,
                  user?.user?.displayName || user?.user?.email?.split('@')[0] || previewCert.userName,
                  user?.user?.uid || previewCert.userId
                )}
                showActions={true}
                isPreview={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
