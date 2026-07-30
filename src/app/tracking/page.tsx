'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  ArrowRight,
  Camera,
  QrCode,
  Download,
  Loader2,
  ShieldCheck,
  Navigation,
  RefreshCw,
  Share2,
  Copy,
  ExternalLink,
  Leaf,
  Zap,
} from 'lucide-react';

import { mockDonations } from '@/lib/data';
import { Donation } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { PremiumCertificate, generateCertificateData } from '@/components/certificates/premium-certificate';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

// Timeline steps definition
const TIMELINE_STEPS = [
  { key: 'created', label: 'Created', icon: Package },
  { key: 'matched', label: 'Matched', icon: ShieldCheck },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'in_transit', label: 'In Transit', icon: Navigation },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  { key: 'verified', label: 'Verified', icon: ShieldCheck },
] as const;

// Map donation status to timeline progress
const STATUS_TO_STEP: Record<string, number> = {
  Available: 0,
  Claimed: 2,
  'Picked Up': 3,
  Delivered: 5,
  Expired: -1,
  Redirected: 6,
};

// GPS simulation data (simulated route points)
function generateGPSRoute(donation: Donation): Array<{ lat: number; lng: number; label: string }> {
  const startLat = donation.lat || 13.08;
  const startLng = donation.lng || 80.27;
  const endLat = startLat - 0.025 + Math.random() * 0.01;
  const endLng = startLng + 0.04 + Math.random() * 0.01;
  const midLat1 = startLat - 0.005;
  const midLng1 = startLng + 0.01;
  const midLat2 = startLat - 0.012;
  const midLng2 = startLng + 0.022;
  const midLat3 = startLat - 0.019;
  const midLng3 = startLng + 0.033;
  return [
    { lat: startLat, lng: startLng, label: 'Pickup Point' },
    { lat: midLat1, lng: midLng1, label: 'Main Road' },
    { lat: midLat1 - 0.002, lng: midLng1 + 0.005, label: 'Bus Stop Junction' },
    { lat: midLat2, lng: midLng2, label: 'Highway Entry' },
    { lat: midLat2 + 0.001, lng: midLng2 + 0.004, label: 'Toll Plaza' },
    { lat: midLat3, lng: midLng3, label: 'Near Destination Area' },
    { lat: endLat, lng: endLng, label: 'Destination' },
  ];
}

// Calculate ETA based on current step
function calculateETA(currentStep: number): { hours: number; minutes: number } {
  const remainingSteps = 6 - currentStep;
  const totalMinutes = remainingSteps * 25;
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

// Format timestamp
function formatTime(timestamp: any): string {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp?.toDate?.() ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gpsIndex, setGpsIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [photoVerified, setPhotoVerified] = useState(false);

  // Find donation by tracking ID
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a tracking ID');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setGpsIndex(0);
    setPhotoVerified(false);

    // Simulate search delay
    setTimeout(() => {
      const query = searchQuery.trim().toUpperCase();
      const found = mockDonations.find(
        (d) =>
          d.trackingId?.toUpperCase() === query ||
          d.id.toUpperCase() === query ||
          d.id.replace('don-', '').toUpperCase() === query
      );

      if (found) {
        setSelectedDonation(found);
        setSearchError('');
      } else {
        setSelectedDonation(null);
        setSearchError('No donation found with this tracking ID. Try: don-0001');
      }
      setIsSearching(false);
    }, 800);
  }, [searchQuery]);

  // Auto-load first demo donation
  useEffect(() => {
    if (mockDonations.length > 0 && !selectedDonation) {
      const demo = mockDonations.find((d) => d.status === 'Picked Up' || d.status === 'Delivered') || mockDonations[0];
      setSelectedDonation(demo);
      setSearchQuery(demo.trackingId || demo.id);
    }
  }, []);

  // GPS simulation - advance position periodically
  useEffect(() => {
    if (!selectedDonation) return;
    const interval = setInterval(() => {
      setGpsIndex((prev) => {
        const route = generateGPSRoute(selectedDonation);
        return prev < route.length - 1 ? prev + 1 : 0;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedDonation]);

  // Current step index
  const currentStep = useMemo(() => {
    if (!selectedDonation) return 0;
    return STATUS_TO_STEP[selectedDonation.status] ?? 0;
  }, [selectedDonation]);

  // ETA
  const eta = useMemo(() => {
    if (!selectedDonation) return { hours: 0, minutes: 0 };
    if (selectedDonation.status === 'Delivered') return { hours: 0, minutes: 0 };
    return calculateETA(currentStep);
  }, [currentStep, selectedDonation]);

  // GPS route
  const gpsRoute = useMemo(() => {
    if (!selectedDonation) return [];
    return generateGPSRoute(selectedDonation);
  }, [selectedDonation]);

  // Copy tracking ID
  const copyTrackingId = () => {
    if (selectedDonation?.trackingId) {
      navigator.clipboard.writeText(selectedDonation.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (!selectedDonation) return 0;
    if (selectedDonation.status === 'Delivered' || selectedDonation.status === 'Redirected') return 100;
    return Math.round(((currentStep + 1) / 7) * 100);
  }, [currentStep, selectedDonation]);

  return (
    <>
      <Header title="Donation Tracking" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8">
        {/* Search Section */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                  Track Your Donation
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                  <Input
                    placeholder="Enter Tracking ID (e.g., TRK-ABC123XYZ or don-0001)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12 border-orange-200 focus-visible:ring-orange-500 text-sm"
                  />
                </div>
                {searchError && (
                  <p className="text-xs text-red-500 font-medium">{searchError}</p>
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-200"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedDonation && (
          <>
            {/* Tracking Header */}
            <Card id="tracking-certificate-area" className="overflow-hidden border-orange-200">
              <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 md:p-6 text-white">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-bold">{selectedDonation.foodName}</h2>
                    <div className="flex items-center gap-2 text-orange-100 text-sm">
                      <Package className="h-4 w-4" />
                      {selectedDonation.quantity}
                      <span className="mx-1">•</span>
                      {selectedDonation.foodType}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                      {selectedDonation.status}
                    </Badge>
                    <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-xs font-mono">
                      <QrCode className="h-3.5 w-3.5" />
                      {selectedDonation.trackingId || selectedDonation.id}
                      <button
                        onClick={copyTrackingId}
                        className="ml-1 hover:bg-white/20 rounded p-0.5 transition"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-4 md:px-6 py-3 bg-orange-50 border-t border-orange-100">
                <div className="flex items-center justify-between text-xs text-orange-700 mb-2 font-medium">
                  <span>Delivery Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress
                  value={progressPercent}
                  className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-400"
                />
              </div>
            </Card>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
              {/* Left Column - Timeline & GPS */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Visual Timeline */}
                <Card className="border-orange-200">
                  <CardHeader className="p-4 md:p-6 pb-2">
                    <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-600">
                      Delivery Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-6 md:px-6">
                    {/* Desktop Timeline (horizontal) */}
                    <div className="hidden md:block">
                      <div className="relative flex justify-between items-start max-w-3xl mx-auto">
                        {/* Background line */}
                        <div className="absolute left-[calc(10%)] right-[calc(10%)] top-[20px] h-1 bg-orange-100 rounded-full z-0" />
                        {/* Active line */}
                        <div
                          className="absolute left-[calc(10%)] top-[20px] h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full z-0 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (currentStep / (TIMELINE_STEPS.length - 1)) * 80)}%`,
                          }}
                        />

                        {TIMELINE_STEPS.map((step, idx) => {
                          const isActive = idx <= currentStep;
                          const isCurrent = idx === currentStep;
                          const StepIcon = step.icon;
                          return (
                            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 w-[14%]">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isActive
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                                    : 'bg-white border-orange-200 text-orange-300'
                                } ${isCurrent ? 'ring-4 ring-orange-200 scale-110' : ''}`}
                              >
                                {isActive && idx < currentStep ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <StepIcon className="h-5 w-5" />
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-bold text-center leading-tight ${
                                  isActive ? 'text-orange-700' : 'text-orange-300'
                                }`}
                              >
                                {step.label}
                              </span>
                              {isCurrent && selectedDonation.delivery_timeline?.[idx] && (
                                <span className="text-[9px] text-orange-500 font-medium">
                                  {formatTime(selectedDonation.delivery_timeline[idx].timestamp)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile Timeline (vertical) */}
                    <div className="md:hidden space-y-0">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isActive = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        const StepIcon = step.icon;
                        return (
                          <div key={step.key} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isActive
                                    ? 'bg-orange-500 border-orange-500 text-white'
                                    : 'bg-white border-orange-200 text-orange-300'
                                } ${isCurrent ? 'ring-2 ring-orange-200' : ''}`}
                              >
                                {isActive && idx < currentStep ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <StepIcon className="h-4 w-4" />
                                )}
                              </div>
                              {idx < TIMELINE_STEPS.length - 1 && (
                                <div
                                  className={`w-0.5 h-8 ${
                                    idx < currentStep ? 'bg-orange-500' : 'bg-orange-100'
                                  }`}
                                />
                              )}
                            </div>
                            <div className="pb-6">
                              <p
                                className={`text-xs font-bold ${
                                  isActive ? 'text-orange-700' : 'text-orange-300'
                                }`}
                              >
                                {step.label}
                              </p>
                              {isCurrent && selectedDonation.delivery_timeline?.[idx] && (
                                <p className="text-[10px] text-orange-500">
                                  {formatTime(selectedDonation.delivery_timeline[idx].timestamp)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Live GPS Simulation */}
                <Card className="border-orange-200">
                  <CardHeader className="p-4 md:p-6 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <CardTitle className="text-sm font-bold text-orange-700">
                          Live Location
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          LIVE
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setGpsIndex((prev) => (prev < gpsRoute.length - 1 ? prev + 1 : 0))}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                    {/* Map placeholder */}
                    <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-orange-50 via-orange-100 to-green-50 rounded-xl overflow-hidden border border-orange-200">
                      {/* Simulated map grid */}
                      <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%">
                          <defs>
                            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ea580c" strokeWidth="0.5" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>

                      {/* Route line */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                        <defs>
                          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ea580c" stopOpacity="1" />
                          </linearGradient>
                        </defs>
                        {/* Background route */}
                        <path
                          d={`M 40,170 C 80,165 90,150 120,140 C 150,130 160,115 190,105 C 220,95 240,85 260,75 C 280,65 300,55 340,40 C 355,35 365,28 380,20`}
                          fill="none" stroke="#fed7aa" strokeWidth="4" strokeLinecap="round"
                        />
                        {/* Active route */}
                        <path
                          d={`M 40,170 C 80,165 90,150 120,140 C 150,130 160,115 190,105 C 220,95 240,85 260,75 C 280,65 300,55 340,40 C 355,35 365,28 380,20`}
                          fill="none" stroke="url(#routeGrad)" strokeWidth="3" strokeLinecap="round"
                          strokeDasharray="2000" strokeDashoffset={2000 - (gpsIndex / (gpsRoute.length - 1)) * 2000}
                          style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                      </svg>

                      {/* Location markers */}
                      {gpsRoute.map((point, i) => {
                        const t = i / (gpsRoute.length - 1);
                        const cx = 40 + t * 340;
                        const curveY = 170 - t * 150 + Math.sin(t * Math.PI) * -20;
                        const markerLeft = `${(cx / 400) * 100}%`;
                        const markerTop = `${(curveY / 200) * 100}%`;
                        return (
                          <div
                            key={i}
                            className="absolute"
                            style={{ left: markerLeft, top: markerTop, transform: 'translate(-50%, -50%)' }}
                          >
                            {i === gpsIndex ? (
                              <div className="relative">
                                <div className="w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                                  <Navigation className="h-2.5 w-2.5 text-white" />
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  {point.label}
                                </div>
                              </div>
                            ) : i < gpsIndex ? (
                              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow" />
                            ) : (
                              <div className="w-2.5 h-2.5 bg-orange-200 rounded-full border-2 border-white" />
                            )}
                          </div>
                        );
                      })}

                      {/* Distance / Speed info overlay */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow border border-orange-100">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-orange-700">
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {(gpsIndex * 1.8).toFixed(1)} km
                          </span>
                          <span className="text-orange-300">|</span>
                          <span>{(20 + Math.random() * 15).toFixed(0)} km/h</span>
                        </div>
                      </div>
                    </div>

                    {/* Current Location Card */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-orange-700">Current Location</p>
                            <p className="text-[11px] text-orange-600 font-medium">
                              {gpsRoute[gpsIndex]?.label || 'Calculating...'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-orange-500 font-bold">COORDINATES</p>
                          <p className="text-[10px] text-orange-600 font-mono">
                            {(gpsRoute[gpsIndex]?.lat || 0).toFixed(4)}°N, {(gpsRoute[gpsIndex]?.lng || 0).toFixed(4)}°E
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Verification Section */}
                <Card className="border-orange-200">
                  <CardHeader className="p-4 md:p-6 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Camera className="h-4 w-4 text-orange-600" />
                      </div>
                      <CardTitle className="text-sm font-bold text-orange-700">
                        Photo Verification
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Pickup photo */}
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-orange-200 bg-orange-50">
                        <img
                          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop"
                          alt="Donation pickup photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-[9px] text-white font-bold">PICKUP</p>
                        </div>
                      </div>
                      {/* Delivery photo */}
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-orange-200 bg-orange-50">
                        {selectedDonation.status === 'Delivered' || photoVerified ? (
                          <>
                            <img
                              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop"
                              alt="Delivery confirmation"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <p className="text-[9px] text-white font-bold">DELIVERY</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-orange-400">
                            <Camera className="h-8 w-8 mb-1" />
                            <p className="text-[9px] font-bold">Pending</p>
                          </div>
                        )}
                      </div>
                      {/* Verification badge */}
                      <div className="col-span-2 md:col-span-1 flex items-center justify-center bg-orange-50 rounded-xl border-2 border-orange-200 p-4">
                        <div className="text-center space-y-2">
                          {selectedDonation.status === 'Delivered' || photoVerified ? (
                            <>
                              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                              </div>
                              <p className="text-xs font-bold text-green-700">Verified</p>
                              <p className="text-[10px] text-green-600">Photos match</p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                                <Camera className="h-6 w-6 text-orange-500" />
                              </div>
                              <p className="text-xs font-bold text-orange-700">Awaiting Verification</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] border-orange-300 text-orange-600 hover:bg-orange-100"
                                onClick={() => setPhotoVerified(true)}
                              >
                                Simulate Verify
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Details & QR */}
              <div className="lg:col-span-1 space-y-4 md:space-y-6">
                {/* ETA Countdown */}
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-center space-y-3">
                      <Clock className="h-8 w-8 mx-auto text-orange-500" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                          {selectedDonation.status === 'Delivered' ? 'Delivered' : 'Estimated Time of Arrival'}
                        </p>
                      </div>
                      {selectedDonation.status === 'Delivered' ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-lg font-bold text-green-600">Delivered!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <div className="bg-orange-500 text-white rounded-xl px-4 py-2 min-w-[60px]">
                            <p className="text-2xl font-bold leading-none">{eta.hours}</p>
                            <p className="text-[9px] font-bold uppercase">Hours</p>
                          </div>
                          <span className="text-2xl font-bold text-orange-400">:</span>
                          <div className="bg-orange-500 text-white rounded-xl px-4 py-2 min-w-[60px]">
                            <p className="text-2xl font-bold leading-none">{eta.minutes}</p>
                            <p className="text-[9px] font-bold uppercase">Min</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Donation Details */}
                <Card className="border-orange-200">
                  <CardHeader className="p-4 md:p-6 pb-3">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                      Donation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-orange-100">
                      <span className="text-[10px] font-bold uppercase text-orange-500">Food Type</span>
                      <span className="text-xs font-semibold text-orange-700">{selectedDonation.foodType}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-orange-100">
                      <span className="text-[10px] font-bold uppercase text-orange-500">Quantity</span>
                      <span className="text-xs font-semibold text-orange-700">{selectedDonation.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-orange-100">
                      <span className="text-[10px] font-bold uppercase text-orange-500">Carbon Saved</span>
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                        <Leaf className="h-3 w-3" />
                        {selectedDonation.carbon_saved_kg?.toFixed(1)} kg
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-orange-100">
                      <span className="text-[10px] font-bold uppercase text-orange-500">AI Score</span>
                      <span className="text-xs font-semibold text-orange-700">
                        <Zap className="h-3 w-3 inline mr-1 text-orange-500" />
                        {selectedDonation.ai_matching_score}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[10px] font-bold uppercase text-orange-500">Donor</span>
                      <span className="text-xs font-semibold text-orange-700">{selectedDonation.donor.name}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* QR Code Section */}
                <Card className="border-orange-200">
                  <CardHeader className="p-4 md:p-6 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <QrCode className="h-4 w-4 text-orange-600" />
                      </div>
                      <CardTitle className="text-sm font-bold text-orange-700">QR Verification</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="text-center space-y-3">
                      <div className="w-40 h-40 mx-auto bg-white border-2 border-orange-200 rounded-xl p-3 shadow-sm flex items-center justify-center">
                        <QRCodeSVG
                          value={`https://achayapathra.vercel.app/tracking?id=${selectedDonation.trackingId || selectedDonation.id}`}
                          size={120}
                          bgColor="#ffffff"
                          fgColor="#ea580c"
                          level="M"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-orange-600 tracking-wider">
                          Scan to Verify
                        </p>
                        <p className="text-[10px] text-orange-500 font-mono break-all">
                          {selectedDonation.trackingId || selectedDonation.id}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-200"
                    onClick={() => {
                      if (selectedDonation.lat && selectedDonation.lng) {
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${selectedDonation.lat},${selectedDonation.lng}`,
                          '_blank'
                        );
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-orange-300 text-orange-600 hover:bg-orange-50 font-bold"
                    onClick={async () => {
                      const certData = generateCertificateData(
                        selectedDonation.donor.id || 'donor-001',
                        selectedDonation.donor.name,
                        'donor',
                        `Food Donation: ${selectedDonation.foodType}`,
                        {
                          mealsServed: Math.floor((selectedDonation.quantity_kg || 10) / 0.5),
                          foodRescuedKg: selectedDonation.quantity_kg || 10,
                          peopleBenefited: Math.floor((selectedDonation.quantity_kg || 10) / 0.5),
                          carbonSavedKg: selectedDonation.carbon_saved_kg || 0,
                        },
                        {
                          donationId: selectedDonation.id,
                          foodName: selectedDonation.foodType,
                          quantity: selectedDonation.quantity,
                          recipientId: selectedDonation.ngoId,
                        }
                      );
                      const el = document.getElementById('tracking-certificate-area');
                      if (!el) return;
                      try {
                        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('l', 'mm', 'a4');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`Achayapathra-Certificate-${selectedDonation.trackingId || selectedDonation.id}.pdf`);
                      } catch {
                        alert('Certificate download requires the page to be fully loaded. Please try again.');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-10 text-orange-500 hover:bg-orange-50 font-medium text-xs"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Tracking Link
                  </Button>
                </div>

                {/* Tags */}
                {selectedDonation.tags && selectedDonation.tags.length > 0 && (
                  <Card className="border-orange-200">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-bold uppercase text-orange-600 mb-2 tracking-wider">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDonation.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-semibold"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {/* No results state */}
        {!selectedDonation && !isSearching && (
          <Card className="border-orange-200">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-orange-700 mb-2">Track Your Donation</h3>
              <p className="text-sm text-orange-500 mb-4 max-w-md mx-auto">
                Enter a tracking ID above to see the live status, GPS location, and delivery timeline of your food donation.
              </p>
              <p className="text-xs text-orange-400">
                Try demo ID: <span className="font-mono font-bold">don-0001</span>
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
