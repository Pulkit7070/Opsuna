'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { ToastContainer } from '@/components/Toast';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-surface-dark">
      <div className="max-w-4xl mx-auto h-screen">
        <ChatInterface />
      </div>
      <ToastContainer />
    </div>
  );
}
