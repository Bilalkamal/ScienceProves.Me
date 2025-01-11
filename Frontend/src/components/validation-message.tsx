'use client';

import { Card } from './ui/card';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  message: string;
}

export function ValidationMessage({ message }: ValidationMessageProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Validation Notice</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </Card>
  );
} 