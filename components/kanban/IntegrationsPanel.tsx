"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
  Github, 
  Gitlab, 
  Link2, 
  Unlink,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface IntegrationsPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ConnectionStatus {
  github: { connected: boolean; username?: string };
  gitlab: { connected: boolean; username?: string };
}

interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  provider: 'github' | 'gitlab';
  description?: string;
  language?: string;
}

export default function IntegrationsPanel({ open: externalOpen, onOpenChange }: IntegrationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    github: { connected: false },
    gitlab: { connected: false },
  });
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'github' | 'gitlab' | null>(null);

  const dialogOpen = externalOpen !== undefined ? externalOpen : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  useEffect(() => {
    // Check URL for connection success/error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('github_connected') === 'true') {
      toast.success('GitHub connected successfully!');
      setConnectionStatus(prev => ({ ...prev, github: { connected: true } }));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (urlParams.get('gitlab_connected') === 'true') {
      toast.success('GitLab connected successfully!');
      setConnectionStatus(prev => ({ ...prev, gitlab: { connected: true } }));
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Fetch existing connections
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/integrations/status');
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  };

  const handleConnect = (provider: 'github' | 'gitlab') => {
    setSelectedProvider(provider);
    // Open OAuth popup
    const authUrl = `/api/integrations/${provider}/connect`;
    window.location.href = authUrl;
  };

  const handleDisconnect = async (provider: 'github' | 'gitlab') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/integrations/${provider}/disconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`${provider} disconnected successfully`);
        setConnectionStatus(prev => ({
          ...prev,
          [provider]: { connected: false },
        }));
      } else {
        toast.error(`Failed to disconnect ${provider}`);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/repos');
      if (response.ok) {
        const data = await response.json();
        setRepositories(data);
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      toast.error('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Link2 className="h-4 w-4" />
          Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Repository Integrations</DialogTitle>
          <DialogDescription>
            Connect your GitHub or GitLab account to link repositories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* GitHub Connection */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Github className="h-8 w-8" />
              <div>
                <h4 className="font-medium">GitHub</h4>
                <p className="text-sm text-muted-foreground">
                  {connectionStatus.github.connected
                    ? `Connected${connectionStatus.github.username ? ` as ${connectionStatus.github.username}` : ''}`
                    : 'Not connected'}
                </p>
              </div>
            </div>
            {connectionStatus.github.connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect('github')}
                disabled={loading}
                className="gap-2"
              >
                <Unlink className="h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleConnect('github')}
                disabled={loading}
                className="gap-2"
              >
                {loading && selectedProvider === 'github' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                Connect
              </Button>
            )}
          </div>

          {/* GitLab Connection */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Gitlab className="h-8 w-8 text-orange-500" />
              <div>
                <h4 className="font-medium">GitLab</h4>
                <p className="text-sm text-muted-foreground">
                  {connectionStatus.gitlab.connected
                    ? `Connected${connectionStatus.gitlab.username ? ` as ${connectionStatus.gitlab.username}` : ''}`
                    : 'Not connected'}
                </p>
              </div>
            </div>
            {connectionStatus.gitlab.connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect('gitlab')}
                disabled={loading}
                className="gap-2"
              >
                <Unlink className="h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleConnect('gitlab')}
                disabled={loading}
                className="gap-2"
              >
                {loading && selectedProvider === 'gitlab' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Gitlab className="h-4 w-4" />
                )}
                Connect
              </Button>
            )}
          </div>

          {/* Repository List */}
          {(connectionStatus.github.connected || connectionStatus.gitlab.connected) && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Connected Repositories</h4>
                <Button variant="ghost" size="sm" onClick={fetchRepositories} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
              {repositories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click refresh to load repositories
                </p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {repo.provider === 'github' ? (
                          <Github className="h-4 w-4" />
                        ) : (
                          <Gitlab className="h-4 w-4 text-orange-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{repo.name}</p>
                          <p className="text-xs text-muted-foreground">{repo.fullName}</p>
                        </div>
                      </div>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Connect your GitHub or GitLab account</li>
              <li>Link tasks to repository issues</li>
              <li>Track commits and pull requests</li>
              <li>Support for both public and private repos</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
