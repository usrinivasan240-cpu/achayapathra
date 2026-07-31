'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Map, MapPin, Users, Truck, Factory, Recycle, Layers, Filter,
  Heart, AlertTriangle, Leaf, Zap, Activity, Eye, EyeOff,
} from 'lucide-react';
import {
  mockDonations, mockNGOs, mockHungerZones, mockBiogasPlants,
  mockFertilizerCentres, mockCities,
} from '@/lib/data';

const TN_CENTER: [number, number] = [10.8, 78.5];
const TN_ZOOM = 7;

const TN_BOUNDARY_COORDS: [number, number][] = [
  [13.14,80.30],[13.14,80.24],[13.13,80.20],[13.06,80.18],[13.02,80.19],
  [13.03,80.13],[13.04,80.08],[13.02,80.08],[13.02,80.04],[13.04,80.02],
  [13.05,79.99],[13.03,79.94],[13.01,79.94],[12.95,79.89],[12.95,79.85],
  [12.96,79.82],[13.00,79.82],[13.02,79.79],[13.06,79.79],[13.05,79.75],
  [13.07,79.74],[13.17,79.74],[13.16,79.69],[13.18,79.69],[13.20,79.65],
  [13.15,79.63],[13.14,79.57],[13.14,79.52],[13.14,79.48],[13.11,79.48],
  [13.09,79.45],[13.14,79.43],[13.10,79.40],[13.08,79.40],[13.06,79.33],
  [13.08,79.30],[13.12,79.28],[13.11,79.31],[13.13,79.33],[13.13,79.37],
  [13.16,79.36],[13.19,79.39],[13.19,79.43],[13.22,79.45],[13.24,79.45],
  [13.24,79.42],[13.30,79.41],[13.33,79.40],[13.34,79.50],[13.34,79.54],
  [13.27,79.54],[13.26,79.57],[13.29,79.61],[13.28,79.67],[13.24,79.68],
  [13.22,79.72],[13.24,79.73],[13.21,79.76],[13.24,79.79],[13.28,79.73],
  [13.31,79.77],[13.29,79.79],[13.32,79.82],[13.35,79.93],[13.38,79.96],
  [13.42,79.94],[13.43,79.97],[13.47,79.97],[13.48,80.01],[13.51,80.03],
  [13.54,80.03],[13.53,80.08],[13.49,80.08],[13.49,80.15],[13.49,80.23],
  [13.47,80.24],[13.56,80.26],[13.50,80.29],[13.45,80.33],[13.32,80.35],
  [13.28,80.35],[13.19,80.32],[13.14,80.30],
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
  return `${Math.floor(hours / 24)}d ago`;
}

function createDivIcon(html: string, size: [number, number] = [24, 24]) {
  if (typeof window === 'undefined') return undefined;
  const L = require('leaflet');
  return L.divIcon({ html, className: '', iconSize: size, iconAnchor: [size[0] / 2, size[1] / 2] });
}

const markerIcons = {
  donation: () => createDivIcon('<div style="width:20px;height:20px;background:#FF6B35;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', [20, 20]),
  claimed: () => createDivIcon('<div style="width:20px;height:20px;background:#3B82F6;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', [20, 20]),
  transit: () => createDivIcon('<div style="width:20px;height:20px;background:#F59E0B;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', [20, 20]),
  ngo: () => createDivIcon('<div style="width:22px;height:22px;background:#2563EB;border:2px solid white;border-radius:3px;transform:rotate(45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"><div style="width:8px;height:8px;background:white;border-radius:50%;margin:5px auto"></div></div>', [22, 22]),
  volunteer: () => createDivIcon('<div style="width:16px;height:16px;background:#F59E0B;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>', [16, 16]),
  biogas: () => createDivIcon('<div style="width:18px;height:18px;background:#16A34A;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;background:white;border-radius:50%"></div></div>', [18, 18]),
  fertilizer: () => createDivIcon('<div style="width:18px;height:18px;background:#7C3AED;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;background:white;border-radius:50%"></div></div>', [18, 18]),
  hunger: (score: number) => createDivIcon(`<div style="width:30px;height:30px;background:${getRiskColor(score)}22;border:2px solid ${getRiskColor(score)}66;border-radius:50%;display:flex;align-items:center;justify-content:center"><div style="width:10px;height:10px;background:${getRiskColor(score)};border-radius:50%"></div></div>`, [30, 30]),
};

export default function LiveMapsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<{ donations: any[]; ngos: any[]; volunteers: any[]; infrastructure: any[]; hunger: any[]; boundary: any }>({ donations: [], ngos: [], volunteers: [], infrastructure: [], hunger: [], boundary: null });

  const [showDonations, setShowDonations] = useState(true);
  const [showNGOs, setShowNGOs] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showHungerZones, setShowHungerZones] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<{ type: string; data: any } | null>(null);
  const [liveTime, setLiveTime] = useState(Date.now());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const recentDonations = useMemo(() => {
    return [...mockDonations]
      .filter((d) => d.status === 'Available' || d.status === 'Claimed')
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
      .slice(0, 15);
  }, []);

  const activeDonations = useMemo(
    () => mockDonations.filter((d) => d.status === 'Available' || d.status === 'Claimed' || d.status === 'Picked Up'),
    []
  );

  const volunteers = useMemo(() => {
    return mockDonations
      .filter((d) => d.volunteerId && (d.status === 'Picked Up' || d.status === 'Delivered'))
      .map((d) => ({
        id: d.volunteerId!,
        lat: d.lat ? d.lat + (Math.random() - 0.5) * 0.1 : 10.5 + Math.random() * 2,
        lng: d.lng ? d.lng + (Math.random() - 0.5) * 0.1 : 77.5 + Math.random() * 2,
        name: 'Volunteer',
        status: d.status === 'Picked Up' ? 'en_route' : 'delivered',
      }))
      .slice(0, 40);
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = require('leaflet');
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

    const map = L.map(mapRef.current, { center: TN_CENTER, zoom: TN_ZOOM, zoomControl: true, attributionControl: true, maxBounds: [[5, 72], [16, 85]], minZoom: 6, maxZoom: 18 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(map);

    mapInstanceRef.current = map;

    const boundary = L.polygon(TN_BOUNDARY_COORDS, { color: '#F97316', weight: 3, fillColor: '#FFF7ED', fillOpacity: 0.4, dashArray: '' }).addTo(map);
    layersRef.current.boundary = boundary;

    updateMapLayers(L, map);
    setMapReady(true);
  }, []);

  const updateMapLayers = useCallback((L: any, map: any) => {
    const layers = layersRef.current;

    layers.donations.forEach((m) => map.removeLayer(m));
    layers.ngos.forEach((m) => map.removeLayer(m));
    layers.volunteers.forEach((m) => map.removeLayer(m));
    layers.infrastructure.forEach((m) => map.removeLayer(m));
    layers.hunger.forEach((m) => map.removeLayer(m));

    layers.donations = [];
    layers.ngos = [];
    layers.volunteers = [];
    layers.infrastructure = [];
    layers.hunger = [];

    if (showDonations) {
      mockDonations
        .filter((d) => (d.status === 'Available' || d.status === 'Claimed' || d.status === 'Picked Up') && d.lat && d.lng)
        .forEach((d) => {
          const icon = d.status === 'Available' ? markerIcons.donation() : d.status === 'Claimed' ? markerIcons.claimed() : markerIcons.transit();
          const marker = L.marker([d.lat!, d.lng!], { icon })
            .bindPopup(`<div style="font-family:system-ui;min-width:160px"><b>${d.foodType || d.foodName}</b><br/><span style="color:#666">${d.quantity}</span><br/><span style="color:${d.status === 'Available' ? '#FF6B35' : '#3B82F6'};font-weight:600">${d.status}</span></div>`)
            .addTo(map);
          layers.donations.push(marker);
        });
    }

    if (showNGOs) {
      mockNGOs
        .filter((n) => n.lat && n.lng)
        .forEach((n) => {
          const marker = L.marker([n.lat!, n.lng!], { icon: markerIcons.ngo() })
            .bindPopup(`<div style="font-family:system-ui;min-width:160px"><b>${n.name}</b><br/><span style="color:#666">${n.type || 'NGO'}</span><br/><span style="color:#2563EB">${n.capacity || 'N/A'} capacity</span></div>`)
            .addTo(map);
          layers.ngos.push(marker);
        });
    }

    if (showVolunteers) {
      volunteers.forEach((v) => {
        const marker = L.marker([v.lat, v.lng], { icon: markerIcons.volunteer() })
          .bindPopup(`<div style="font-family:system-ui;min-width:120px"><b>${v.name}</b><br/><span style="color:${v.status === 'en_route' ? '#F59E0B' : '#10B981'}">${v.status === 'en_route' ? 'En Route' : 'Delivered'}</span></div>`)
          .addTo(map);
        layers.volunteers.push(marker);
      });
    }

    if (showInfrastructure) {
      mockBiogasPlants.forEach((p) => {
        if (p.lat && p.lng) {
          const marker = L.marker([p.lat, p.lng], { icon: markerIcons.biogas() })
            .bindPopup(`<div style="font-family:system-ui;min-width:140px"><b>${p.name}</b><br/><span style="color:#16A34A">Biogas Plant</span><br/><span style="color:#666">Capacity: ${p.capacity || 'N/A'}</span></div>`)
            .addTo(map);
          layers.infrastructure.push(marker);
        }
      });
      mockFertilizerCentres.forEach((c) => {
        if (c.lat && c.lng) {
          const marker = L.marker([c.lat, c.lng], { icon: markerIcons.fertilizer() })
            .bindPopup(`<div style="font-family:system-ui;min-width:140px"><b>${c.name}</b><br/><span style="color:#7C3AED">Fertilizer Centre</span></div>`)
            .addTo(map);
          layers.infrastructure.push(marker);
        }
      });
    }

    if (showHungerZones) {
      mockHungerZones.forEach((hz) => {
        if (hz.lat && hz.lng) {
          const marker = L.marker([hz.lat, hz.lng], { icon: markerIcons.hunger(hz.hunger_risk_score || 50) })
            .bindPopup(`<div style="font-family:system-ui;min-width:140px"><b>${hz.zone_name}</b><br/><span style="color:${getRiskColor(hz.hunger_risk_score || 50)}">Risk: ${getRiskLabel(hz.hunger_risk_score || 50)} (${hz.hunger_risk_score})</span><br/><span style="color:#666">Pop: ${((hz.population || 0) / 1000).toFixed(0)}K</span></div>`)
            .addTo(map);
          layers.hunger.push(marker);
        }
      });
    }
  }, [showDonations, showNGOs, showVolunteers, showInfrastructure, showHungerZones, volunteers]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require('leaflet');
    updateMapLayers(L, mapInstanceRef.current);
  }, [updateMapLayers]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Live Maps" />
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-orange-500/10 rounded-lg px-3 py-1.5">
                  <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                  <span className="text-sm font-semibold text-orange-600">Live Tracking</span>
                </div>
                <Badge variant="secondary" className="gap-1"><MapPin className="h-3 w-3" />{mockCities.length} zones</Badge>
                <Badge variant="secondary" className="gap-1"><Heart className="h-3 w-3" />{activeDonations.length} active</Badge>
              </div>
            </div>

            <Card className="overflow-hidden border-orange-200">
              <CardContent className="p-0">
                <div ref={mapRef} style={{ height: '70vh', width: '100%', minHeight: 500 }} />
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {[
                    { color: '#FF6B35', label: 'Available Donation', pulse: true },
                    { color: '#3B82F6', label: 'Claimed' },
                    { color: '#F59E0B', label: 'In Transit' },
                    { color: '#10B981', label: 'Delivered' },
                    { color: '#2563EB', label: 'NGO', shape: 'diamond' },
                    { color: '#16A34A', label: 'Biogas Plant' },
                    { color: '#7C3AED', label: 'Fertilizer Centre' },
                    { color: '#F59E0B', label: 'Volunteer' },
                    { color: '#DC2626', label: 'Hunger Zone' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      {item.shape === 'diamond' ? (
                        <svg width="12" height="12"><polygon points="6,1 1,6 6,11 11,6" fill={item.color} stroke="white" strokeWidth="1" /></svg>
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${item.pulse ? 'animate-pulse' : ''}`} style={{ background: item.color, border: `2px solid ${item.color}33` }} />
                      )}
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-orange-200">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4 text-orange-500" />Layer Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { checked: showDonations, onChange: setShowDonations, icon: Heart, color: 'text-orange-500', label: 'Donations' },
                  { checked: showNGOs, onChange: setShowNGOs, icon: Users, color: 'text-blue-500', label: 'NGOs' },
                  { checked: showVolunteers, onChange: setShowVolunteers, icon: Truck, color: 'text-amber-500', label: 'Volunteers' },
                  { checked: showInfrastructure, onChange: setShowInfrastructure, icon: Factory, color: 'text-purple-500', label: 'Infrastructure' },
                  { checked: showHungerZones, onChange: setShowHungerZones, icon: Layers, color: 'text-red-500', label: 'Hunger Zones' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><item.icon className={`h-4 w-4 ${item.color}`} /><Label className="text-sm">{item.label}</Label></div>
                    <Switch checked={item.checked} onCheckedChange={item.onChange} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-orange-500" />Quick Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-orange-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{activeDonations.length}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Active Donations</div>
                  </div>
                  <div className="rounded-lg bg-blue-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockNGOs.length}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Registered NGOs</div>
                  </div>
                  <div className="rounded-lg bg-amber-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">{volunteers.length}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Active Volunteers</div>
                  </div>
                  <div className="rounded-lg bg-green-500/5 p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{mockBiogasPlants.length + mockFertilizerCentres.length}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Infrastructure</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedMarker && (
              <Card className="border-orange-200">
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Eye className="h-4 w-4 text-orange-500" />Marker Details</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="font-semibold capitalize">{selectedMarker.type}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Name</span><span className="font-semibold">{selectedMarker.data.name || selectedMarker.data.foodType || 'N/A'}</span></div>
                  {selectedMarker.data.status && (<div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="font-semibold">{selectedMarker.data.status}</span></div>)}
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setSelectedMarker(null)}><EyeOff className="h-3 w-3 mr-1" />Close</Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-orange-200">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-orange-500" />Live Donation Feed</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {recentDonations.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => { if (d.lat && d.lng && mapInstanceRef.current) { mapInstanceRef.current.setView([d.lat, d.lng], 12); } }}>
                    <div className={`w-2 h-2 rounded-full ${d.status === 'Available' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{d.foodType || d.foodName}</p>
                      <p className="text-[10px] text-muted-foreground">{d.quantity} &middot; {d.location}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{d.createdAt ? getTimeAgo(d.createdAt.toDate()) : ''}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
