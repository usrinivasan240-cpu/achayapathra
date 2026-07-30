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
};

const LEVEL_CONFIG: Record<CertificateLevel, {
  label: string;
  color: string;
  gradient: string;
  borderColor: string;
  icon: React.ElementType;
  sealColor: string;
}> = {
  bronze: {
    label: 'Bronze',
    color: '#CD7F32',
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    borderColor: 'border-amber-600/30',
    icon: Medal,
    sealColor: '#CD7F32',
  },
  silver: {
    label: 'Silver',
    color: '#94A3B8',
    gradient: 'from-slate-400 via-slate-300 to-slate-500',
    borderColor: 'border-slate-400/30',
    icon: Star,
    sealColor: '#94A3B8',
  },
  gold: {
    label: 'Gold',
    color: '#EAB308',
    gradient: 'from-yellow-500 via-amber-400 to-yellow-600',
    borderColor: 'border-yellow-500/30',
    icon: Trophy,
    sealColor: '#EAB308',
  },
  platinum: {
    label: 'Platinum',
    color: '#8B5CF6',
    gradient: 'from-violet-500 via-purple-400 to-violet-600',
    borderColor: 'border-violet-500/30',
    icon: Gem,
    sealColor: '#8B5CF6',
  },
  diamond: {
    label: 'Diamond',
    color: '#06B6D4',
    gradient: 'from-cyan-400 via-sky-300 to-cyan-500',
    borderColor: 'border-cyan-400/30',
    icon: Diamond,
    sealColor: '#06B6D4',
  },
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
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
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
    const text = encodeURIComponent(
      `I received a ${levelConfig.label} Certificate of Appreciation from Achayapathra for ${data.title}! 🏆\n\n#Achayapathra #FoodRedistribution #CircularFoodEconomy #SocialImpact`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}&summary=${text}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏆 I received a ${levelConfig.label} Certificate from Achayapathra!\n\n${data.title}\nRecipient: ${data.recipientName}\n\nVerify: ${verificationUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`My Achayapathra ${levelConfig.label} Certificate - ${data.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm proud to share my ${levelConfig.label} Certificate of Appreciation from Achayapathra!\n\n${data.title}\nRecipient: ${data.recipientName}\nDate: ${data.issuedDate.toLocaleDateString('en-IN')}\n\nVerify: ${verificationUrl}\n\nBest regards,\n${data.recipientName}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const printCert = () => {
    window.print();
  };

  return (
    <div className="relative">
      {isPreview && (
        <style>{`
          @keyframes certReveal {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes goldShine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes sealPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes confettiFall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes qrFade {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes borderGlow {
            0%, 100% { box-shadow: 0 0 20px ${levelConfig.color}33; }
            50% { box-shadow: 0 0 40px ${levelConfig.color}55; }
          }
          .cert-animate { animation: certReveal 0.8s ease-out forwards; }
          .gold-shine {
            background: linear-gradient(90deg, transparent, ${levelConfig.color}33, transparent);
            background-size: 200% 100%;
            animation: goldShine 3s ease-in-out infinite;
          }
          .seal-animate { animation: sealPulse 2s ease-in-out infinite; }
          .qr-animate { animation: qrFade 0.6s ease-out 0.4s forwards; opacity: 0; }
          .border-glow { animation: borderGlow 3s ease-in-out infinite; }
          .confetti-piece {
            position: fixed;
            width: 10px;
            height: 10px;
            animation: confettiFall linear forwards;
          }
          @media print {
            .no-print { display: none !important; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        `}</style>
      )}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#FF6B35', '#16A34A', '#1E3A8A', '#EAB308', '#8B5CF6'][i % 5],
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 0.5}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}

      <div
        ref={certRef}
        className={`relative bg-white overflow-hidden ${isPreview ? 'cert-animate border-glow rounded-xl' : ''}`}
        style={{ aspectRatio: '297/210', minHeight: isPreview ? '500px' : undefined }}
      >
        {/* Decorative border */}
        <div className="absolute inset-0 border-2" style={{ borderColor: levelConfig.color + '40' }} />
        <div className="absolute inset-2 border" style={{ borderColor: levelConfig.color + '20' }} />

        {/* Corner ornaments */}
        {[
          { top: '12px', left: '12px', rotate: '0deg' },
          { top: '12px', right: '12px', rotate: '90deg' },
          { bottom: '12px', right: '12px', rotate: '180deg' },
          { bottom: '12px', left: '12px', rotate: '270deg' },
        ].map((pos, i) => (
          <div key={i} className="absolute w-12 h-12" style={{ ...pos, transform: `rotate(${pos.rotate})` }}>
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M0 0 L20 0 L20 4 L4 4 L4 20 L0 20 Z" fill={levelConfig.color} opacity="0.6" />
              <circle cx="4" cy="4" r="2" fill={levelConfig.color} opacity="0.8" />
            </svg>
          </div>
        ))}

        {/* Top decorative band */}
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, #16A34A, #F97316, #1E3A8A)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, #1E3A8A, #F97316, #16A34A)` }} />

        {/* Gold shine overlay */}
        {isPreview && <div className="absolute inset-0 gold-shine pointer-events-none" />}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full p-6 sm:p-8 md:p-10 text-center">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, #16A34A, #15803d)` }}>
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-bold tracking-wider" style={{ color: '#1E3A8A', fontFamily: 'Poppins, sans-serif' }}>
                  ACHAYAPATHRA
                </p>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground tracking-widest uppercase">
                  AI-Powered Circular Food Economy Platform
                </p>
              </div>
            </div>
            <div className="h-px w-48 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${levelConfig.color}, transparent)` }} />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase" style={{ color: levelConfig.color, fontFamily: 'Poppins, sans-serif' }}>
              Certificate of
            </p>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
              style={{
                fontFamily: 'Playfair Display, serif',
                background: `linear-gradient(135deg, #1E3A8A, ${levelConfig.color}, #1E3A8A)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              APPRECIATION
            </h1>
            <p className="text-[8px] sm:text-[10px] italic text-muted-foreground max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              "From Excess to Access – Every Meal Creates Value."
            </p>
          </div>

          {/* Body */}
          <div className="space-y-3 max-w-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
              This certificate is proudly presented to
            </p>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-black"
              style={{
                fontFamily: 'Playfair Display, serif',
                color: '#1E3A8A',
                borderBottom: `2px solid ${levelConfig.color}`,
                paddingBottom: '4px',
                display: 'inline-block',
              }}
            >
              {data.recipientName}
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              for their valuable contribution towards reducing food waste, supporting communities,
              and promoting sustainable food redistribution through Achayapathra.
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your dedication has contributed to creating positive social and environmental impact
              by helping surplus food reach those in need.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-xl">
            {[
              { label: 'Meals Served', value: data.impact.mealsServed || 0, icon: Heart, color: '#F97316' },
              { label: 'Food Rescued', value: `${data.impact.foodRescuedKg || 0}kg`, icon: Leaf, color: '#16A34A' },
              { label: 'People Helped', value: data.impact.peopleBenefited || 0, icon: Users, color: '#1E3A8A' },
              { label: 'CO₂ Saved', value: `${data.impact.carbonSavedKg || 0}kg`, icon: Zap, color: '#EAB308' },
            ].map((stat, i) => (
              <div key={i} className="p-2 sm:p-3 rounded-lg text-center" style={{ background: stat.color + '08', border: `1px solid ${stat.color}20` }}>
                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1" style={{ color: stat.color }} />
                <p className="text-sm sm:text-base font-black" style={{ color: stat.color, fontFamily: 'Poppins, sans-serif' }}>
                  {stat.value}
                </p>
                <p className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Details & Footer */}
          <div className="flex items-end justify-between w-full max-w-2xl gap-4">
            {/* Left - Digital Signature */}
            <div className="text-left space-y-1">
              <div className="w-20 sm:w-24 h-px bg-gray-400 mb-1" />
              <p className="text-[9px] sm:text-[10px] font-bold" style={{ color: '#1E3A8A' }}>Authorized Signatory</p>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground">Achayapathra Foundation</p>
              <p className="text-[7px] sm:text-[8px] text-muted-foreground">Digitally Generated Certificate</p>
            </div>

            {/* Center - Level Badge & QR */}
            <div className="flex flex-col items-center gap-2 qr-animate">
              <div
                className={`seal-animate w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-lg`}
                style={{ background: `linear-gradient(135deg, ${levelConfig.color}, ${levelConfig.color}cc)` }}
              >
                <LevelIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <p className="text-[8px] sm:text-[9px] font-bold tracking-wider uppercase" style={{ color: levelConfig.color }}>
                {levelConfig.label} Level
              </p>
              <div className="bg-white p-1.5 rounded-lg border" style={{ borderColor: levelConfig.color + '30' }}>
                <QRCodeSVG
                  value={verificationUrl}
                  size={52}
                  bgColor="#ffffff"
                  fgColor="#1E3A8A"
                  level="M"
                />
              </div>
              <p className="text-[7px] text-muted-foreground font-mono">{data.qrCode.slice(0, 16)}</p>
            </div>

            {/* Right - Platform Seal */}
            <div className="text-right space-y-1">
              <div className="w-20 sm:w-24 h-px bg-gray-400 mb-1 ml-auto" />
              <p className="text-[9px] sm:text-[10px] font-bold" style={{ color: '#16A34A' }}>Platform Seal</p>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground">Verified &amp; Authentic</p>
              <div className="flex items-center justify-end gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-[7px] sm:text-[8px] text-green-600 font-bold">Verified</span>
              </div>
              <p className="text-[7px] text-muted-foreground font-mono">Hash: {hash}</p>
            </div>
          </div>

          {/* Bottom info bar */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4 text-[7px] sm:text-[8px] text-muted-foreground">
            <span>Cert ID: {data.id.toUpperCase()}</span>
            <span>•</span>
            <span>Issued: {data.issuedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>•</span>
            <span>achayapathra.vercel.app</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="no-print flex flex-wrap gap-2 mt-4 justify-center">
          <button
            onClick={async () => {
              setShowConfetti(true);
              await exportPDF();
              setTimeout(() => setShowConfetti(false), 3000);
            }}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F97316, #ea580c)' }}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
          <button
            onClick={exportPNG}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #16A34A, #15803d)' }}
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <button
            onClick={printCert}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all hover:scale-105"
            style={{ borderColor: '#1E3A8A', color: '#1E3A8A' }}
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={shareLinkedIn}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: '#0A66C2' }}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: '#25D366' }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            onClick={shareEmail}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: '#1E3A8A' }}
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
        </div>
      )}
    </div>
  );
}

export function generateCertificateData(userId: string, userName: string, role: string, trigger: string, impact: CertificateData['impact']): CertificateData {
  const certId = `ACP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const qrCode = `CERT-${certId}-${userId.substring(0, 8)}`;

  const totalPoints = (impact.mealsServed || 0) * 10
    + (impact.foodRescuedKg || 0) * 5
    + (impact.volunteerHours || 0) * 15
    + (impact.carbonSavedKg || 0) * 20
    + (impact.impactPoints || 0);

  return {
    id: certId,
    recipientName: userName,
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
  };
}
