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

const TN_OUTLINE_PATH = 'M 174.56,637.81 L 176.57,637.76 L 177.5,633.51 L 179.51,631.33 L 183.53,630.01 L 192.19,628.86 L 194.4,630.76 L 197.55,629.04 L 198.52,624.9 L 201.77,619.91 L 206.15,618.02 L 211.31,613.83 L 213.21,611.42 L 215.07,609.87 L 221.56,607.58 L 221.41,603.56 L 226.92,597.19 L 228.47,594.44 L 227.33,589.73 L 228.57,584.62 L 227.75,582.73 L 228.05,576.25 L 230.27,571.77 L 233.05,568.9 L 230.79,566.49 L 230.01,563.45 L 230.99,555.48 L 233.36,549.85 L 235.79,546.47 L 239.86,543.26 L 249.85,534.02 L 252.48,531.95 L 263.2,529.54 L 267.02,530.23 L 273.25,527.13 L 272.99,524.78 L 276.4,523.69 L 279.02,524.32 L 280.11,522.26 L 293.15,517.32 L 296.08,518.12 L 297.63,516.35 L 302.42,515.6 L 312.21,517.03 L 321.03,514.85 L 323.96,517.26 L 326.85,517.21 L 330.72,518.53 L 334.84,521.11 L 331.95,515.14 L 333.81,512.1 L 331.75,510.15 L 327.62,513.76 L 322.99,514.68 L 318.45,514.62 L 310.1,513.19 L 305.62,509.86 L 298.35,501.6 L 295.62,496.32 L 296.65,493.34 L 298.09,482.84 L 300.67,479.11 L 302.47,473.25 L 307.83,465.45 L 309.43,464.76 L 311.49,460.4 L 314.53,456.84 L 314.74,456.62 L 314.95,453.8 L 315.15,453.46 L 317.68,448.93 L 325.82,438.83 L 326.44,436.42 L 324.17,431.25 L 324.27,427.64 L 325.97,422.48 L 328.81,419.61 L 327.78,418.23 L 330.77,414.56 L 336.59,411.63 L 337.78,409.39 L 345.92,409.39 L 360.45,411.57 L 364.32,412.84 L 372.15,413.87 L 380.24,412.78 L 382.2,408.65 L 381.22,404.11 L 379.62,376.75 L 379.42,357.18 L 376.79,355.34 L 377.05,351.38 L 372.87,350.12 L 368.23,346.79 L 367.93,342.72 L 371.33,343.58 L 370.35,339.97 L 379.83,339.45 L 379.88,321.61 L 377.97,306.8 L 378.75,303.76 L 377,300.95 L 376.07,296.36 L 375.19,293.26 L 371.95,286.38 L 371.12,282.76 L 371.48,275.99 L 374.52,260.67 L 367.82,259.52 L 369.21,257.06 L 369.32,253.67 L 374.78,255.16 L 372.25,250.4 L 369.63,251.43 L 364.73,249.71 L 369.68,247.24 L 365.81,243.51 L 367.87,238.35 L 369.88,239.84 L 370.45,245.52 L 373.54,241.68 L 375.5,240.87 L 378.49,242.08 L 379.98,236.92 L 378.49,236.23 L 379.31,232.33 L 382.41,231.01 L 393.28,211.61 L 397.61,204.32 L 404.77,195.72 L 406.42,190.67 L 407.51,182.81 L 415.13,157.73 L 414.67,150.16 L 415.55,142.01 L 418.69,126.12 L 419.2,121.01 L 420.85,116.59 L 423.12,107.07 L 423.22,103.45 L 421.42,90.2 L 418.53,85.04 L 415.96,78.21 L 414,87.39 L 412.56,86.13 L 405.44,85.5 L 399.52,85.73 L 399.41,81.88 L 395.14,80.62 L 394.98,83.2 L 393.28,86.82 L 390.14,87.73 L 390.24,91.75 L 387.25,92.27 L 388.9,96.91 L 386.53,99.73 L 376.43,103.11 L 374.16,105.64 L 372.1,103.57 L 369.16,107.47 L 374.47,110.91 L 371.38,114.41 L 368.96,111.43 L 367.72,113.5 L 364.68,110.68 L 363.54,107.01 L 357.77,106.21 L 354.94,109.19 L 351.95,107.82 L 351.69,101.04 L 347.98,100.41 L 339.43,101.91 L 340.77,105 L 341.18,110.8 L 344.27,111.26 L 344.32,113.5 L 342.36,116.31 L 338.86,115.96 L 335.66,118.83 L 336.49,122.27 L 333.29,122.27 L 331.59,124.17 L 329.32,123.08 L 324.43,119.58 L 324.94,124.86 L 320.87,126.64 L 321.18,130.65 L 318.6,133.52 L 313.81,131.63 L 311.34,132.95 L 309.89,130.36 L 307.27,128.47 L 302.63,126.81 L 300.26,127.84 L 297.42,127.44 L 294.64,132.26 L 294.59,125.66 L 290.26,127.55 L 287.68,126.52 L 285.42,129.05 L 282.22,129.96 L 278.97,128.59 L 278.15,134.04 L 273.77,134.04 L 270.68,136.5 L 271.81,142.59 L 269.08,151.42 L 269.54,153.78 L 268.2,157.79 L 265.06,160.37 L 264.85,166.28 L 260.37,163.64 L 260.32,168.06 L 257.17,168.64 L 257.48,173.11 L 252.28,173.63 L 249.34,173.86 L 242.02,169.15 L 240.22,166.05 L 237.02,165.94 L 236.2,160.03 L 227.69,157.85 L 223.78,154.23 L 222.54,151.94 L 218.52,150.62 L 217.44,152.8 L 214.91,153.78 L 212.65,152.63 L 210.53,153.6 L 208.47,152.11 L 210.38,148.61 L 209.55,146.72 L 206.1,148.9 L 201.31,148.84 L 198.06,150.73 L 197.6,160.32 L 194.66,163.41 L 194.66,166.51 L 192.86,168.87 L 187.39,170.24 L 185.74,167.83 L 180.33,169.55 L 180.95,173.51 L 179.66,174.83 L 178.63,179.14 L 179.3,185.1 L 181.77,186.19 L 181.1,189.12 L 182.86,190.84 L 181.57,200.77 L 178.53,203.35 L 177.39,206.39 L 173.99,209.14 L 170.59,209.03 L 169.05,212.76 L 169.15,216.2 L 173.27,217.75 L 181.57,216.6 L 186.21,217.35 L 192.03,219.24 L 193.42,221.71 L 195.95,225.5 L 194.2,229.46 L 191.77,231.18 L 188.94,236 L 187.13,242.48 L 180.85,243.92 L 176.98,243.51 L 174.97,244.49 L 170.95,243.57 L 170.75,246.9 L 168.53,250.34 L 167.14,258.37 L 165.23,261.36 L 162.35,259.41 L 157.04,260.9 L 153.38,257.06 L 149.46,256.65 L 148.48,258.55 L 144.1,258.78 L 137.2,260.67 L 137.3,263.88 L 134.72,264.11 L 130.81,258.6 L 128.54,256.48 L 125.91,257.92 L 124.72,260.33 L 119.31,258.49 L 117.51,264.74 L 114.16,269.56 L 112.77,274.33 L 113.85,278.97 L 111.74,277.54 L 98.34,276.79 L 93.23,277.6 L 89.37,276.56 L 86.64,269.28 L 84.22,267.67 L 79.37,271.8 L 76.74,274.96 L 73.29,275.36 L 72.41,278.17 L 68.7,278.8 L 65.71,281.33 L 63.65,278.28 L 59.63,281.67 L 60.25,285.97 L 62.42,290.51 L 64.12,290.33 L 67.83,293.26 L 71.59,293.03 L 79.68,299.92 L 87.41,302.96 L 86.95,309.33 L 85.09,311.97 L 79.06,315.18 L 78.7,318.62 L 83.13,318.05 L 86.17,320.69 L 92.1,319.42 L 94.57,319.77 L 101.38,315.06 L 104.01,317.59 L 103.54,319.83 L 100.45,322.58 L 101.38,325.11 L 105.14,325.85 L 104.99,333.83 L 102.31,335.49 L 97.92,342.83 L 97.25,346.68 L 104.37,350.35 L 107.92,350.7 L 112.46,352.82 L 115.91,359.07 L 118.64,359.19 L 118.9,363.78 L 115.55,371.81 L 116.99,376.4 L 110.96,376.8 L 111.27,380.13 L 113.13,380.82 L 112.2,395.74 L 111.12,398.43 L 111.79,401.36 L 114,404.11 L 112.36,410.66 L 118.28,414.84 L 119.47,417.6 L 122.04,417.31 L 126.01,418.92 L 131.94,414.67 L 132.35,412.32 L 135.39,409.51 L 138.02,409.16 L 142.97,405.03 L 148.17,405.61 L 147.55,409.45 L 150.7,414.67 L 150.8,417.6 L 152.86,417.89 L 151.68,422.76 L 151.06,429.13 L 149,428.16 L 145.18,430.68 L 145.44,432.57 L 150.54,438.2 L 149.98,440.43 L 151.52,443.99 L 146.68,451.28 L 146.83,455.35 L 148.28,455.87 L 147.45,459.77 L 149.2,462.18 L 147.14,469.12 L 143.28,476.64 L 142.25,480.89 L 144.93,480.94 L 148.12,484.27 L 151.21,485.19 L 154.25,482.49 L 159.72,487.37 L 161.42,490.64 L 162.96,490.01 L 162.09,496.72 L 159.77,496.66 L 157.4,500.74 L 157.29,506.02 L 152.45,513.76 L 151.73,519.67 L 150.08,523.52 L 151.06,527.94 L 145.6,535.05 L 144.41,539.18 L 142.14,539.01 L 140.6,542.62 L 142.71,544.46 L 146.94,553.41 L 150.03,555.94 L 150.75,559.72 L 147.92,563.28 L 147.71,565.58 L 145.08,567.81 L 143.23,571.08 L 145.7,576.13 L 146.32,579.4 L 149.62,582.33 L 151.16,586.58 L 152.5,589.85 L 150.6,593.92 L 146.21,597.59 L 144.82,602.81 L 141.52,608.03 L 142.86,609.87 L 141.42,612.17 L 137.92,612.85 L 136.06,615.78 L 140.85,619.91 L 143.59,623.18 L 149.41,628.17 L 156.68,632.59 L 166.73,635.92 Z';

const ZONE_PATHS: { path: string; city: string }[] = [
  { path: 'M 301,305 L 341,305 L 341,345 L 301,345 Z', city: 'Ariyalur' },
  { path: 'M 368,154 L 408,154 L 408,194 L 368,194 Z', city: 'Chengalpattu' },
  { path: 'M 391,115 L 431,115 L 431,155 L 391,155 Z', city: 'Chennai' },
  { path: 'M 106,334 L 146,334 L 146,374 L 106,374 Z', city: 'Coimbatore' },
  { path: 'M 324,262 L 364,262 L 364,302 L 324,302 Z', city: 'Cuddalore' },
  { path: 'M 215,204 L 255,204 L 255,244 L 215,244 Z', city: 'Dharmapuri' },
  { path: 'M 180,377 L 220,377 L 220,417 L 180,417 Z', city: 'Dindigul' },
  { path: 'M 145,267 L 185,267 L 185,307 L 145,307 Z', city: 'Erode' },
  { path: 'M 285,238 L 325,238 L 325,278 L 285,278 Z', city: 'Kallakurichi' },
  { path: 'M 357,134 L 397,134 L 397,174 L 357,174 Z', city: 'Kancheepuram' },
  { path: 'M 141,593 L 181,593 L 181,633 L 141,633 Z', city: 'Kanyakumari' },
  { path: 'M 202,338 L 242,338 L 242,378 L 202,378 Z', city: 'Karur' },
  { path: 'M 202,172 L 242,172 L 242,212 L 202,212 Z', city: 'Krishnagiri' },
  { path: 'M 199,430 L 239,430 L 239,470 L 199,470 Z', city: 'Madurai' },
  { path: 'M 344,335 L 384,335 L 384,375 L 344,375 Z', city: 'Nagapattinam' },
  { path: 'M 207,286 L 247,286 L 247,326 L 207,326 Z', city: 'Namakkal' },
  { path: 'M 75,274 L 115,274 L 115,314 L 75,314 Z', city: 'Nilgiris' },
  { path: 'M 273,292 L 313,292 L 313,332 L 273,332 Z', city: 'Perambalur' },
  { path: 'M 270,385 L 310,385 L 310,425 L 270,425 Z', city: 'Pudukkottai' },
  { path: 'M 262,472 L 302,472 L 302,512 L 262,512 Z', city: 'Ramanathapuram' },
  { path: 'M 323,119 L 363,119 L 363,159 L 323,159 Z', city: 'Ranipet' },
  { path: 'M 221,254 L 261,254 L 261,294 L 221,294 Z', city: 'Salem' },
  { path: 'M 246,426 L 286,426 L 286,466 L 246,466 Z', city: 'Sivaganga' },
  { path: 'M 151,513 L 191,513 L 191,553 L 151,553 Z', city: 'Tenkasi' },
  { path: 'M 306,355 L 346,355 L 346,395 L 306,395 Z', city: 'Thanjavur' },
  { path: 'M 144,433 L 184,433 L 184,473 L 144,473 Z', city: 'Theni' },
  { path: 'M 355,94 L 395,94 L 395,134 L 355,134 Z', city: 'Thiruvallur' },
  { path: 'M 330,348 L 370,348 L 370,388 L 330,388 Z', city: 'Thiruvarur' },
  { path: 'M 192,532 L 232,532 L 232,572 L 192,572 Z', city: 'Thoothukkudi' },
  { path: 'M 245,333 L 285,333 L 285,373 L 245,373 Z', city: 'Tiruchirappalli' },
  { path: 'M 159,561 L 199,561 L 199,601 L 159,601 Z', city: 'Tirunelveli' },
  { path: 'M 253,157 L 293,157 L 293,197 L 253,197 Z', city: 'Tirupathur' },
  { path: 'M 143,340 L 183,340 L 183,380 L 143,380 Z', city: 'Tiruppur' },
  { path: 'M 304,174 L 344,174 L 344,214 L 304,214 Z', city: 'Tiruvannamalai' },
  { path: 'M 281,125 L 321,125 L 321,165 L 281,165 Z', city: 'Vellore' },
  { path: 'M 331,210 L 371,210 L 371,250 L 331,250 Z', city: 'Viluppuram' },
  { path: 'M 192,473 L 232,473 L 232,513 L 192,513 Z', city: 'Virudhunagar' },
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
