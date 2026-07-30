'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Complaint } from '@/lib/types';
import { mockComplaints } from '@/lib/data';
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Filter,
  Plus,
  Eye,
  FileText,
  Upload,
  Loader2,
  Search,
  X,
} from 'lucide-react';

type ComplaintStatus = Complaint['status'];
type ComplaintType = Complaint['type'];
type ComplaintPriority = Complaint['priority'];

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  open: { label: 'Open', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-950', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-950', icon: Clock },
  resolved: { label: 'Resolved', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-950', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800', icon: CheckCircle2 },
};

const TYPE_CONFIG: Record<ComplaintType, { label: string; color: string; bgColor: string }> = {
  food_quality: { label: 'Food Quality', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-950' },
  delivery: { label: 'Delivery', color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  service: { label: 'Service', color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-950' },
  safety: { label: 'Safety', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-950' },
  other: { label: 'Other', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
};

const PRIORITY_CONFIG: Record<ComplaintPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-950' },
  high: { label: 'High', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-950' },
};

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

function StatCard({ title, value, icon: Icon, color, bgColor }: {
  title: string; value: number; icon: React.ElementType; color: string; bgColor: string;
}) {
  return (
    <Card className="shadow-sm border-none bg-card/50 hover:shadow-md transition-all">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComplaintDetailDialog({ complaint, open, onOpenChange }: {
  complaint: Complaint | null; open: boolean; onOpenChange: (open: boolean) => void;
}) {
  if (!complaint) return null;

  const statusConfig = STATUS_CONFIG[complaint.status];
  const typeConfig = TYPE_CONFIG[complaint.type];
  const priorityConfig = PRIORITY_CONFIG[complaint.priority];
  const StatusIcon = statusConfig.icon;

  const timeAgo = React.useMemo(() => {
    const now = Date.now();
    const created = complaint.createdAt.toMillis();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, [complaint.createdAt]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            Complaint Details
          </DialogTitle>
          <DialogDescription>{complaint.id} - Filed {timeAgo}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-none text-xs font-bold`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={`text-xs font-bold ${typeConfig.color}`}>
              {typeConfig.label}
            </Badge>
            <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} border-none text-xs font-bold`}>
              {priorityConfig.label} Priority
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Subject</p>
            <p className="text-sm font-medium">{complaint.subject}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</p>
            <p className="text-sm leading-relaxed">{complaint.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filed By</p>
              <p className="text-sm">{complaint.userName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filed On</p>
              <p className="text-sm">{complaint.createdAt.toDate().toLocaleDateString()}</p>
            </div>
          </div>
          {complaint.response && (
            <div className="space-y-2 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Admin Response</p>
              <p className="text-sm">{complaint.response}</p>
            </div>
          )}
          {complaint.resolvedAt && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolved on {complaint.resolvedAt.toDate().toLocaleDateString()}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewComplaintDialog({ open, onOpenChange, onSubmit }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Complaint> & { photos?: FileList }) => void;
}) {
  const [type, setType] = React.useState<ComplaintType | ''>('');
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<ComplaintPriority | ''>('');
  const [photos, setPhotos] = React.useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!type || !subject || !description || !priority) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    onSubmit({ type: type as ComplaintType, subject, description, priority: priority as ComplaintPriority });
    setType(''); setSubject(''); setDescription(''); setPriority(''); setPhotos(null);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const photoCount = photos?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-500" />
            File New Complaint
          </DialogTitle>
          <DialogDescription>Describe your issue and we will get back to you promptly.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type *</label>
              <Select value={type} onValueChange={(v) => setType(v as ComplaintType)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority *</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ComplaintPriority)}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject *</label>
            <Input placeholder="Brief summary of your complaint" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description *</label>
            <Textarea rows={4} placeholder="Provide detailed information about your complaint..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Photos (optional)</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>{photoCount > 0 ? photoCount + " file(s) selected" : "Attach photos"}</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => setPhotos(e.target.files)} />
              </label>
              {photoCount > 0 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPhotos(null)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            onClick={handleSubmit}
            disabled={!type || !subject || !description || !priority || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ComplaintCard({ complaint, onView }: {
  complaint: Complaint; onView: (c: Complaint) => void;
}) {
  const statusConfig = STATUS_CONFIG[complaint.status];
  const typeConfig = TYPE_CONFIG[complaint.type];
  const priorityConfig = PRIORITY_CONFIG[complaint.priority];
  const StatusIcon = statusConfig.icon;

  const timeAgo = React.useMemo(() => {
    const now = Date.now();
    const created = complaint.createdAt.toMillis();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, [complaint.createdAt]);

  return (
    <div
      className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer"
      onClick={() => onView(complaint)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-none text-[10px] px-2 py-0.5 font-bold`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-bold ${typeConfig.color} ${typeConfig.bgColor} border-none`}>
              {typeConfig.label}
            </Badge>
            <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} border-none text-[10px] px-2 py-0.5 font-bold`}>
              {priorityConfig.label}
            </Badge>
          </div>
          <p className="text-sm font-semibold truncate">{complaint.subject}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{complaint.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onView(complaint); }}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground font-mono">{complaint.id}</span>
        <span className="text-[10px] text-muted-foreground">by {complaint.userName}</span>
        {complaint.donationId && (
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-auto">{complaint.donationId}</Badge>
        )}
      </div>
    </div>
  );
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = React.useState<Complaint[]>(mockComplaints);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [detailComplaint, setDetailComplaint] = React.useState<Complaint | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const stats = React.useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === 'open').length;
    const inProgress = complaints.filter((c) => c.status === 'in_progress').length;
    const resolved = complaints.filter((c) => c.status === 'resolved').length;
    return { total, open, inProgress, resolved };
  }, [complaints]);

  const filteredComplaints = React.useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.subject.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [complaints, statusFilter, typeFilter, searchQuery]);

  const handleNewComplaint = React.useCallback((data: Partial<Complaint> & { photos?: FileList }) => {
    const newComplaint: Complaint = {
      id: "comp-" + String(complaints.length + 1).padStart(3, "0"),
      userId: "current-user",
      userName: "You",
      type: data.type!,
      subject: data.subject!,
      description: data.description!,
      status: "open",
      priority: data.priority!,
      createdAt: { toMillis: () => Date.now(), toDate: () => new Date() } as any,
    };
    setComplaints((prev) => [newComplaint, ...prev]);
  }, [complaints.length]);

  const handleViewComplaint = React.useCallback((complaint: Complaint) => {
    setDetailComplaint(complaint);
    setDetailOpen(true);
  }, []);

  return (
    <>
      <Header title="Complaints" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total" value={stats.total} icon={MessageSquare} color="text-orange-500" bgColor="bg-orange-100 dark:bg-orange-950" />
          <StatCard title="Open" value={stats.open} icon={AlertCircle} color="text-red-500" bgColor="bg-red-100 dark:bg-red-950" />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-yellow-600" bgColor="bg-yellow-100 dark:bg-yellow-950" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="text-green-500" bgColor="bg-green-100 dark:bg-green-950" />
        </div>

        {/* Filters & New Complaint */}
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                  Complaint List
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground mt-1">
                  {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Complaint
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Type Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50 rounded-xl mb-4">
                {STATUS_TABS.map((tab) => {
                  const count = tab.value === "all"
                    ? complaints.length
                    : complaints.filter((c) => c.status === tab.value).length;
                  return (
                    <TabsTrigger key={tab.value} value={tab.value} className="text-[10px] md:text-xs font-bold uppercase py-2.5">
                      {tab.label}
                      <Badge className="ml-1.5 bg-orange-500/10 text-orange-600 text-[8px] px-1 py-0 h-4 min-w-[16px] justify-center font-black">
                        {count}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={statusFilter} className="mt-0">
                <div className="space-y-3">
                  {filteredComplaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
                      <p className="text-sm font-medium">No complaints found</p>
                      <p className="text-xs mt-1">Try adjusting your filters or search query</p>
                    </div>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        onView={handleViewComplaint}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <NewComplaintDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleNewComplaint} />
      <ComplaintDetailDialog complaint={detailComplaint} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}
