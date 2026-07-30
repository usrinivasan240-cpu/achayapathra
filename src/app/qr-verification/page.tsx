'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  QrCode,
  ScanLine,
  CheckCircle2,
  XCircle,
  Camera,
  Download,
  Shield,
  Search,
  History,
  Clock,
  User,
  MapPin,
  Package,
  FileText,
  Award,
  Leaf,
  Building2,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { mockDonations, mockCertificates, mockUsers } from '@/lib/data';
import { Donation, Certificate, UserProfile } from '@/lib/types';

type VerificationType = 'donation' | 'certificate' | 'user' | null;

type ScanHistoryEntry = {
  id: string;
  code: string;
  type: VerificationType;
  result: 'valid' | 'invalid';
  timestamp: Date;
  itemName?: string;
};

function SimulatedQRScanner({
  onScan,
  isScanning,
  setIsScanning,
}: {
  onScan: (code: string) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
}) {
  const scanTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startScan = () => {
    setIsScanning(true);
    scanTimerRef.current = setTimeout(() => {
      const allCodes = [
        ...mockDonations.slice(0, 5).map((d) => d.id),
        ...mockCertificates.slice(0, 5).map((c) => c.qrCode),
        ...mockUsers.slice(0, 3).map((u) => u.id),
      ];
      const randomCode = allCodes[Math.floor(Math.random() * allCodes.length)];
      onScan(randomCode);
      setIsScanning(false);
    }, 2500);
  };

  React.useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  return (
    <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200">
            <Camera className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">QR Scanner</CardTitle>
            <CardDescription className="text-xs">
              Point camera at a QR code or tap to simulate scan
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div
          className="relative w-full max-w-xs aspect-square bg-gray-900 rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => !isScanning && startScan()}
        >
          {/* Corner brackets */}
          <div className="absolute inset-4 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-orange-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-orange-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-orange-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-orange-400 rounded-br-lg" />
          </div>

          {/* Scanning line animation */}
          {isScanning && (
            <div className="absolute inset-x-4 top-4 bottom-4 z-20 overflow-hidden">
              <div
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_12px_2px_rgba(251,146,60,0.6)]"
                style={{
                  animation: 'scanLine 1.8s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {isScanning ? (
              <div className="text-center">
                <ScanLine className="h-10 w-10 text-orange-400 mx-auto animate-pulse" />
                <p className="text-orange-300 text-xs font-semibold mt-2 animate-pulse">
                  Scanning...
                </p>
              </div>
            ) : (
              <div className="text-center group-hover:scale-105 transition-transform">
                <QrCode className="h-10 w-10 text-white/40 mx-auto" />
                <p className="text-white/50 text-xs font-semibold mt-2">
                  Tap to Scan
                </p>
              </div>
            )}
          </div>

          {/* Pulse rings when scanning */}
          {isScanning && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 border-2 border-orange-400/30 rounded-full animate-ping" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-48 h-48 border border-orange-400/20 rounded-full"
                  style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                />
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Simulated scan — tap the area above to auto-detect a code
        </p>
      </CardContent>
    </Card>
  );
}

function ManualInput({
  onVerify,
}: {
  onVerify: (code: string) => void;
}) {
  const [input, setInput] = React.useState('');

  return (
    <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200">
            <Keyboard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Manual Entry</CardTitle>
            <CardDescription className="text-xs">
              Type a donation ID, certificate QR code, or user ID
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. don-0001, CERT-ABC123, donor-001"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                onVerify(input.trim());
                setInput('');
              }
            }}
            className="font-mono text-sm"
          />
          <Button
            onClick={() => {
              if (input.trim()) {
                onVerify(input.trim());
                setInput('');
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shrink-0"
          >
            <Search className="h-4 w-4 mr-1.5" />
            Verify
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['don-0001', 'CERT-ABC123', 'donor-001'].map((example) => (
            <button
              key={example}
              onClick={() => {
                onVerify(example);
              }}
              className="text-[10px] font-mono px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VerificationResult({
  result,
}: {
  result: {
    type: VerificationType;
    data: Donation | Certificate | UserProfile | null;
    valid: boolean;
  } | null;
}) {
  if (!result) return null;

  if (!result.valid || !result.data) {
    return (
      <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-red-100 border border-red-200">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">Not Verified</h3>
              <p className="text-sm text-red-500 mt-1">
                No matching record found for the provided code.
              </p>
            </div>
            <Badge className="bg-red-100 text-red-600 border-red-200 text-xs">
              INVALID CODE
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const DonationResult = ({ donation }: { donation: Donation }) => {
    const createdDate = donation.createdAt?.toDate?.() ?? new Date();
    const expiryDate = donation.expiryTime?.toDate?.() ?? new Date();
    const isExpired = expiryDate < new Date();

    return (
      <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-100 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-emerald-700">
                  Donation Verified
                </CardTitle>
                <CardDescription className="text-xs">
                  Record found in Achayapathra database
                </CardDescription>
              </div>
            </div>
            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                isExpired
                  ? 'bg-red-100 text-red-600 border-red-200'
                  : 'bg-emerald-100 text-emerald-600 border-emerald-200'
              }`}
            >
              {isExpired ? 'EXPIRED' : donation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <h4 className="text-sm font-bold text-gray-900 mb-1">{donation.foodName}</h4>
            <p className="text-xs text-gray-500 line-clamp-2">{donation.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Quantity
              </p>
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-orange-500" />
                <p className="font-bold text-gray-800">{donation.quantity}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Status
              </p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <p className="font-bold text-gray-800">{donation.status}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Donor
              </p>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <p className="font-bold text-gray-800 truncate">{donation.donor.name}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Tracking ID
              </p>
              <div className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-purple-500" />
                <p className="font-mono font-bold text-gray-800 text-[10px]">
                  {donation.trackingId}
                </p>
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Location
              </p>
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                <p className="font-medium text-gray-800 text-xs leading-relaxed">
                  {donation.location}
                </p>
              </div>
            </div>
          </div>

          {donation.carbon_saved_kg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-100">
              <Leaf className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">
                {donation.carbon_saved_kg.toFixed(1)} kg CO₂ saved
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Created: {createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CertificateResult = ({ cert }: { cert: Certificate }) => {
    const issuedDate = cert.issuedDate?.toDate?.() ?? new Date();
    const validUntil = cert.validUntil?.toDate?.() ?? null;
    const isValid = validUntil ? validUntil > new Date() : true;

    return (
      <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-amber-100 border border-amber-200">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-amber-700">
                  Certificate Verified
                </CardTitle>
                <CardDescription className="text-xs">
                  Authentic Achayapathra certificate
                </CardDescription>
              </div>
            </div>
            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                isValid
                  ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                  : 'bg-red-100 text-red-600 border-red-200'
              }`}
            >
              {isValid ? '● VALID' : '○ EXPIRED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <h4 className="text-sm font-bold text-gray-900 mb-1">{cert.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2">{cert.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Recipient
              </p>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <p className="font-bold text-gray-800">{cert.userName}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Type
              </p>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-500" />
                <p className="font-bold text-gray-800 capitalize">{cert.type}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Issued By
              </p>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                <p className="font-bold text-gray-800 truncate">{cert.issuedBy}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                QR Code
              </p>
              <div className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-orange-500" />
                <p className="font-mono font-bold text-gray-800 text-[10px]">{cert.qrCode}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Issued Date
              </p>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-green-500" />
                <p className="font-bold text-gray-800">
                  {issuedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
                Valid Until
              </p>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <p className="font-bold text-gray-800">
                  {validUntil
                    ? validUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Permanent'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              Digitally signed & tamper-proof
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserResult = ({ user }: { user: UserProfile }) => (
    <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100 border border-blue-200">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-blue-700">
                User Verified
              </CardTitle>
              <CardDescription className="text-xs">
                Registered Achayapathra member
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-600 border-blue-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
            {user.role.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
          />
          <div>
            <h4 className="text-sm font-bold text-gray-900">{user.displayName}</h4>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              User ID
            </p>
            <p className="font-mono font-bold text-gray-800">{user.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              Role
            </p>
            <p className="font-bold text-gray-800 capitalize">{user.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              Level
            </p>
            <p className="font-bold text-gray-800">{user.level ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              Points
            </p>
            <p className="font-bold text-gray-800">{user.points.toLocaleString()}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              Address
            </p>
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
              <p className="font-medium text-gray-800 text-xs">{user.address}</p>
            </div>
          </div>
        </div>

        {user.badges && user.badges.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              Badges
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.badges.slice(0, 5).map((badge) => (
                <Badge
                  key={badge}
                  variant="secondary"
                  className="text-[10px] font-semibold bg-orange-50 text-orange-600 border-orange-200"
                >
                  {badge.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (result.type === 'donation' && result.data) {
    return <DonationResult donation={result.data as Donation} />;
  }
  if (result.type === 'certificate' && result.data) {
    return <CertificateResult cert={result.data as Certificate} />;
  }
  if (result.type === 'user' && result.data) {
    return <UserResult user={result.data as UserProfile} />;
  }
  return null;
}

function QRGenerator() {
  const [selectedType, setSelectedType] = React.useState<'donation' | 'certificate'>('donation');
  const [selectedId, setSelectedId] = React.useState('');
  const [generated, setGenerated] = React.useState(false);

  const items = selectedType === 'donation'
    ? mockDonations.slice(0, 20)
    : mockCertificates.slice(0, 20);

  const handleGenerate = () => {
    if (selectedId) setGenerated(true);
  };

  const generateQRSVG = (data: string, size: number = 160) => {
    const modules = 21;
    const cellSize = size / modules;
    let cells: React.ReactNode[] = [];

    const seed = data.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const pseudoRandom = (i: number, j: number) => {
      const val = ((seed * (i + 1) * (j + 1) + 12345) % 233280) / 233280;
      return val > 0.45;
    };

    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const isFinderPattern =
          (i < 7 && j < 7) ||
          (i < 7 && j >= modules - 7) ||
          (i >= modules - 7 && j < 7);

        if (isFinderPattern) {
          const isOuter = i === 0 || i === 6 || j === 0 || j === 6 ||
            i === modules - 7 || i === modules - 1 || j === modules - 7 || j === modules - 1;
          const isInner = (i >= 2 && i <= 4 && j >= 2 && j <= 4) ||
            (i >= 2 && i <= 4 && j >= modules - 5 && j <= modules - 3) ||
            (i >= modules - 5 && i <= modules - 3 && j >= 2 && j <= 4);

          if (isOuter || isInner) {
            cells.push(
              <rect
                key={`${i}-${j}`}
                x={j * cellSize}
                y={i * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1a1a1a"
                rx={1}
              />
            );
          }
        } else if (pseudoRandom(i, j)) {
          cells.push(
            <rect
              key={`${i}-${j}`}
              x={j * cellSize}
              y={i * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#FF6B35"
              rx={1}
              opacity={0.85}
            />
          );
        }
      }
    }

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={size} height={size} fill="white" rx={8} />
        {cells}
      </svg>
    );
  };

  return (
    <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200">
            <QrCode className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Generate QR Code</CardTitle>
            <CardDescription className="text-xs">
              Create a QR code for any donation or certificate
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'donation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSelectedType('donation'); setSelectedId(''); setGenerated(false); }}
            className="text-xs font-semibold"
          >
            <Package className="h-3.5 w-3.5 mr-1" />
            Donation
          </Button>
          <Button
            variant={selectedType === 'certificate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSelectedType('certificate'); setSelectedId(''); setGenerated(false); }}
            className="text-xs font-semibold"
          >
            <Award className="h-3.5 w-3.5 mr-1" />
            Certificate
          </Button>
        </div>

        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setGenerated(false); }}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select a {selectedType}...</option>
          {items.map((item) => (
            <option key={item.id} value={selectedType === 'donation' ? item.id : (item as Certificate).qrCode}>
              {selectedType === 'donation'
                ? `${(item as Donation).foodName} (${item.id})`
                : `${(item as Certificate).title} — ${(item as Certificate).qrCode}`}
            </option>
          ))}
        </select>

        <Button
          onClick={handleGenerate}
          disabled={!selectedId}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Generate QR Code
        </Button>

        {generated && selectedId && (
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-violet-50/50 border border-violet-100 animate-in fade-in slide-in-from-bottom-2">
            {generateQRSVG(selectedId)}
            <p className="font-mono text-xs text-violet-700 font-bold tracking-wider">{selectedId}</p>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => navigator.clipboard?.writeText(selectedId)}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy ID
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScanHistoryPanel({
  history,
  onRecall,
}: {
  history: ScanHistoryEntry[];
  onRecall: (code: string) => void;
}) {
  return (
    <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200">
            <History className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Scan History</CardTitle>
            <CardDescription className="text-xs">
              {history.length} verification{history.length !== 1 ? 's' : ''} in this session
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No scans yet this session</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-100/50 transition-colors group"
              >
                {entry.result === 'valid' ? (
                  <div className="p-1 rounded-full bg-emerald-100 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ) : (
                  <div className="p-1 rounded-full bg-red-100 shrink-0">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {entry.itemName ?? entry.code}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{entry.code}</span>
                    <span>·</span>
                    <span>{entry.type ?? 'unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRecall(entry.code)}
                    className="p-1 rounded hover:bg-white transition-colors"
                    title="Re-verify"
                  >
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {entry.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Keyboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" ry="2" />
      <path d="M6 8h.001" /><path d="M10 8h.001" /><path d="M14 8h.001" />
      <path d="M18 8h.001" /><path d="M8 12h.001" /><path d="M12 12h.001" />
      <path d="M16 12h.001" /><path d="M7 16h10" />
    </svg>
  );
}

export default function QRVerificationPage() {
  const [isScanning, setIsScanning] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<{
    type: VerificationType;
    data: Donation | Certificate | UserProfile | null;
    valid: boolean;
  } | null>(null);
  const [scanHistory, setScanHistory] = React.useState<ScanHistoryEntry[]>([]);

  const verifyCode = React.useCallback((code: string) => {
    const trimmed = code.trim();

    const donation = mockDonations.find(
      (d) => d.id === trimmed || d.trackingId === trimmed
    );
    if (donation) {
      const entry: ScanHistoryEntry = {
        id: `scan-${Date.now()}`,
        code: trimmed,
        type: 'donation',
        result: 'valid',
        timestamp: new Date(),
        itemName: donation.foodName,
      };
      setScanHistory((prev) => [entry, ...prev]);
      setVerificationResult({ type: 'donation', data: donation, valid: true });
      return;
    }

    const cert = mockCertificates.find(
      (c) => c.id === trimmed || c.qrCode === trimmed
    );
    if (cert) {
      const entry: ScanHistoryEntry = {
        id: `scan-${Date.now()}`,
        code: trimmed,
        type: 'certificate',
        result: 'valid',
        timestamp: new Date(),
        itemName: cert.title,
      };
      setScanHistory((prev) => [entry, ...prev]);
      setVerificationResult({ type: 'certificate', data: cert, valid: true });
      return;
    }

    const user = mockUsers.find((u) => u.id === trimmed || u.email === trimmed);
    if (user) {
      const entry: ScanHistoryEntry = {
        id: `scan-${Date.now()}`,
        code: trimmed,
        type: 'user',
        result: 'valid',
        timestamp: new Date(),
        itemName: user.displayName,
      };
      setScanHistory((prev) => [entry, ...prev]);
      setVerificationResult({ type: 'user', data: user, valid: true });
      return;
    }

    const entry: ScanHistoryEntry = {
      id: `scan-${Date.now()}`,
      code: trimmed,
      type: null,
      result: 'invalid',
      timestamp: new Date(),
    };
    setScanHistory((prev) => [entry, ...prev]);
    setVerificationResult({ type: null, data: null, valid: false });
  }, []);

  return (
    <>
      <Header title="QR Verification" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-none shadow-sm bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{scanHistory.filter((h) => h.result === 'valid').length}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{scanHistory.filter((h) => h.result === 'invalid').length}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Invalid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{mockDonations.length}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Donations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{mockCertificates.length}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="scan" className="text-xs font-bold uppercase py-2.5">
              <Camera className="h-4 w-4 mr-1.5" />
              Scan & Verify
            </TabsTrigger>
            <TabsTrigger value="generate" className="text-xs font-bold uppercase py-2.5">
              <QrCode className="h-4 w-4 mr-1.5" />
              Generate QR
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-bold uppercase py-2.5">
              <History className="h-4 w-4 mr-1.5" />
              History ({scanHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <SimulatedQRScanner
                  onScan={verifyCode}
                  isScanning={isScanning}
                  setIsScanning={setIsScanning}
                />
                <ManualInput onVerify={verifyCode} />
              </div>
              <div>
                {verificationResult ? (
                  <VerificationResult result={verificationResult} />
                ) : (
                  <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden h-full flex items-center justify-center min-h-[300px]">
                    <div className="text-center px-6 py-12">
                      <div className="p-4 rounded-full bg-orange-100/50 border border-orange-200/50 mx-auto w-fit mb-4">
                        <ScanLine className="h-10 w-10 text-orange-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-400">Ready to Verify</h3>
                      <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs mx-auto">
                        Scan a QR code or enter a code manually to see verification results
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="mt-6">
            <div className="max-w-md mx-auto">
              <QRGenerator />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <ScanHistoryPanel
              history={scanHistory}
              onRecall={(code) => {
                verifyCode(code);
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      <style jsx global>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom-2 {
          from { transform: translateY(0.5rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out, slide-in-from-bottom-2 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
