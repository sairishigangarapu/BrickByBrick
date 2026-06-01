'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  users: { email: string; full_name: string } | { email: string; full_name: string }[] | null;
  contact_replies?: { reply: string; created_at: string }[];
}

interface AdminContactClientProps {
  initialMessages: Message[];
}

export default function AdminContactClient({ initialMessages }: AdminContactClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.status === filter);

  function getUser(obj: Message['users']) {
    if (!obj) return { full_name: 'Anonymous', email: '' };
    if (Array.isArray(obj)) return { full_name: obj[0]?.full_name || 'Anonymous', email: obj[0]?.email || '' };
    return { full_name: obj.full_name || 'Anonymous', email: obj.email || '' };
  }

  async function sendReply() {
    if (!selectedMessage || !replyText.trim()) return;
    setSending(true);

    try {
      const res = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: selectedMessage.id, reply: replyText }),
      });

      if (!res.ok) throw new Error('Failed to send');

      const newReply = { reply: replyText, created_at: new Date().toISOString() };
      
      setMessages(prev => prev.map(m => 
        m.id === selectedMessage.id 
          ? { ...m, status: 'open', contact_replies: [...(m.contact_replies || []), newReply] }
          : m
      ));
      
      setSelectedMessage(prev => prev ? { ...prev, status: 'open', contact_replies: [...(prev.contact_replies || []), newReply] } : null);
      setReplyText('');
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Support Inbox</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'open', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-full ${filter === status ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 font-bold text-sm uppercase tracking-wider">Tickets</div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <p className="p-4 text-gray-500 text-center text-sm">No tickets found.</p>
            ) : (
              filteredMessages.map(msg => {
                const sender = getUser(msg.users);
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left p-4 hover:bg-gray-50 ${selectedMessage?.id === msg.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm truncate">{sender.full_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        msg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        msg.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <div className="text-sm font-medium truncate">{msg.subject}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(msg.created_at).toLocaleDateString()}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 min-h-[600px]">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-lg">{selectedMessage.subject}</h2>
                <div className="text-sm text-gray-500">
                  From: {getUser(selectedMessage.users).full_name} ({getUser(selectedMessage.users).email})
                  <span className="ml-4">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">Original Message</div>
                  <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                </div>

                {selectedMessage.contact_replies?.map((reply, i) => (
                  <div key={i} className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-xs text-blue-600 mb-2">Admin Reply</div>
                    <p className="whitespace-pre-wrap text-sm">{reply.reply}</p>
                    <div className="text-xs text-gray-500 mt-2">{new Date(reply.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full border border-gray-200 p-3 h-24 focus:outline-none focus:ring-1 focus:ring-brand-primary mb-2"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2 bg-black text-white text-sm font-medium disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}