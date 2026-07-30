'use client';

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Award, Download, Share2, Printer, Linkedin, MessageCircle, Mail,
  CheckCircle2, Shield, Leaf, Users, Truck, MapPin, Zap, Heart,
  Trophy, Star, Diamond, Gem, Medal, Clock,
} from 'lucide-react';

export type CertificateLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type CertificateData = {
  id: string;
  recipientName: string;
  recipientId?: string;
  role: string;
  title: string;
  description: string;
  issuedDate: Date;
  validUntil?: Date;
  issuedBy: string;
  qrCode: string;
  impact: {
    mealsServed?: number;
    foodRescuedKg?: number;
    peopleBenefited?: number;
    carbonSavedKg?: number;
    volunteerHours?: number;
    distanceTravelledKm?: number;
    certificatesEarned?: number;
    impactPoints?: number;
  };
  level: CertificateLevel;
  foodDonated?: number;
  mealsContributed?: number;
  deliveriesCompleted?: number;
  donationId?: string;
  foodName?: string;
  quantity?: string;
};

const LEVEL_CONFIG: Record<CertificateLevel, {
  label: string;
  color: string;
  icon: React.ElementType;
}> = {
  bronze: { label: 'Bronze', color: '#CD7F32', icon: Medal },
  silver: { label: 'Silver', color: '#94A3B8', icon: Star },
  gold: { label: 'Gold', color: '#EAB308', icon: Trophy },
  platinum: { label: 'Platinum', color: '#8B5CF6', icon: Gem },
  diamond: { label: 'Diamond', color: '#06B6D4', icon: Diamond },
};

function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

export function getCertificateLevel(points: number): CertificateLevel {
  if (points >= 10000) return 'diamond';
  if (points >= 5000) return 'platinum';
  if (points >= 2000) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
}

function TamilNaduEmblem({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} fill="none">
      {/* Temple Tower (Srivilliputhur Andal) */}
      <rect x="20" y="10" width="60" height="8" rx="1" fill="#1E3A8A" />
      <rect x="25" y="18" width="50" height="6" rx="1" fill="#F97316" />
      <rect x="30" y="24" width="40" height="5" rx="1" fill="#1E3A8A" />
      {/* Main tower body */}
      <path d="M28 29 L72 29 L68 75 L32 75 Z" fill="#1E3A8A" />
      <rect x="35" y="32" width="30" height="3" rx="1" fill="#F97316" opacity="0.8" />
      <rect x="38" y="37" width="24" height="2" rx="1" fill="#F97316" opacity="0.6" />
      <rect x="40" y="41" width="20" height="2" rx="1" fill="#F97316" opacity="0.5" />
      {/* Windows/Doors */}
      <rect x="42" y="50" width="16" height="20" rx="8" fill="#F97316" />
      <rect x="44" y="52" width="12" height="16" rx="6" fill="#1E3A8A" />
      <rect x="46" y="54" width="8" height="12" rx="4" fill="#F97316" opacity="0.6" />
      {/* Flag */}
      <line x1="50" y1="2" x2="50" y2="12" stroke="#1E3A8A" strokeWidth="1.5" />
      <path d="M50 2 L62 6 L50 10 Z" fill="#FF6B35" />
      {/* Base platform */}
      <rect x="15" y="75" width="70" height="8" rx="2" fill="#1E3A8A" />
      <rect x="10" y="83" width="80" height="6" rx="2" fill="#F97316" />
      <rect x="8" y="89" width="84" height="8" rx="2" fill="#1E3A8A" />
      {/* Tamil text area */}
      <rect x="20" y="100" width="60" height="14" rx="3" fill="#FFFBEB" stroke="#1E3A8A" strokeWidth="1" />
      <text x="50" y="110" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1E3A8A" fontFamily="sans-serif">
        தமிழ்நாடு அரசு
      </text>
    </svg>
  );
}

export function PremiumCertificate({
  data,
  showActions = true,
  isPreview = false,
}: {
  data: CertificateData;
  showActions?: boolean;
  isPreview?: boolean;
}) {
  const certRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const levelConfig = LEVEL_CONFIG[data.level];
  const LevelIcon = levelConfig.icon;
  const hash = generateHash(`${data.id}-${data.recipientName}-${data.issuedDate.toISOString()}`);
  const verificationUrl = `https://achayapathra.vercel.app/qr-verification?code=${data.qrCode}`;

  const exportPDF = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Achayapathra-Certificate-${data.id}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
    setIsExporting(false);
  };

  const exportPNG = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, backgroundColor: '#ffffff', useCORS: true, logging: false });
      const link = document.createElement('a');
      link.download = `Achayapathra-Certificate-${data.id}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
    setIsExporting(false);
  };

  const shareLinkedIn = () => {
    const text = encodeURIComponent(`I received a ${levelConfig.label} Certificate of Appreciation from Achayapathra! 🏆\n\n#Achayapathra #FoodRedistribution #CircularFoodEconomy`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}&summary=${text}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🏆 Certificate from Achayapathra\n\n${data.title}\nRecipient: ${data.recipientName}\n\nVerify: ${verificationUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`My Achayapathra Certificate - ${data.title}`);
    const body = encodeURIComponent(`I received a ${levelConfig.label} Certificate from Achayapathra!\n\n${data.title}\nRecipient: ${data.recipientName}\nDate: ${data.issuedDate.toLocaleDateString('en-IN')}\n\nVerify: ${verificationUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="relative">
      {isPreview && (
        <style>{`
          @keyframes certReveal { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes goldShine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          @keyframes sealPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          @keyframes confettiFall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
          .cert-animate { animation: certReveal 0.8s ease-out forwards; }
          .gold-shine { background: linear-gradient(90deg, transparent, ${levelConfig.color}22, transparent); background-size: 200% 100%; animation: goldShine 3s ease-in-out infinite; }
          .seal-animate { animation: sealPulse 2s ease-in-out infinite; }
          .confetti-piece { position: fixed; width: 10px; height: 10px; animation: confettiFall linear forwards; }
          @media print { .no-print { display: none !important; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        `}</style>
      )}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#FF6B35', '#16A34A', '#1E3A8A', '#EAB308', '#8B5CF6'][i % 5],
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 0.5}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }} />
          ))}
        </div>
      )}

      <div
        ref={certRef}
        className={`relative bg-white overflow-hidden ${isPreview ? 'cert-animate rounded-xl shadow-2xl' : ''}`}
        style={{ aspectRatio: '297/210' }}
      >
        {/* Outer border */}
        <div className="absolute inset-0 border-[3px]" style={{ borderColor: '#1E3A8A' }} />
        <div className="absolute inset-[6px] border-[1.5px]" style={{ borderColor: '#F97316' }} />
        <div className="absolute inset-[10px] border" style={{ borderColor: '#16A34A40' }} />

        {/* Corner ornaments */}
        {[
          { top: '14px', left: '14px', rotate: '0deg' },
          { top: '14px', right: '14px', rotate: '90deg' },
          { bottom: '14px', right: '14px', rotate: '180deg' },
          { bottom: '14px', left: '14px', rotate: '270deg' },
        ].map((pos, i) => (
          <div key={i} className="absolute w-10 h-10" style={{ ...pos, transform: `rotate(${pos.rotate})` }}>
            <svg viewBox="0 0 40 40" fill="none">
              <path d="M0 0 L16 0 L16 3 L3 3 L3 16 L0 16 Z" fill="#1E3A8A" opacity="0.7" />
              <path d="M0 0 L12 0 L12 1.5 L1.5 1.5 L1.5 12 L0 12 Z" fill="#F97316" opacity="0.5" />
            </svg>
          </div>
        ))}

        {/* Top band - Indian flag colors */}
        <div className="absolute top-0 left-0 right-0 h-[6px]" style={{ background: 'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[6px]" style={{ background: 'linear-gradient(90deg, #138808 33%, #FFFFFF 33% 66%, #FF9933 66%)' }} />

        {/* Gold shine overlay */}
        {isPreview && <div className="absolute inset-0 gold-shine pointer-events-none" />}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-8 py-6 sm:px-12 sm:py-8 text-center">

          {/* Header - Government + Platform */}
          <div className="flex items-start justify-between w-full">
            {/* Tamil Nadu Government Emblem */}
            <div className="flex items-center gap-2">
              <TamilNaduEmblem size={40} />
              <div className="text-left">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-wider" style={{ color: '#1E3A8A', fontFamily: 'Poppins, sans-serif' }}>
                  GOVERNMENT OF TAMIL NADU
                </p>
                <p className="text-[7px] sm:text-[8px] text-muted-foreground">
                  In Recognition of Social Service
                </p>
              </div>
            </div>

            {/* Achayapathra Logo */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-wider" style={{ color: '#16A34A', fontFamily: 'Poppins, sans-serif' }}>
                  ACHAYAPATHRA
                </p>
                <p className="text-[7px] sm:text-[8px] text-muted-foreground">
                  Circular Food Economy Platform
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16A34A, #15803d)' }}>
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Decorative line */}
          <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, #1E3A8A40, #F9731640, #16A34A40, transparent)' }} />

          {/* Certificate Title */}
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase font-semibold" style={{ color: '#F97316', fontFamily: 'Poppins, sans-serif' }}>
              Certificate of
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#1E3A8A' }}>
              APPRECIATION
            </h1>
            <div className="w-32 h-[2px] mx-auto" style={{ background: 'linear-gradient(90deg, #16A34A, #F97316, #1E3A8A)' }} />
            <p className="text-[8px] sm:text-[9px] italic text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
              "From Excess to Access – Every Meal Creates Value."
            </p>
          </div>

          {/* Body - Recipient */}
          <div className="space-y-2 max-w-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
              This certificate is proudly presented to
            </p>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ fontFamily: 'Playfair Display, serif', color: '#1E3A8A', borderBottom: '2px solid #F97316', paddingBottom: '4px', display: 'inline-block' }}>
              {data.recipientName}
            </h2>
            {data.recipientId && (
              <p className="text-[8px] sm:text-[9px] text-muted-foreground font-mono">ID: {data.recipientId}</p>
            )}
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              for their valuable contribution towards reducing food waste, supporting communities,
              and promoting sustainable food redistribution through the Achayapathra platform.
            </p>
          </div>

          {/* Certificate Details Grid */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-[8px] sm:text-[9px] w-full max-w-lg">
            <div className="text-left">
              <span className="text-muted-foreground">Certificate ID: </span>
              <span className="font-bold font-mono" style={{ color: '#1E3A8A' }}>{data.id.toUpperCase()}</span>
            </div>
            <div className="text-center">
              <span className="text-muted-foreground">Role: </span>
              <span className="font-bold capitalize" style={{ color: '#16A34A' }}>{data.role}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Issue Date: </span>
              <span className="font-bold" style={{ color: '#F97316' }}>{data.issuedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            {data.foodName && (
              <div className="text-left">
                <span className="text-muted-foreground">Food: </span>
                <span className="font-bold" style={{ color: '#1E3A8A' }}>{data.foodName}</span>
              </div>
            )}
            {data.quantity && (
              <div className="text-center">
                <span className="text-muted-foreground">Quantity: </span>
                <span className="font-bold" style={{ color: '#1E3A8A' }}>{data.quantity}</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-muted-foreground">Verification: </span>
              <span className="font-bold text-green-600">✓ Verified</span>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-4 gap-2 w-full max-w-xl">
            {[
              { label: 'Meals Served', value: data.impact.mealsServed || 0, icon: Heart, color: '#F97316' },
              { label: 'Food Rescued', value: `${data.impact.foodRescuedKg || 0}kg`, icon: Leaf, color: '#16A34A' },
              { label: 'People Helped', value: data.impact.peopleBenefited || 0, icon: Users, color: '#1E3A8A' },
              { label: 'CO₂ Saved', value: `${data.impact.carbonSavedKg || 0}kg`, icon: Zap, color: '#EAB308' },
            ].map((stat, i) => (
              <div key={i} className="p-1.5 sm:p-2 rounded-lg text-center" style={{ background: stat.color + '08', border: `1px solid ${stat.color}20` }}>
                <stat.icon className="h-3 w-3 mx-auto mb-0.5" style={{ color: stat.color }} />
                <p className="text-xs sm:text-sm font-black" style={{ color: stat.color, fontFamily: 'Poppins, sans-serif' }}>{stat.value}</p>
                <p className="text-[6px] sm:text-[7px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between w-full max-w-2xl gap-4">
            {/* Left - Digital Signature */}
            <div className="text-left space-y-1">
              <div className="w-20 h-px bg-gray-400 mb-1" />
              <p className="text-[8px] sm:text-[9px] font-bold" style={{ color: '#1E3A8A' }}>Authorized Signatory</p>
              <p className="text-[7px] sm:text-[8px] text-muted-foreground">Achayapathra Foundation</p>
              <p className="text-[6px] sm:text-[7px] text-muted-foreground">Digitally Generated</p>
            </div>

            {/* Center - Level Badge & QR */}
            <div className="flex flex-col items-center gap-1">
              <div className="seal-animate w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${levelConfig.color}, ${levelConfig.color}cc)` }}>
                <LevelIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-[7px] sm:text-[8px] font-bold tracking-wider uppercase" style={{ color: levelConfig.color }}>{levelConfig.label} Level</p>
              <div className="bg-white p-1 rounded-lg border border-gray-200">
                <QRCodeSVG value={verificationUrl} size={44} bgColor="#ffffff" fgColor="#1E3A8A" level="M" />
              </div>
              <p className="text-[6px] text-muted-foreground font-mono">{data.qrCode.slice(0, 16)}</p>
            </div>

            {/* Right - Platform Seal */}
            <div className="text-right space-y-1">
              <div className="w-20 h-px bg-gray-400 mb-1 ml-auto" />
              <p className="text-[8px] sm:text-[9px] font-bold" style={{ color: '#16A34A' }}>Platform Seal</p>
              <p className="text-[7px] sm:text-[8px] text-muted-foreground">Verified &amp; Authentic</p>
              <div className="flex items-center justify-end gap-1">
                <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                <span className="text-[6px] sm:text-[7px] text-green-600 font-bold">Verified</span>
              </div>
              <p className="text-[6px] text-muted-foreground font-mono">Hash: {hash}</p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-3 text-[6px] sm:text-[7px] text-muted-foreground">
            <span>Govt. of Tamil Nadu Recognition</span>
            <span>•</span>
            <span>achayapathra.vercel.app</span>
            <span>•</span>
            <span>Cert: {data.id.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="no-print flex flex-wrap gap-2 mt-4 justify-center">
          <button onClick={async () => { setShowConfetti(true); await exportPDF(); setTimeout(() => setShowConfetti(false), 3000); }} disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F97316, #ea580c)' }}>
            <Download className="h-4 w-4" />{isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
          <button onClick={exportPNG} disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #16A34A, #15803d)' }}>
            <Download className="h-4 w-4" />Download PNG
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all hover:scale-105" style={{ borderColor: '#1E3A8A', color: '#1E3A8A' }}>
            <Printer className="h-4 w-4" />Print
          </button>
          <button onClick={shareLinkedIn} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#0A66C2' }}>
            <Linkedin className="h-4 w-4" />LinkedIn
          </button>
          <button onClick={shareWhatsApp} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#25D366' }}>
            <MessageCircle className="h-4 w-4" />WhatsApp
          </button>
          <button onClick={shareEmail} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105" style={{ background: '#1E3A8A' }}>
            <Mail className="h-4 w-4" />Email
          </button>
        </div>
      )}
    </div>
  );
}

export function generateCertificateData(userId: string, userName: string, role: string, trigger: string, impact: CertificateData['impact'], extra?: { donationId?: string; foodName?: string; quantity?: string; recipientId?: string }): CertificateData {
  const certId = `ACP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const qrCode = `CERT-${certId}-${userId.substring(0, 8)}`;
  const totalPoints = (impact.mealsServed || 0) * 10 + (impact.foodRescuedKg || 0) * 5 + (impact.volunteerHours || 0) * 15 + (impact.carbonSavedKg || 0) * 20 + (impact.impactPoints || 0);

  return {
    id: certId,
    recipientName: userName,
    recipientId: extra?.recipientId || userId,
    role,
    title: trigger,
    description: `Certificate of Appreciation for ${trigger}`,
    issuedDate: new Date(),
    issuedBy: 'Achayapathra Foundation',
    qrCode,
    impact,
    level: getCertificateLevel(totalPoints),
    foodDonated: impact.foodRescuedKg,
    mealsContributed: impact.mealsServed,
    deliveriesCompleted: impact.distanceTravelledKm ? Math.floor(impact.distanceTravelledKm / 5) : 0,
    donationId: extra?.donationId,
    foodName: extra?.foodName,
    quantity: extra?.quantity,
  };
}
