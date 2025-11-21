'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getChatMessages, addChatMessage, subscribeToChatMessages } from '@/lib/firebase/firestore';
import { ChatMessage } from '@/types';
import { useUser } from '@/components/layout/UserProvider';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface StreamChatProps {
  cameraId: string;
}

export default function StreamChat({ cameraId }: StreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    // Initial fetch
    getChatMessages(cameraId).then(setMessages);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToChatMessages(cameraId, setMessages);

    return () => unsubscribe();
  }, [cameraId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to chat');
      return;
    }

    if (!newMessage.trim()) return;

    setIsLoading(true);

    try {
      await addChatMessage(cameraId, user.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg">
      {/* Chat Header */}
      <div className="p-4 border-b border-earth-200 dark:border-earth-800">
        <h3 className="font-semibold text-earth-900 dark:text-earth-50">Live Chat</h3>
        <p className="text-sm text-earth-600 dark:text-earth-400">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {message.user?.avatar_url ? (
                  <Image
                    src={message.user.avatar_url}
                    alt={message.user.full_name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-nature-500 flex items-center justify-center text-white text-sm font-semibold">
                    {message.user?.full_name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm text-earth-900 dark:text-earth-100">
                    {message.user?.full_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-earth-500">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-earth-700 dark:text-earth-300 break-words">
                  {message.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-earth-500 dark:text-earth-400 py-8">
            No messages yet. Be the first to chat!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-earth-200 dark:border-earth-800">
        {user ? (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 disabled:opacity-50"
            />
            <Button type="submit" variant="primary" disabled={isLoading || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="text-center text-sm text-earth-600 dark:text-earth-400">
            <a href="/auth/login" className="text-nature-600 dark:text-nature-400 hover:underline">
              Login
            </a>{' '}
            to join the chat
          </div>
        )}
      </div>
    </div>
  );
}
