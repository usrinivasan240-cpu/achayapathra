'use client';

import * as React from 'react';
import { useAppState } from '@/providers/app-state-provider';
import { useUser } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Smile, SmilePlus, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const moods: Array<{ id: 'happy' | 'neutral' | 'unhappy'; label: string; icon: React.ReactNode }> = [
  { id: 'happy', label: 'Loved it', icon: <SmilePlus className="h-5 w-5" /> },
  { id: 'neutral', label: 'It was okay', icon: <Smile className="h-5 w-5" /> },
  { id: 'unhappy', label: 'Needs improvement', icon: <Frown className="h-5 w-5" /> },
];

export default function FeedbackPage() {
  const { submitFeedback, getFeedbackByUser } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();

  const [mood, setMood] = React.useState<'happy' | 'neutral' | 'unhappy'>('happy');
  const [message, setMessage] = React.useState('');

  if (!user) {
    return null;
  }

  const entries = getFeedbackByUser(user.uid);

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({
        title: 'Add feedback',
        description: 'Share a quick note so the team knows what to improve.',
      });
      return;
    }
    submitFeedback({ userId: user.uid, message, mood });
    setMessage('');
    toast({ title: 'Thanks for sharing feedback!' });
  };

  return (
    <>
      <Header title="Feedback" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">Tell us about your experience</CardTitle>
            <CardDescription>
              Your comments go straight to the campus canteen council.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {moods.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMood(option.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    mood === option.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-600 hover:border-primary/40'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your message
              </label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share what went well and what could be better."
                rows={4}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full md:w-auto">
              Submit feedback
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Previous feedback</h2>
          {entries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-slate-500">
                Your recent feedback will appear here for easy reference.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card key={entry.id} className="border-slate-200">
                  <CardContent className="flex flex-col gap-2 py-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {entry.mood}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{entry.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
