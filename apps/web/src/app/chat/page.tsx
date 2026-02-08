'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { ToastContainer } from '@/components/Toast';
import { Navigation } from '@/components/Navigation';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <ChatInterface />
      </div>
      <ToastContainer />
    </div>
  );
}
