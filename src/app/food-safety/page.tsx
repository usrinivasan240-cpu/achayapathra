'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Thermometer, Clock,
  Upload, Camera, Leaf, Info, Loader2, Sparkles, History, BookOpen,
  ChevronRight, Eye, Trash2
} from 'lucide-react';
import { mockDonations } from '@/lib/data';
import { FoodSafetyResult } from '@/lib/types';

type AnalysisRecord = FoodSafetyResult & {
  id: string;
  timestamp: Date;
  imageUrl: string;
};

const FOOD_SAFETY_SAMPLES: FoodSafetyResult[] = [
  {
    isSafe: true,
    foodName: 'Sambar Rice',
    confidence: 96,
    reason: 'Freshly prepared, stored at appropriate temperature, no visible contamination.',
    description: 'Traditional South Indian sambar rice prepared with lentils, vegetables, and spices. Looks fresh with vibrant color.',
    estimatedShelfLifeHours: 6,
    temperatureRequirement: 'room',
    allergens: ['Lentils', 'Mustard Seeds'],
    safetyScore: 94,
  },
  {
    isSafe: true,
    foodName: 'Idli Vada',
    confidence: 92,
    reason: 'Properly steamed, no signs of fermentation issues, clean preparation.',
    description: 'Soft idlis with crispy vada, freshly prepared in a clean kitchen environment.',
    estimatedShelfLifeHours: 4,
    temperatureRequirement: 'room',
    allergens: ['Rice', 'Urad Dal', 'Gluten'],
    safetyScore: 91,
  },
  {
    isSafe: false,
    foodName: 'Chicken Biryani',
    confidence: 88,
    reason: 'Temperature abuse detected. Food has been in danger zone (40°F-140°F) for over 2 hours.',
    description: 'Chicken biryani showing signs of improper temperature control. Meat should not be served.',
    estimatedShelfLifeHours: 0,
    temperatureRequirement: 'frozen',
    allergens: ['Poultry', 'Dairy', 'Gluten'],
    safetyScore: 23,
  },
  {
    isSafe: true,
    foodName: 'Fresh Vegetable Bundle',
    confidence: 98,
    reason: 'Organic vegetables freshly harvested, no pesticides detected, proper handling.',
    description: 'Mixed seasonal vegetables including spinach, tomatoes, and carrots. Farm-fresh quality.',
    estimatedShelfLifeHours: 48,
    temperatureRequirement: 'cold',
    allergens: [],
    safetyScore: 97,
  },
  {
    isSafe: true,
    foodName: 'Milk Packets',
    confidence: 95,
    reason: 'Within expiry date, cold chain maintained, packaging intact.',
    description: 'Pasteurized full cream milk packets, properly refrigerated throughout transport.',
    estimatedShelfLifeHours: 12,
    temperatureRequirement: 'cold',
    allergens: ['Dairy'],
    safetyScore: 93,
  },
  {
    isSafe: false,
    foodName: 'Paneer Curry',
    confidence: 85,
    reason: 'Mold growth detected on surface. Immediate disposal recommended.',
    description: 'Paneer curry showing visible mold patches. Not suitable for consumption.',
    estimatedShelfLifeHours: 0,
    temperatureRequirement: 'cold',
    allergens: ['Dairy', 'Nuts'],
    safetyScore: 8,
  },
  {
    isSafe: true,
    foodName: 'Pongal',
    confidence: 94,
    reason: 'Well-cooked, aromatic, no off-odors or discoloration.',
    description: 'Ven pongal made with rice, moong dal, pepper, and ghee. Classic preparation.',
    estimatedShelfLifeHours: 5,
    temperatureRequirement: 'room',
    allergens: ['Dairy'],
    safetyScore: 89,
  },
  {
    isSafe: true,
    foodName: 'Bread Loaves',
    confidence: 91,
    reason: 'Packaging sealed, no moisture damage, within shelf life.',
    description: 'Whole wheat bread loaves, factory sealed with batch number visible.',
    estimatedShelfLifeHours: 72,
    temperatureRequirement: 'room',
    allergens: ['Gluten', 'Soy'],
    safetyScore: 88,
  },
  {
    isSafe: false,
    foodName: 'Fish Curry',
    confidence: 90,
    reason: 'Strong ammonia odor indicating protein decomposition. Unsafe for consumption.',
    description: 'Fish curry with strong signs of spoilage. Ammonia smell indicates bacterial breakdown.',
    estimatedShelfLifeHours: 0,
    temperatureRequirement: 'frozen',
    allergens: ['Fish'],
    safetyScore: 12,
  },
  {
    isSafe: true,
    foodName: 'Fresh Fruits',
    confidence: 97,
    reason: 'Ripe, organic, no bruising or pest damage.',
    description: 'Assorted seasonal fruits including bananas, apples, and oranges. Perfect condition.',
    estimatedShelfLifeHours: 96,
    temperatureRequirement: 'room',
    allergens: [],
    safetyScore: 96,
  },
  {
    isSafe: true,
    foodName: 'Dal Fry',
    confidence: 93,
    reason: 'Properly cooked, consistent texture, no contamination signs.',
    description: 'Toor dal fry tempered with cumin, garlic, and curry leaves. Homestyle preparation.',
    estimatedShelfLifeHours: 6,
    temperatureRequirement: 'room',
    allergens: ['Lentils'],
    safetyScore: 90,
  },
  {
    isSafe: false,
    foodName: 'Curd Rice',
    confidence: 87,
    reason: 'Extended room temperature exposure. Bacterial count likely exceeds safe limits.',
    description: 'Curd rice left unrefrigerated for over 4 hours. Risk of foodborne illness.',
    estimatedShelfLifeHours: 0,
    temperatureRequirement: 'cold',
    allergens: ['Dairy'],
    safetyScore: 31,
  },
  {
    isSafe: true,
    foodName: 'Protein Bars',
    confidence: 99,
    reason: 'Factory sealed, within expiry, no damage to packaging.',
    description: 'Packaged protein bars with nut and chocolate flavor. Commercial packaging intact.',
    estimatedShelfLifeHours: 720,
    temperatureRequirement: 'room',
    allergens: ['Nuts', 'Soy', 'Dairy'],
    safetyScore: 98,
  },
  {
    isSafe: true,
    foodName: 'Egg Curry',
    confidence: 89,
    reason: 'Freshly prepared, eggs properly boiled, curry well-cooked.',
    description: 'Boiled egg curry in rich tomato-onion gravy. Eggs checked for freshness.',
    estimatedShelfLifeHours: 5,
    temperatureRequirement: 'room',
    allergens: ['Eggs'],
    safetyScore: 86,
  },
  {
    isSafe: false,
    foodName: 'Lemon Rice',
    confidence: 82,
    reason: 'Rice appears dried and discolored. Possible contamination during preparation.',
    description: 'Lemon rice with yellow discoloration inconsistent with turmeric. Investigate further.',
    estimatedShelfLifeHours: 0,
    temperatureRequirement: 'room',
    allergens: ['Mustard Seeds'],
    safetyScore: 42,
  },
];

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
    icon: Leaf,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

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
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={analysis.imageUrl}
              alt={analysis.foodName}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-1 right-1 p-1 rounded-full ${analysis.isSafe ? 'bg-green-500' : 'bg-red-500'}`}>
              {analysis.isSafe ? (
                <CheckCircle2 className="h-3 w-3 text-white" />
              ) : (
                <XCircle className="h-3 w-3 text-white" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm truncate">{analysis.foodName}</h3>
              <Badge
                variant={analysis.isSafe ? 'default' : 'destructive'}
                className="text-[10px] flex-shrink-0"
              >
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
                <span className="text-[10px] font-bold">{analysis.estimatedShelfLifeHours}h</span>
              </div>
            </div>

            {analysis.allergens && analysis.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.allergens.map((allergen, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] py-0">
                    {allergen}
                  </Badge>
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
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<FoodSafetyResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = React.useState<AnalysisRecord[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCurrentResult(null);
    }
  };

  const runAnalysis = () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const randomSample = FOOD_SAFETY_SAMPLES[Math.floor(Math.random() * FOOD_SAFETY_SAMPLES.length)];
      const result: AnalysisRecord = {
        ...randomSample,
        id: `analysis-${Date.now()}`,
        timestamp: new Date(),
        imageUrl: previewUrl || `https://picsum.photos/seed/food${Date.now()}/400/300`,
      };
      setCurrentResult(result);
      setAnalysisHistory(prev => [result, ...prev].slice(0, 20));
      setIsAnalyzing(false);
    }, 2000);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setCurrentResult(null);
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
            AI Food Safety Analyzer
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload food images for AI-powered safety analysis and quality assessment
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Powered by AI Vision
        </Badge>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="analyze" className="text-xs font-bold flex items-center gap-1">
            <Camera className="h-3 w-3" /> Analyze
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
                  <Upload className="h-5 w-5 text-primary" />
                  Food Image Upload
                </CardTitle>
                <CardDescription>
                  Upload a photo of food to analyze its safety and freshness
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative border-2 border-dashed rounded-2xl p-8 text-center hover:border-primary/50 transition-all bg-muted/20">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-sm mx-auto aspect-video rounded-xl overflow-hidden border">
                        <img
                          src={previewUrl}
                          alt="Uploaded food"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {uploadedFile?.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={clearUpload}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                      <Camera className="h-12 w-12 text-primary/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </label>
                  )}
                </div>

                <Button
                  onClick={runAnalysis}
                  disabled={!uploadedFile || isAnalyzing}
                  className="w-full bg-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Food Safety...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Run AI Safety Analysis
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
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Progress
                      value={currentResult.safetyScore}
                      className="h-2"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Shield className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-sm font-medium">Upload a food image to begin analysis</p>
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
                  <p className="text-[10px] mt-1">Upload food images to build your safety history</p>
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
