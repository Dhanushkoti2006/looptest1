'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, Heart } from 'lucide-react';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('Hi Loop & Love! I would like to ask about custom crochet orders 🌸');

  const phoneNumber = '919876543210'; // Loop & Love business support

  const handleSend = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Chat Popover */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Loop & Love Crochet</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  Typically replies within an hour
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-emerald-50/50 space-y-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs text-xs text-brand-900 border border-emerald-100">
              <p className="font-medium text-emerald-800 mb-1">Hello! 👋</p>
              <p>
                Have questions about our handmade bouquets, bags, or want to discuss a custom crochet design? Chat with us directly on WhatsApp!
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 text-brand-900 resize-none"
                placeholder="Type your message..."
              />
              <button
                onClick={handleSend}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Start WhatsApp Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-cozy-lg hover:scale-105 active:scale-95 transition-all focus:outline-none"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600"></span>
        </span>
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
}
