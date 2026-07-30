'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Map,
  MapPin,
  Users,
  Truck,
  Factory,
  Recycle,
  Layers,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Heart,
  Clock,
  AlertTriangle,
  Leaf,
  Zap,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  mockDonations,
  mockNGOs,
  mockHungerZones,
  mockBiogasPlants,
  mockFertilizerCentres,
  mockCities,
} from '@/lib/data';

const TN_BOUNDS = {
  minLat: 7.8,
  maxLat: 13.8,
  minLng: 76.0,
  maxLng: 81.0,
};

const svgWidth = 520;
const svgHeight = 680;

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x =
    ((lng - TN_BOUNDS.minLng) / (TN_BOUNDS.maxLng - TN_BOUNDS.minLng)) *
      svgWidth *
    0.85 +
    svgWidth * 0.075;
  const y =
    svgHeight -
    ((lat - TN_BOUNDS.minLat) / (TN_BOUNDS.maxLat - TN_BOUNDS.minLat)) *
      svgHeight *
      0.9 -
    svgHeight * 0.02;
  return { x, y };
}

const TN_OUTLINE_PATH = `M 310 15 L 345 20 L 370 35 L 395 28 L 415 40 L 430 55
  L 445 48 L 460 60 L 470 80 L 475 100 L 468 120 L 478 135 L 490 130
  L 500 145 L 492 160 L 480 165 L 488 185 L 478 200 L 465 210 L 470 230
  L 460 245 L 450 255 L 455 270 L 445 285 L 435 295 L 430 315 L 420 330
  L 425 350 L 415 365 L 405 380 L 395 390 L 385 410 L 390 430 L 380 445
  L 370 460 L 360 475 L 350 485 L 340 500 L 330 510 L 315 520 L 300 535
  L 285 545 L 270 555 L 255 565 L 240 575 L 225 580 L 210 590 L 195 595
  L 180 600 L 165 608 L 150 612 L 135 618 L 125 625 L 115 615 L 100 610
  L 90 600 L 80 590 L 70 575 L 60 560 L 55 545 L 45 530 L 40 515
  L 35 500 L 25 480 L 20 460 L 18 440 L 15 420 L 12 400 L 10 380
  L 8 360 L 6 340 L 5 320 L 8 300 L 12 280 L 10 260 L 15 240
  L 20 220 L 28 200 L 35 180 L 45 165 L 55 150 L 68 135 L 80 120
  L 95 108 L 110 95 L 125 85 L 140 78 L 160 70 L 180 60 L 200 52
  L 220 45 L 240 40 L 260 35 L 280 28 L 295 20 Z`;

const ZONE_PATHS: { path: string; city: string }[] = [
  { path: 'M 415 80 L 455 80 L 455 130 L 415 130 Z', city: 'Chennai' },
  { path: 'M 160 120 L 210 120 L 210 185 L 160 185 Z', city: 'Coimbatore' },
  { path: 'M 230 310 L 280 310 L 280 375 L 230 375 Z', city: 'Madurai' },
  { path: 'M 300 180 L 350 180 L 350 245 L 300 245 Z', city: 'Tiruchirappalli' },
  { path: 'M 270 200 L 310 200 L 310 260 L 270 260 Z', city: 'Salem' },
  { path: 'M 170 390 L 215 390 L 215 450 L 170 450 Z', city: 'Tirunelveli' },
  { path: 'M 205 175 L 245 175 L 245 230 L 205 230 Z', city: 'Erode' },
  { path: 'M 370 170 L 410 170 L 410 225 L 370 225 Z', city: 'Vellore' },
  { path: 'M 240 430 L 285 430 L 285 490 L 240 490 Z', city: 'Thoothukudi' },
  { path: 'M 215 285 L 260 285 L 260 340 L 215 340 Z', city: 'Dindigul' },
  { path: 'M 350 310 L 395 310 L 395 365 L 350 365 Z', city: 'Thanjavur' },
  { path: 'M 305 410 L 345 410 L 345 465 L 305 465 Z', city: 'Ramanathapuram' },
  { path: 'M 380 120 L 415 120 L 415 170 L 380 170 Z', city: 'Krishnagiri' },
  { path: 'M 290 145 L 325 145 L 325 195 L 290 195 Z', city: 'Namakkal' },
  { path: 'M 275 225 L 310 225 L 310 275 L 275 275 Z', city: 'Karur' },
  { path: 'M 130 95 L 170 95 L 170 145 L 130 145 Z', city: 'Nilgiris' },
  { path: 'M 395 140 L 435 140 L 435 190 L 395 190 Z', city: 'Kancheepuram' },
  { path: 'M 175 365 L 215 365 L 215 415 L 175 415 Z', city: 'Virudhunagar' },
  { path: 'M 195 280 L 230 280 L 230 330 L 195 330 Z', city: 'Theni' },
  { path: 'M 345 145 L 380 145 L 380 195 L 345 195 Z', city: 'Dharmapuri' },
  { path: 'M 320 270 L 355 270 L 355 320 L 320 320 Z', city: 'Perambalur' },
  { path: 'M 330 300 L 365 300 L 365 350 L 330 350 Z', city: 'Ariyalur' },
  { path: 'M 360 340 L 400 340 L 400 395 L 360 395 Z', city: 'Cuddalore' },
  { path: 'M 370 370 L 410 370 L 410 420 L 370 420 Z', city: 'Nagapattinam' },
  { path: 'M 410 175 L 450 175 L 450 230 L 410 230 Z', city: 'Tiruvallur' },
  { path: 'M 195 480 L 235 480 L 235 535 L 195 535 Z', city: 'Kanyakumari' },
  { path: 'M 200 340 L 240 340 L 240 390 L 200 390 Z', city: 'Sivaganga' },
  { path: 'M 340 225 L 380 225 L 380 280 L 340 280 Z', city: 'Tiruvannamalai' },
  { path: 'M 310 380 L 355 380 L 355 435 L 310 435 Z', city: 'Villupuram' },
  { path: 'M 260 345 L 300 345 L 300 400 L 260 400 Z', city: 'Pudukkottai' },
];

function getRiskColor(score: number): string {
  if (score >= 80) return '#DC2626';
  if (score >= 60) return '#F97316';
  if (score >= 40) return '#EAB308';
  return '#22C55E';
}

function getRiskLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function LiveMapsPage() {
  const [showDonations, setShowDonations] = useState(true);
  const [showNGOs, setShowNGOs] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showHungerZones, setShowHungerZones] = useState(true);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedMarker, setSelectedMarker] = useState<{
    type: string;
    data: any;
  } | null>(null);
  const [liveTime, setLiveTime] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const recentDonations = useMemo(() => {
    return [...mockDonations]
      .filter((d) => d.status === 'Available' || d.status === 'Claimed')
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      })
      .slice(0, 15);
  }, []);

  const activeDonations = useMemo(
    () =>
      mockDonations.filter(
        (d) => d.status === 'Available' || d.status === 'Claimed' || d.status === 'Picked Up'
      ),
    []
  );

  const volunteers = useMemo(() => {
    return mockDonations
      .filter((d) => d.volunteerId && (d.status === 'Picked Up' || d.status === 'Delivered'))
      .map((d) => ({
        id: d.volunteerId!,
        lat: d.lat ? d.lat + (Math.random() - 0.5) * 0.1 : 10.5 + Math.random() * 2,
        lng: d.lng ? d.lng + (Math.random() - 0.5) * 0.1 : 77.5 + Math.random() * 2,
        name: `Volunteer`,
        status: d.status === 'Picked Up' ? 'en_route' : 'delivered',
      }))
      .slice(0, 40);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    },
    [isDragging, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Live Maps" />

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Main Map Area */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-orange-500/10 rounded-lg px-3 py-1.5">
                  <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                  <span className="text-sm font-semibold text-orange-600">
                    Live Tracking
                  </span>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {mockCities.length} zones
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Heart className="h-3 w-3" />
                  {activeDonations.length} active
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
                  className="h-8 w-8"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
                  className="h-8 w-8"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetView}
                  className="h-8 w-8"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground ml-1">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>

            {/* Map Container */}
            <Card className="overflow-hidden border-orange-200 dark:border-orange-900/50">
              <CardContent className="p-0">
                <div
                  className="relative bg-gradient-to-br from-orange-50 via-amber-50/50 to-white dark:from-orange-950/20 dark:via-amber-950/10 dark:to-background select-none"
                  style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-auto"
                    style={{ maxHeight: '75vh' }}
                  >
                    <defs>
                      <radialGradient id="mapGlow" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
                      </radialGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
                      </filter>
                      <linearGradient id="tnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF7ED" />
                        <stop offset="50%" stopColor="#FFFBEB" />
                        <stop offset="100%" stopColor="#FFF7ED" />
                      </linearGradient>
                      <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#FED7AA" strokeWidth="0.3" opacity="0.5" />
                      </pattern>

                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1;1.02;1"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </defs>

                    <g
                      transform={`translate(${pan.x / 2}, ${pan.y / 2}) scale(${zoom})`}
                      style={{ transformOrigin: `${svgWidth / 2}px ${svgHeight / 2}px` }}
                    >
                      <rect width={svgWidth} height={svgHeight} fill="url(#gridPattern)" />

                      <rect width={svgWidth} height={svgHeight} fill="url(#mapGlow)" />

                      {/* Tamil Nadu Outline */}
                      <path
                        d={TN_OUTLINE_PATH}
                        fill="url(#tnGradient)"
                        stroke="#FB923C"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        filter="url(#shadow)"
                      />

                      {/* Zone hover regions */}
                      {showHungerZones &&
                        ZONE_PATHS.map((zone) => {
                          const hungerZone = mockHungerZones.find(
                            (hz) => hz.zone_name === `${zone.city} Central`
                          );
                          const riskScore = hungerZone?.hunger_risk_score || 50;
                          const isHovered = hoveredZone === zone.city;
                          return (
                            <g key={zone.city}>
                              <path
                                d={zone.path}
                                fill={getRiskColor(riskScore)}
                                fillOpacity={isHovered ? 0.35 : 0.12}
                                stroke={getRiskColor(riskScore)}
                                strokeWidth={isHovered ? 2 : 0.8}
                                strokeOpacity={isHovered ? 0.8 : 0.3}
                                style={{
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={() => setHoveredZone(zone.city)}
                                onMouseLeave={() => setHoveredZone(null)}
                              />
                              {isHovered && hungerZone && (
                                <g>
                                  <rect
                                    x={parseFloat(zone.path.split(' ')[1]) - 55}
                                    y={parseFloat(zone.path.split(' ')[2]) - 58}
                                    width="110"
                                    height="50"
                                    rx="6"
                                    fill="white"
                                    fillOpacity="0.95"
                                    stroke={getRiskColor(riskScore)}
                                    strokeWidth="1.5"
                                    filter="url(#shadow)"
                                  />
                                  <text
                                    x={parseFloat(zone.path.split(' ')[1])}
                                    y={parseFloat(zone.path.split(' ')[2]) - 40}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight="bold"
                                    fill="#1F2937"
                                  >
                                    {zone.city}
                                  </text>
                                  <text
                                    x={parseFloat(zone.path.split(' ')[1])}
                                    y={parseFloat(zone.path.split(' ')[2]) - 26}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="#6B7280"
                                  >
                                    Risk: {getRiskLabel(riskScore)} ({riskScore})
                                  </text>
                                  <text
                                    x={parseFloat(zone.path.split(' ')[1])}
                                    y={parseFloat(zone.path.split(' ')[2]) - 14}
                                    textAnchor="middle"
                                    fontSize="8"
                                    fill="#9CA3AF"
                                  >
                                    Pop: {((hungerZone.population || 0) / 1000).toFixed(0)}K
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        })}

                      {/* Biogas Plants */}
                      {showInfrastructure &&
                        mockBiogasPlants.map((plant) => {
                          const pos = latLngToSvg(plant.lat || 0, plant.lng || 0);
                          return (
                            <g
                              key={plant.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setSelectedMarker({ type: 'biogas', data: plant })
                              }
                            >
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="8"
                                fill="#16A34A"
                                fillOpacity="0.2"
                                stroke="#16A34A"
                                strokeWidth="1"
                              />
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="5"
                                fill="#16A34A"
                                stroke="white"
                                strokeWidth="1.5"
                              />
                              <text
                                x={pos.x}
                                y={pos.y + 1}
                                textAnchor="middle"
                                fontSize="6"
                                fill="white"
                                fontWeight="bold"
                              >
                                B
                              </text>
                              {plant.operational && (
                                <circle
                                  cx={pos.x + 5}
                                  cy={pos.y - 5}
                                  r="2.5"
                                  fill="#22C55E"
                                  stroke="white"
                                  strokeWidth="1"
                                >
                                  <animate
                                    attributeName="opacity"
                                    values="1;0.4;1"
                                    dur="2s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              )}
                            </g>
                          );
                        })}

                      {/* Fertilizer Centres */}
                      {showInfrastructure &&
                        mockFertilizerCentres.map((centre) => {
                          const pos = latLngToSvg(centre.lat || 0, centre.lng || 0);
                          return (
                            <g
                              key={centre.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setSelectedMarker({
                                  type: 'fertilizer',
                                  data: centre,
                                })
                              }
                            >
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="8"
                                fill="#7C3AED"
                                fillOpacity="0.2"
                                stroke="#7C3AED"
                                strokeWidth="1"
                              />
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="5"
                                fill="#7C3AED"
                                stroke="white"
                                strokeWidth="1.5"
                              />
                              <text
                                x={pos.x}
                                y={pos.y + 1}
                                textAnchor="middle"
                                fontSize="6"
                                fill="white"
                                fontWeight="bold"
                              >
                                F
                              </text>
                            </g>
                          );
                        })}

                      {/* NGOs */}
                      {showNGOs &&
                        mockNGOs.slice(0, 50).map((ngo) => {
                          const pos = latLngToSvg(ngo.lat, ngo.lng);
                          return (
                            <g
                              key={ngo.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setSelectedMarker({ type: 'ngo', data: ngo })
                              }
                            >
                              <polygon
                                points={`${pos.x},${pos.y - 7} ${pos.x - 5},${pos.y + 3} ${pos.x + 5},${pos.y + 3}`}
                                fill="#2563EB"
                                fillOpacity="0.85"
                                stroke="white"
                                strokeWidth="1"
                                filter="url(#glow)"
                              />
                              {ngo.verified && (
                                <circle
                                  cx={pos.x + 5}
                                  cy={pos.y - 5}
                                  r="3"
                                  fill="#16A34A"
                                  stroke="white"
                                  strokeWidth="1"
                                />
                              )}
                            </g>
                          );
                        })}

                      {/* Volunteers */}
                      {showVolunteers &&
                        volunteers.map((vol) => {
                          const pos = latLngToSvg(vol.lat, vol.lng);
                          return (
                            <g key={vol.id}>
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="4"
                                fill={vol.status === 'en_route' ? '#F59E0B' : '#10B981'}
                                stroke="white"
                                strokeWidth="1.2"
                              />
                              {vol.status === 'en_route' && (
                                <circle
                                  cx={pos.x}
                                  cy={pos.y}
                                  r="4"
                                  fill="none"
                                  stroke="#F59E0B"
                                  strokeWidth="1"
                                >
                                  <animate
                                    attributeName="r"
                                    values="4;10;4"
                                    dur="2s"
                                    repeatCount="indefinite"
                                  />
                                  <animate
                                    attributeName="opacity"
                                    values="0.8;0;0.8"
                                    dur="2s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              )}
                            </g>
                          );
                        })}

                      {/* Donations */}
                      {showDonations &&
                        activeDonations.map((donation) => {
                          const pos = latLngToSvg(
                            donation.lat || 10.5 + Math.random() * 2,
                            donation.lng || 77.5 + Math.random() * 2
                          );
                          const statusColor =
                            donation.status === 'Available'
                              ? '#FF6B35'
                              : donation.status === 'Claimed'
                              ? '#3B82F6'
                              : '#F59E0B';
                          const isActive =
                            donation.status === 'Available' ||
                            donation.status === 'Claimed';
                          return (
                            <g
                              key={donation.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setSelectedMarker({
                                  type: 'donation',
                                  data: donation,
                                })
                              }
                            >
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="6"
                                fill={statusColor}
                                fillOpacity="0.3"
                                stroke={statusColor}
                                strokeWidth="0.8"
                              />
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="3.5"
                                fill={statusColor}
                                stroke="white"
                                strokeWidth="1.2"
                              />
                              {isActive && (
                                <circle
                                  cx={pos.x}
                                  cy={pos.y}
                                  r="3.5"
                                  fill="none"
                                  stroke={statusColor}
                                  strokeWidth="1"
                                >
                                  <animate
                                    attributeName="r"
                                    values="3.5;12;3.5"
                                    dur="3s"
                                    repeatCount="indefinite"
                                  />
                                  <animate
                                    attributeName="opacity"
                                    values="0.7;0;0.7"
                                    dur="3s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              )}
                            </g>
                          );
                        })}

                      {/* City Labels */}
                      {mockCities.slice(0, 8).map((city) => {
                        const pos = latLngToSvg(city.lat, city.lng);
                        return (
                          <g key={city.name}>
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r="3"
                              fill="#FB923C"
                              stroke="white"
                              strokeWidth="1.5"
                            />
                            <text
                              x={pos.x + 7}
                              y={pos.y + 3}
                              fontSize="8"
                              fontWeight="600"
                              fill="#7C2D12"
                              style={{ pointerEvents: 'none' }}
                            >
                              {city.name}
                            </text>
                          </g>
                        );
                      })}
                    </g>

                    {/* State Label */}
                    <text
                      x={svgWidth / 2}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#C2410C"
                      opacity="0.6"
                    >
                      TAMIL NADU
                    </text>
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-orange-200 dark:border-orange-900/50">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B35] ring-2 ring-[#FF6B35]/20 animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                      Available Donation
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] ring-2 ring-[#3B82F6]/20" />
                    <span className="text-xs text-muted-foreground">
                      Claimed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B] ring-2 ring-[#F59E0B]/20" />
                    <span className="text-xs text-muted-foreground">
                      In Transit
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-[#10B981]/20" />
                    <span className="text-xs text-muted-foreground">
                      Delivered
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12">
                      <polygon
                        points="6,1 1,10 11,10"
                        fill="#2563EB"
                        stroke="white"
                        strokeWidth="1"
                      />
                    </svg>
                    <span className="text-xs text-muted-foreground">NGO</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#16A34A] border border-white" />
                    <span className="text-xs text-muted-foreground">
                      Biogas Plant
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#7C3AED] border border-white" />
                    <span className="text-xs text-muted-foreground">
                      Fertilizer Centre
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white" />
                    <span className="text-xs text-muted-foreground">
                      Volunteer (Active)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#DC2626]/30 border border-[#DC2626]/50" />
                    <span className="text-xs text-muted-foreground">
                      High Risk Zone
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Filter Controls */}
            <Card className="border-orange-200 dark:border-orange-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4 text-orange-500" />
                  Layer Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-orange-500" />
                    <Label className="text-sm">Donations</Label>
                  </div>
                  <Switch
                    checked={showDonations}
                    onCheckedChange={setShowDonations}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <Label className="text-sm">NGOs</Label>
                  </div>
                  <Switch checked={showNGOs} onCheckedChange={setShowNGOs} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-500" />
                    <Label className="text-sm">Volunteers</Label>
                  </div>
                  <Switch
                    checked={showVolunteers}
                    onCheckedChange={setShowVolunteers}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-purple-500" />
                    <Label className="text-sm">Infrastructure</Label>
                  </div>
                  <Switch
                    checked={showInfrastructure}
                    onCheckedChange={setShowInfrastructure}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-red-500" />
                    <Label className="text-sm">Hunger Zones</Label>
                  </div>
                  <Switch
                    checked={showHungerZones}
                    onCheckedChange={setShowHungerZones}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-orange-200 dark:border-orange-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-orange-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-orange-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {activeDonations.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Active Donations
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {mockNGOs.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Registered NGOs
                    </div>
                  </div>
                  <div className="rounded-lg bg-amber-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {volunteers.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Active Volunteers
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {mockBiogasPlants.length + mockFertilizerCentres.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Infrastructure
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Marker Detail */}
            {selectedMarker && (
              <Card className="border-orange-300 dark:border-orange-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {selectedMarker.type === 'donation' && 'Donation Details'}
                      {selectedMarker.type === 'ngo' && 'NGO Details'}
                      {selectedMarker.type === 'biogas' && 'Biogas Plant'}
                      {selectedMarker.type === 'fertilizer' &&
                        'Fertilizer Centre'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMarker(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {selectedMarker.type === 'donation' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Food</span>
                        <span className="font-medium">
                          {selectedMarker.data.foodName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant={
                            selectedMarker.data.status === 'Available'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            selectedMarker.data.status === 'Available'
                              ? 'bg-orange-500'
                              : ''
                          }
                        >
                          {selectedMarker.data.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">
                          {selectedMarker.data.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Donor</span>
                        <span className="font-medium">
                          {selectedMarker.data.donor?.name}
                        </span>
                      </div>
                    </>
                  )}
                  {selectedMarker.type === 'ngo' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">
                          {selectedMarker.data.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">
                          {selectedMarker.data.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating</span>
                        <span className="font-medium">
                          ⭐ {selectedMarker.data.rating?.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Served</span>
                        <span className="font-medium">
                          {selectedMarker.data.totalServed?.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                  {selectedMarker.type === 'biogas' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">
                          {selectedMarker.data.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">District</span>
                        <span className="font-medium">
                          {selectedMarker.data.district}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">
                          {selectedMarker.data.capacity?.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Energy</span>
                        <span className="font-medium text-green-600">
                          <Zap className="inline h-3 w-3" />{' '}
                          {selectedMarker.data.energyOutputKwh} kWh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant={
                            selectedMarker.data.operational
                              ? 'default'
                              : 'destructive'
                          }
                          className={
                            selectedMarker.data.operational
                              ? 'bg-green-500'
                              : ''
                          }
                        >
                          {selectedMarker.data.operational
                            ? 'Operational'
                            : 'Offline'}
                        </Badge>
                      </div>
                    </>
                  )}
                  {selectedMarker.type === 'fertilizer' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">
                          {selectedMarker.data.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">District</span>
                        <span className="font-medium">
                          {selectedMarker.data.district}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">
                          {selectedMarker.data.capacity?.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compost</span>
                        <span className="font-medium text-purple-600">
                          <Recycle className="inline h-3 w-3" />{' '}
                          {selectedMarker.data.compostOutputKg?.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant={
                            selectedMarker.data.operational
                              ? 'default'
                              : 'destructive'
                          }
                          className={
                            selectedMarker.data.operational
                              ? 'bg-green-500'
                              : ''
                          }
                        >
                          {selectedMarker.data.operational
                            ? 'Operational'
                            : 'Offline'}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Live Donation Feed */}
            <Card className="border-orange-200 dark:border-orange-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Live Donation Feed
                </CardTitle>
                <CardDescription>
                  Recent donations across Tamil Nadu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="space-y-3 max-h-[420px] overflow-y-auto pr-1"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#FB923C transparent',
                  }}
                >
                  {recentDonations.map((donation) => {
                    const timeAgo = donation.createdAt
                      ? getTimeAgo(donation.createdAt.toDate())
                      : 'recently';
                    return (
                      <div
                        key={donation.id}
                        className="flex items-start gap-3 rounded-lg border p-3 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors cursor-pointer"
                        onClick={() =>
                          setSelectedMarker({
                            type: 'donation',
                            data: donation,
                          })
                        }
                      >
                        <div
                          className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                            donation.status === 'Available'
                              ? 'bg-orange-500 animate-pulse'
                              : 'bg-blue-500'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">
                              {donation.foodName}
                            </p>
                            <Badge
                              variant={
                                donation.status === 'Available'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={`text-[10px] flex-shrink-0 ${
                                donation.status === 'Available'
                                  ? 'bg-orange-500 hover:bg-orange-600'
                                  : ''
                              }`}
                            >
                              {donation.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {donation.quantity} • {donation.donor?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground truncate">
                              {donation.location?.split(',').slice(-2).join(',')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                              {timeAgo}
                            </span>
                            {donation.carbon_saved_kg && (
                              <>
                                <Leaf className="h-3 w-3 text-green-500" />
                                <span className="text-[11px] text-green-600">
                                  {donation.carbon_saved_kg.toFixed(1)}kg CO₂
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Zone Risk Summary */}
            <Card className="border-orange-200 dark:border-orange-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Hunger Risk Zones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {mockHungerZones
                    .sort((a, b) => b.hunger_risk_score - a.hunger_risk_score)
                    .slice(0, 10)
                    .map((zone) => (
                      <div
                        key={zone.id}
                        className="flex items-center justify-between rounded-md border p-2 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: getRiskColor(
                                zone.hunger_risk_score
                              ),
                            }}
                          />
                          <span className="text-sm font-medium">
                            {zone.zone_name.replace(' Central', '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {zone.avg_meals_required} meals/day
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{
                              borderColor: getRiskColor(
                                zone.hunger_risk_score
                              ),
                              color: getRiskColor(zone.hunger_risk_score),
                            }}
                          >
                            {zone.hunger_risk_score}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
