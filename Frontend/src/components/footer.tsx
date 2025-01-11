'use client';

import Link from 'next/link';
import { Heart, Share2, MessageSquarePlus, Github, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Footer() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ScienceProves.me',
          text: 'Win arguments with real science - no more "trust me bro" moments!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSuggestFeature = () => {
    window.location.href = 'https://github.com/Bilalkamal/ScienceProves.Me/issues';
  };

  return (
    <footer className="relative border-t border-border/40">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-accent/5 dark:to-primary/5 opacity-50" />
      
      <div className="container mx-auto px-4 py-6 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left section - Branding */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <Link 
              href="https://github.com/Bilalkamal" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Bilal
            </Link>
            <span className="mx-2">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          {/* Right section - Actions and Social links */}
          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground hover:text-foreground"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share this amazing tool!</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground hover:text-foreground"
                    onClick={handleSuggestFeature}
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Suggest
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Suggest features or report bugs on GitHub</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="h-4 w-px bg-border/50" /> 

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="https://github.com/Bilalkamal/ScienceProves.Me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent/50"
                  >
                    <Github className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Visit our GitHub</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="mailto:Hello@ScienceProves.Me"
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent/50"
                  >
                    <Mail className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Email us</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </footer>
  );
}