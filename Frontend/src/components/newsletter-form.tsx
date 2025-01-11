'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function NewsletterForm() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (!mounted) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input 
        placeholder="Enter your email" 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit">Subscribe</Button>
    </form>
  );
}