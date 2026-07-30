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

const TN_OUTLINE_PATH = [
  'M 57 298', 'L 74 278', 'L 83 257', 'L 92 237', 'L 101 217',
  'L 119 207', 'L 137 202', 'L 154 197', 'L 172 196', 'L 190 194',
  'L 208 190', 'L 225 184', 'L 243 176', 'L 260 166', 'L 278 154',
  'L 296 143', 'L 313 131', 'L 331 120', 'L 349 110', 'L 366 100',
  'L 384 94', 'L 393 94', 'L 402 100', 'L 410 108', 'L 416 118',
  'L 419 128', 'L 419 138', 'L 417 148', 'L 413 158', 'L 410 168',
  'L 410 188', 'L 410 208', 'L 406 218', 'L 401 228', 'L 397 238',
  'L 393 248', 'L 390 258', 'L 387 268', 'L 384 278', 'L 382 288',
  'L 380 298', 'L 378 308', 'L 377 318', 'L 377 328', 'L 378 338',
  'L 380 348', 'L 382 358', 'L 383 368', 'L 382 378', 'L 379 388',
  'L 375 398', 'L 370 408', 'L 364 418', 'L 358 428', 'L 351 438',
  'L 343 448', 'L 335 458', 'L 326 468', 'L 317 476', 'L 308 484',
  'L 299 491', 'L 290 498', 'L 280 506', 'L 270 514', 'L 260 522',
  'L 250 530', 'L 240 540', 'L 232 548', 'L 225 557', 'L 219 566',
  'L 213 575', 'L 207 584', 'L 201 592', 'L 194 600', 'L 187 608',
  'L 181 616', 'L 176 624', 'L 172 632', 'L 170 640', 'L 170 646',
  'L 165 648', 'L 158 646', 'L 151 642', 'L 144 637', 'L 137 630',
  'L 131 622', 'L 128 614', 'L 128 604', 'L 130 594', 'L 134 584',
  'L 139 574', 'L 143 564', 'L 145 554', 'L 145 543', 'L 142 533',
  'L 137 523', 'L 131 513', 'L 126 503', 'L 121 493', 'L 119 483',
  'L 117 473', 'L 115 463', 'L 113 453', 'L 110 443', 'L 106 433',
  'L 103 423', 'L 101 413', 'L 101 403', 'L 101 393', 'L 101 383',
  'L 100 373', 'L 98 363', 'L 95 353', 'L 92 343', 'L 88 333',
  'L 83 323', 'L 78 313', 'L 70 305', 'L 61 300', 'L 57 298 Z',
].join(' ');

const ZONE_PATHS: { path: string; city: string }[] = [
  { path: 'M 396 108 L 436 108 L 436 148 L 396 148 Z', city: 'Chennai' },
  { path: 'M 106 329 L 146 329 L 146 369 L 106 369 Z', city: 'Coimbatore' },
  { path: 'M 207 439 L 247 439 L 247 479 L 207 479 Z', city: 'Madurai' },
  { path: 'M 258 350 L 298 350 L 298 390 L 258 390 Z', city: 'Tiruchirappalli' },
  { path: 'M 210 262 L 250 262 L 250 302 L 210 302 Z', city: 'Salem' },
  { path: 'M 175 565 L 215 565 L 215 605 L 175 605 Z', city: 'Tirunelveli' },
  { path: 'M 172 295 L 212 295 L 212 335 L 172 335 Z', city: 'Erode' },
  { path: 'M 296 125 L 336 125 L 336 165 L 296 165 Z', city: 'Vellore' },
  { path: 'M 208 557 L 248 557 L 248 597 L 208 597 Z', city: 'Thoothukudi' },
  { path: 'M 194 397 L 234 397 L 234 437 L 194 437 Z', city: 'Dindigul' },
  { path: 'M 296 351 L 336 351 L 336 391 L 296 391 Z', city: 'Thanjavur' },
  { path: 'M 270 499 L 310 499 L 310 539 L 270 539 Z', city: 'Ramanathapuram' },
  { path: 'M 216 172 L 256 172 L 256 212 L 216 212 Z', city: 'Krishnagiri' },
  { path: 'M 211 307 L 251 307 L 251 347 L 211 347 Z', city: 'Namakkal' },
  { path: 'M 203 334 L 243 334 L 243 374 L 203 374 Z', city: 'Karur' },
  { path: 'M 75 288 L 115 288 L 115 328 L 75 328 Z', city: 'Nilgiris' },
  { path: 'M 347 134 L 387 134 L 387 174 L 347 174 Z', city: 'Kancheepuram' },
  { path: 'M 193 476 L 233 476 L 233 516 L 193 516 Z', city: 'Virudhunagar' },
  { path: 'M 151 433 L 191 433 L 191 473 L 151 473 Z', city: 'Theni' },
  { path: 'M 217 215 L 257 215 L 257 255 L 217 255 Z', city: 'Dharmapuri' },
  { path: 'M 273 408 L 313 408 L 313 448 L 273 448 Z', city: 'Perambalur' },
  { path: 'M 291 320 L 331 320 L 331 360 L 291 360 Z', city: 'Ariyalur' },
  { path: 'M 353 254 L 393 254 L 393 294 L 353 294 Z', city: 'Cuddalore' },
  { path: 'M 360 352 L 400 352 L 400 392 L 360 392 Z', city: 'Nagapattinam' },
  { path: 'M 366 103 L 406 103 L 406 143 L 366 143 Z', city: 'Tiruvallur' },
  { path: 'M 156 627 L 196 627 L 196 667 L 156 667 Z', city: 'Kanyakumari' },
  { path: 'M 244 446 L 284 446 L 284 486 L 244 486 Z', city: 'Sivaganga' },
  { path: 'M 291 205 L 331 205 L 331 245 L 291 245 Z', city: 'Tiruvannamalai' },
  { path: 'M 328 235 L 368 235 L 368 275 L 328 275 Z', city: 'Villupuram' },
  { path: 'M 267 396 L 307 396 L 307 436 L 267 436 Z', city: 'Pudukkottai' },
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
                          const pos = latLngToSvg(ngo.lat ?? 0, ngo.lng ?? 0);
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
                          const pos = latLngToSvg(vol.lat ?? 0, vol.lng ?? 0);
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
