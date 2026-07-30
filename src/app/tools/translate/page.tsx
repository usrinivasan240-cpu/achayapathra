'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translateText } from '@/ai/flows/translate-flow';
import { Loader2, Languages, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TranslatePage() {
  const [text, setText] = React.useState('');
  const [targetLanguage, setTargetLanguage] = React.useState<'Tamil' | 'English'>('Tamil');
  const [translatedText, setTranslatedText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setTranslatedText('');
    try {
      const result = await translateText({ text, targetLanguage });
      setTranslatedText(result.translatedText);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: error.message || 'An error occurred during translation.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    setTargetLanguage(prev => prev === 'Tamil' ? 'English' : 'Tamil');
    if (translatedText) {
      setText(translatedText);
      setTranslatedText('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <Header title="Language Center" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <Languages className="h-6 w-6 text-primary" />
              Tamil-English Translator
            </CardTitle>
            <CardDescription>
              AI-powered translation for food descriptions, volunteer instructions, and community messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">
                  To:
                </span>
                <div className="flex items-center gap-2">
                  <Select value={targetLanguage} onValueChange={(v: any) => setTargetLanguage(v)}>
                    <SelectTrigger className="w-[160px] h-9 border-none bg-transparent font-semibold focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={swapLanguages} title="Swap languages and text" className="h-8 w-8">
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Textarea
                  placeholder={`Enter text to translate into ${targetLanguage === 'Tamil' ? 'Tamil' : 'English'}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="resize-none text-lg"
                />
              </div>

              <Button 
                onClick={handleTranslate} 
                disabled={isLoading || !text.trim()} 
                className="w-full h-12 text-lg font-bold shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Translate Text'
                )}
              </Button>
            </div>

            {translatedText && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Translation Result</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-2 text-xs"
                    onClick={handleCopy}
                  >
                    {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 font-medium text-lg min-h-[120px] whitespace-pre-wrap leading-relaxed shadow-inner">
                  {translatedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card className="bg-muted/30 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tamil language support helps connect with local donors and volunteers in Tamil Nadu, ensuring no language barrier in food distribution and hunger relief efforts.
                </p>
              </CardContent>
           </Card>
           <Card className="bg-muted/30 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4" />
                  Contextual AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Powered by Gemini 2.0 Flash, our translation model understands context, slang, and food-specific terminology (like "Sambar" or "Dry Ration") for high-quality results.
                </p>
              </CardContent>
           </Card>
        </div>
      </main>
    </>
  );
}
