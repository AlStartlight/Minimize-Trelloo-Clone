"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  UserCheck, 
  MessageSquare, 
  Send, 
  Check, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface ReviewPanelProps {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  boardName: string;
  onReviewComplete?: () => void;
}

interface AIReviewResult {
  status: 'success' | 'error';
  review?: {
    summary: string;
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      suggestion?: string;
    }>;
    bestPractices: string[];
    securityIssues: string[];
    performanceTips: string[];
  };
  error?: string;
}

export default function ReviewPanel({
  taskId,
  taskTitle,
  taskDescription,
  boardName,
  onReviewComplete,
}: ReviewPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('self');
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReview, setAiReview] = useState<AIReviewResult | null>(null);
  const [codeToReview, setCodeToReview] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [selfReviewNotes, setSelfReviewNotes] = useState('');
  const [testerEmail, setTesterEmail] = useState('');
  const [notificationChannel, setNotificationChannel] = useState<'discord' | 'telegram' | 'whatsapp'>('discord');

  const handleSelfReview = async () => {
    try {
      setIsReviewing(true);
      
      // Create review request
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          type: 'self',
          notes: selfReviewNotes,
          status: 'approved',
        }),
      });

      if (!response.ok) throw new Error('Failed to submit self-review');

      toast.success('Self-review submitted successfully');
      setSelfReviewNotes('');
      setIsOpen(false);
      onReviewComplete?.();
    } catch (error) {
      console.error('Self review error:', error);
      toast.error('Failed to submit self-review');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleAIReview = async () => {
    if (!codeToReview.trim()) {
      toast.error('Please enter code to review');
      return;
    }

    try {
      setIsReviewing(true);
      setAiReview(null);

      const response = await fetch('/api/review/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToReview,
          language,
          taskId,
          framework: 'next.js',
        }),
      });

      const result: AIReviewResult = await response.json();
      setAiReview(result);

      if (result.status === 'success') {
        toast.success('AI review completed');
      } else {
        toast.error(result.error || 'AI review failed');
      }
    } catch (error) {
      console.error('AI review error:', error);
      toast.error('Failed to get AI review');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSendToTester = async () => {
    try {
      setIsReviewing(true);

      // Create review request
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          type: 'tester',
          status: 'pending',
          channel: notificationChannel,
          recipientEmail: testerEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to send to tester');

      toast.success(`Review request sent via ${notificationChannel}`);
      setTesterEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Send to tester error:', error);
      toast.error('Failed to send review request');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsReviewing(true);
      
      const response = await fetch('/api/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: 'approved',
        }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('Task approved');
      setIsOpen(false);
      onReviewComplete?.();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve task');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsReviewing(true);
      
      const response = await fetch('/api/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: 'rejected',
        }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.success('Task rejected');
      setIsOpen(false);
      onReviewComplete?.();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject task');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review: {taskTitle}</DialogTitle>
          <DialogDescription>
            Choose how you want to review this task
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="self" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Self Review
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="h-4 w-4" />
              AI Agent
            </TabsTrigger>
            <TabsTrigger value="tester" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Send to Tester
            </TabsTrigger>
          </TabsList>

          {/* Self Review Tab */}
          <TabsContent value="self" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Review Notes</Label>
              <Textarea
                placeholder="Add your review notes here..."
                value={selfReviewNotes}
                onChange={(e) => setSelfReviewNotes(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSelfReview} disabled={isReviewing}>
                {isReviewing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Submit Review
              </Button>
            </div>
          </TabsContent>

          {/* AI Agent Tab */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Code to Review</Label>
              <Textarea
                placeholder="Paste your code here..."
                value={codeToReview}
                onChange={(e) => setCodeToReview(e.target.value)}
                className="min-h-[150px] font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <select
                value={language}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                className="w-full p-2 rounded-md border border-border bg-background"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>

            {/* AI Review Results */}
            {aiReview && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  {aiReview.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h4 className="font-medium">AI Review Results</h4>
                </div>

                {aiReview.review && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {aiReview.review.summary}
                      </p>
                    </div>

                    {aiReview.review.issues.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Issues Found</h5>
                        {aiReview.review.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-sm ${
                              issue.severity === 'error'
                                ? 'bg-red-500/10 border border-red-500/20'
                                : issue.severity === 'warning'
                                ? 'bg-yellow-500/10 border border-yellow-500/20'
                                : 'bg-blue-500/10 border border-blue-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{issue.severity}</span>
                              {issue.line && <span className="text-muted-foreground">Line {issue.line}</span>}
                            </div>
                            <p className="mt-1">{issue.message}</p>
                            {issue.suggestion && (
                              <p className="mt-1 text-muted-foreground">💡 {issue.suggestion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {aiReview.review.bestPractices.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm">Best Practices</h5>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {aiReview.review.bestPractices.map((bp, idx) => (
                            <li key={idx}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAIReview} disabled={isReviewing || !codeToReview.trim()}>
                {isReviewing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                Run AI Review
              </Button>
            </div>
          </TabsContent>

          {/* Send to Tester Tab */}
          <TabsContent value="tester" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Notification Channel</Label>
              <div className="flex gap-2">
                <Button
                  variant={notificationChannel === 'discord' ? 'default' : 'outline'}
                  onClick={() => setNotificationChannel('discord')}
                  className="flex-1"
                >
                  Discord
                </Button>
                <Button
                  variant={notificationChannel === 'telegram' ? 'default' : 'outline'}
                  onClick={() => setNotificationChannel('telegram')}
                  className="flex-1"
                >
                  Telegram
                </Button>
                <Button
                  variant={notificationChannel === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setNotificationChannel('whatsapp')}
                  className="flex-1"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tester Email</Label>
              <input
                type="email"
                placeholder="tester@example.com"
                value={testerEmail}
                onChange={(e) => setTesterEmail(e.target.value)}
                className="w-full p-2 rounded-md border border-border bg-background"
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                📨 A review link will be sent to the tester via {notificationChannel}. 
                They can approve or reject the task after reviewing it.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendToTester} disabled={isReviewing || !testerEmail.trim()}>
                {isReviewing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send for Review
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex justify-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
            onClick={handleApprove}
            disabled={isReviewing}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve Task
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            onClick={handleReject}
            disabled={isReviewing}
          >
            <X className="h-4 w-4 mr-2" />
            Reject Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
