'use client';

import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/ChatInterface';
import { ToastContainer } from '@/components/Toast';
import { Navigation } from '@/components/Navigation';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      <Navigation />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 max-w-4xl mx-auto w-full relative"
      >
        <ChatInterface />
      </motion.div>

      <ToastContainer />
    </div>
  );
}
