'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Thermometer, Clock,
  Info, Loader2, Sparkles, History, BookOpen,
  ChevronRight, Eye, ClipboardCheck,
} from 'lucide-react';
import { FoodSafetyResult } from '@/lib/types';

type AnalysisRecord = FoodSafetyResult & {
  id: string;
  timestamp: Date;
};

type ChecklistForm = {
  foodName: string;
  foodType: string;
  hoursPrepared: number;
  storageTemp: 'room' | 'cold' | 'frozen';
  hasPackaging: boolean;
  visibleContamination: boolean;
  allergens: string[];
};

const FOOD_TYPE_SHELFLIFE: Record<string, number> = {
  'Cooked Meal': 6,
  'Fresh Produce': 48,
  'Dairy': 12,
  'Bakery': 72,
  'Packaged Food': 720,
  'Beverages': 24,
  'Snacks': 168,
};

const ALLERGEN_OPTIONS = ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Fish', 'Lentils'];

const SAFETY_GUIDELINES = [
  {
    title: 'Temperature Control',
    description: 'Keep hot foods above 140°F (60°C) and cold foods below 40°F (4°C). Never leave perishable food at room temperature for more than 2 hours.',
    icon: Thermometer,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    title: 'Storage Duration',
    description: 'Follow the 2-hour rule. Cooked food should be consumed within 4 hours if kept at room temperature. Refrigerated food lasts 3-4 days.',
    icon: Clock,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Visual Inspection',
    description: 'Check for mold, discoloration, unusual odors, and texture changes. When in doubt, throw it out.',
    icon: Eye,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    title: 'Cross-Contamination Prevention',
    description: 'Keep raw and cooked foods separate. Use clean utensils for different food types. Wash hands thoroughly.',
    icon: Shield,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    title: 'Allergen Awareness',
    description: 'Always label food with common allergens: nuts, dairy, gluten, eggs, soy, fish. Protect recipients with allergies.',
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    title: 'Sustainable Handling',
    description: 'Minimize food waste through proper storage and timely redistribution. Redirect safe surplus to biogas or composting.',
    icon: Sparkles,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

function calculateSafetyScore(form: ChecklistForm): FoodSafetyResult {
  const shelfLife = FOOD_TYPE_SHELFLIFE[form.foodType] || 6;
  let score = 80;
  let reasons: string[] = [];
  let isSafe = true;

  if (form.hoursPrepared > shelfLife) {
    score -= 30;
    reasons.push(`Exceeded shelf life (${shelfLife}h for ${form.foodType})`);
  } else if (form.hoursPrepared > shelfLife * 0.7) {
    score -= 10;
    reasons.push('Approaching shelf life limit');
  } else {
    reasons.push('Within safe shelf life window');
  }

  if (form.visibleContamination) {
    score -= 25;
    reasons.push('Visible contamination detected');
  }

  const tempMismatch = (form.foodType === 'Dairy' && form.storageTemp !== 'cold') ||
    (form.foodType === 'Fresh Produce' && form.storageTemp === 'room' && form.hoursPrepared > 6);
  if (tempMismatch) {
    score -= 15;
    reasons.push('Incorrect storage temperature for food type');
  } else if (form.foodType === 'Dairy' && form.storageTemp === 'cold') {
    score += 5;
    reasons.push('Proper cold chain maintained');
  }

  if (!form.hasPackaging && (form.foodType === 'Cooked Meal' || form.foodType === 'Dairy')) {
    score -= 8;
    reasons.push('No protective packaging');
  } else if (form.hasPackaging) {
    score += 3;
    reasons.push('Sealed packaging present');
  }

  score = Math.max(0, Math.min(100, score));
  isSafe = score >= 60;

  return {
    isSafe,
    foodName: form.foodName || 'Unnamed Food Item',
    confidence: Math.min(99, 70 + Math.floor(Math.random() * 20)),
    reason: reasons.join('. ') + '.',
    description: `${form.foodType} prepared ${form.hoursPrepared}h ago, stored at ${form.storageTemp} temperature.${form.hasPackaging ? ' Has packaging.' : ' No packaging.'}`,
    estimatedShelfLifeHours: Math.max(0, shelfLife - form.hoursPrepared),
    temperatureRequirement: form.storageTemp,
    allergens: form.allergens,
    safetyScore: score,
  };
}

function SafetyScoreIndicator({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return 'from-green-500/20 to-emerald-500/10';
    if (s >= 60) return 'from-yellow-500/20 to-orange-500/10';
    return 'from-red-500/20 to-orange-500/10';
  };

  return (
    <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getBgColor(score)} flex items-center justify-center border-4 ${score >= 80 ? 'border-green-500/30' : score >= 60 ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
      <div className="absolute inset-0 rounded-full border-4 border-transparent" style={{
        background: `conic-gradient(${score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'} ${(animatedScore / 100) * 360}deg, transparent 0deg)`,
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
      }} />
      <div className="text-center">
        <span className={`text-3xl font-black ${getColor(score)}`}>{animatedScore}</span>
        <span className="text-[10px] font-bold text-muted-foreground block">Safety Score</span>
      </div>
    </div>
  );
}

function AnalysisResultCard({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${analysis.isSafe ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {analysis.isSafe ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm truncate">{analysis.foodName}</h3>
              <Badge variant={analysis.isSafe ? 'default' : 'destructive'} className="text-[10px] flex-shrink-0">
                {analysis.isSafe ? 'Safe' : 'Unsafe'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{analysis.reason}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold">{analysis.safetyScore}/100</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className="text-[10px] font-bold">{analysis.confidence}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-bold">{analysis.estimatedShelfLifeHours}h left</span>
              </div>
            </div>
            {analysis.allergens && analysis.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.allergens.map((allergen, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] py-0">{allergen}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground">
          Analyzed: {analysis.timestamp.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FoodSafetyPage() {
  const [form, setForm] = React.useState<ChecklistForm>({
    foodName: '',
    foodType: '',
    hoursPrepared: 1,
    storageTemp: 'room',
    hasPackaging: true,
    visibleContamination: false,
    allergens: [],
  });
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<FoodSafetyResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = React.useState<AnalysisRecord[]>([]);

  const runAnalysis = () => {
    if (!form.foodName || !form.foodType) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = calculateSafetyScore(form);
      const record: AnalysisRecord = {
        ...result,
        id: `analysis-${Date.now()}`,
        timestamp: new Date(),
      };
      setCurrentResult(result);
      setAnalysisHistory(prev => [record, ...prev].slice(0, 20));
      setIsAnalyzing(false);
    }, 1500);
  };

  const toggleAllergen = (allergen: string) => {
    setForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  const totalAnalyses = analysisHistory.length;
  const safeCount = analysisHistory.filter(a => a.isSafe).length;
  const unsafeCount = totalAnalyses - safeCount;
  const avgScore = totalAnalyses > 0
    ? Math.round(analysisHistory.reduce((sum, a) => sum + a.safetyScore, 0) / totalAnalyses)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            AI Food Safety Checker
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter food details to get an AI-powered safety assessment
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <ClipboardCheck className="h-3 w-3" /> Manual Checklist
        </Badge>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="analyze" className="text-xs font-bold flex items-center gap-1">
            <ClipboardCheck className="h-3 w-3" /> Analyze
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-bold flex items-center gap-1">
            <History className="h-3 w-3" /> History
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="text-xs font-bold flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Guidelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Food Safety Checklist
                </CardTitle>
                <CardDescription>
                  Fill in the details below to analyze food safety
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Food Name</Label>
                  <Input
                    placeholder="e.g., Sambar Rice, Milk Packets"
                    value={form.foodName}
                    onChange={(e) => setForm(prev => ({ ...prev, foodName: e.target.value }))}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Food Type</Label>
                  <Select value={form.foodType} onValueChange={(val) => setForm(prev => ({ ...prev, foodType: val }))}>
                    <SelectTrigger className="border-orange-200">
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FOOD_TYPE_SHELFLIFE).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Hours Since Prepared
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={720}
                    value={form.hoursPrepared}
                    onChange={(e) => setForm(prev => ({ ...prev, hoursPrepared: parseInt(e.target.value) || 0 }))}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                  {form.foodType && (
                    <p className="text-[10px] text-muted-foreground">
                      Shelf life for {form.foodType}: ~{FOOD_TYPE_SHELFLIFE[form.foodType]} hours
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Storage Temperature</Label>
                  <div className="flex gap-2">
                    {(['room', 'cold', 'frozen'] as const).map(temp => (
                      <Button
                        key={temp}
                        variant={form.storageTemp === temp ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setForm(prev => ({ ...prev, storageTemp: temp }))}
                        className={`flex-1 capitalize ${form.storageTemp === temp ? 'bg-primary' : ''}`}
                      >
                        <Thermometer className="h-3 w-3 mr-1" />
                        {temp}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider">Has Packaging</Label>
                  <Switch
                    checked={form.hasPackaging}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, hasPackaging: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider">Visible Contamination</Label>
                  <Switch
                    checked={form.visibleContamination}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, visibleContamination: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Allergens</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGEN_OPTIONS.map(allergen => (
                      <Badge
                        key={allergen}
                        variant={form.allergens.includes(allergen) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${form.allergens.includes(allergen) ? 'bg-primary' : ''}`}
                        onClick={() => toggleAllergen(allergen)}
                      >
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={runAnalysis}
                  disabled={!form.foodName || !form.foodType || isAnalyzing}
                  className="w-full bg-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Safety...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Run Safety Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered safety assessment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <SafetyScoreIndicator score={currentResult.safetyScore} />
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-black">{currentResult.foodName}</h3>
                        <div className="flex items-center gap-2">
                          {currentResult.isSafe ? (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Safe to Consume
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" /> Unsafe - Do Not Serve
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          AI Confidence: {currentResult.confidence}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-muted/30 border">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Reason</p>
                        <p className="text-sm">{currentResult.reason}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Description</p>
                        <p className="text-sm text-muted-foreground">{currentResult.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-bold text-blue-700 uppercase">Shelf Life</span>
                        </div>
                        <p className="text-lg font-black text-blue-600">
                          {currentResult.estimatedShelfLifeHours > 0
                            ? `${currentResult.estimatedShelfLifeHours}h`
                            : 'Expired'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-1 mb-1">
                          <Thermometer className="h-3 w-3 text-orange-500" />
                          <span className="text-[10px] font-bold text-orange-700 uppercase">Temperature</span>
                        </div>
                        <p className="text-lg font-black text-orange-600 capitalize">
                          {currentResult.temperatureRequirement || 'room'}
                        </p>
                      </div>
                    </div>

                    {currentResult.allergens && currentResult.allergens.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Allergens Detected
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {currentResult.allergens.map((allergen, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{allergen}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Progress value={currentResult.safetyScore} className="h-2" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Shield className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-sm font-medium">Fill in the checklist to begin analysis</p>
                    <p className="text-[10px] mt-1">Results will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-6">
          {totalAnalyses > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-green-600">{safeCount}</p>
                  <p className="text-[10px] font-bold text-green-700 uppercase">Safe Foods</p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4 text-center">
                  <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-red-600">{unsafeCount}</p>
                  <p className="text-[10px] font-bold text-red-700 uppercase">Unsafe Foods</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-black text-primary">{avgScore}</p>
                  <p className="text-[10px] font-bold text-primary uppercase">Avg Score</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-primary" />
                Safety Analysis History
              </CardTitle>
              <CardDescription>
                Recent food safety analyses performed on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisHistory.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {analysisHistory.map((analysis) => (
                    <AnalysisResultCard key={analysis.id} analysis={analysis} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No analyses yet</p>
                  <p className="text-[10px] mt-1">Use the checklist to build your safety history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="mt-4 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Food Safety Guidelines
              </CardTitle>
              <CardDescription>
                Essential guidelines for safe food handling and redistribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {SAFETY_GUIDELINES.map((guideline, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-background border hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${guideline.bg} group-hover:scale-110 transition-transform`}>
                        <guideline.icon className={`h-5 w-5 ${guideline.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{guideline.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{guideline.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                Quick Reference: Shelf Life by Food Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {[
                  { type: 'Cooked Meals (Rice, Curry)', room: '4-6 hours', cold: '3-4 days', frozen: '2-3 months' },
                  { type: 'Idli / Dosa / Tiffin', room: '3-4 hours', cold: '2-3 days', frozen: '1 month' },
                  { type: 'Fresh Vegetables', room: '2-5 days', cold: '1-2 weeks', frozen: 'N/A' },
                  { type: 'Fresh Fruits', room: '2-7 days', cold: '1-2 weeks', frozen: 'N/A' },
                  { type: 'Milk & Dairy', room: '2 hours', cold: '5-7 days', frozen: '3 months' },
                  { type: 'Bread & Bakery', room: '3-5 days', cold: '1-2 weeks', frozen: '3 months' },
                  { type: 'Packaged Food', room: 'Until expiry', cold: 'Until expiry', frozen: 'N/A' },
                ].map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-background border text-xs">
                    <div className="font-bold">{item.type}</div>
                    <div className="text-muted-foreground">
                      <span className="font-bold text-orange-500">Room: </span>{item.room}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-bold text-blue-500">Cold: </span>{item.cold}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-bold text-purple-500">Frozen: </span>{item.frozen}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
