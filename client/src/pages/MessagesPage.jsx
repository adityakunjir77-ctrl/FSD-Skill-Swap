import React, { useState, useEffect, useRef } from 'react';
import { getUserExchanges } from '../services/exchangeService';
import { getMessagesByExchange, sendMessage as sendMessageApi } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  ArrowRightLeft,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const { socket, connected } = useSocket();
  const { error } = useToast();
  const navigate = useNavigate();

  const [exchanges, setExchanges] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingExchanges, setLoadingExchanges] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMobileThread, setShowMobileThread] = useState(false);

  const chatBottomRef = useRef(null);

  // Fetch all accepted exchanges on load
  useEffect(() => {
    fetchAcceptedExchanges();
  }, []);

  // Fetch messages when conversation changes & join socket room
  useEffect(() => {
    if (selectedExchange) {
      fetchChatMessages(selectedExchange._id);

      if (socket) {
        socket.emit('join-exchange-room', selectedExchange._id);
      }

      return () => {
        if (socket) {
          socket.emit('leave-exchange-room', selectedExchange._id);
        }
      };
    }
  }, [selectedExchange, socket]);

  // Real-time socket message listener
  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (incomingMsg) => {
        if (selectedExchange && incomingMsg.exchange === selectedExchange._id) {
          setMessages((prev) => [...prev, incomingMsg]);
          scrollToBottom();
        }
      };

      socket.on('receive-message', handleReceiveMessage);

      return () => {
        socket.off('receive-message', handleReceiveMessage);
      };
    }
  }, [socket, selectedExchange]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchAcceptedExchanges = async () => {
    setLoadingExchanges(true);
    try {
      const res = await getUserExchanges();
      if (res.success) {
        const active = (res.data.all || []).filter(
          (ex) =>
            ex.status === 'Accepted' ||
            ex.status === 'In Progress' ||
            ex.status === 'Completed'
        );
        setExchanges(active);
        if (active.length > 0) {
          setSelectedExchange(active[0]);
        }
      }
    } catch (err) {
      error('Failed to load active exchange partners');
    } finally {
      setLoadingExchanges(false);
    }
  };

  const fetchChatMessages = async (exchangeId) => {
    setLoadingMessages(true);
    try {
      const res = await getMessagesByExchange(exchangeId);
      if (res.success) {
        setMessages(res.data || []);
        scrollToBottom();
      }
    } catch (err) {
      error('Failed to load chat history');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedExchange) return;

    const content = newMessageText.trim();
    setNewMessageText('');

    const isSender = selectedExchange.sender._id === currentUser._id;
    const receiverId = isSender
      ? selectedExchange.receiver._id
      : selectedExchange.sender._id;

    // Real-time Socket.io dispatch
    if (socket && connected) {
      socket.emit('send-message', {
        exchangeId: selectedExchange._id,
        senderId: currentUser._id,
        receiverId,
        content,
      });
    } else {
      // Fallback REST API
      try {
        const res = await sendMessageApi({
          exchangeId: selectedExchange._id,
          content,
        });
        if (res.success) {
          setMessages((prev) => [...prev, res.data]);
          scrollToBottom();
        }
      } catch (err) {
        error('Failed to send message');
      }
    }
  };

  // Helper to format timestamps and day separators
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaySeparator = (dateStr, prevDateStr) => {
    const d1 = new Date(dateStr).toDateString();
    const d2 = prevDateStr ? new Date(prevDateStr).toDateString() : null;
    if (d1 === d2) return null;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (d1 === today) return 'Today';
    if (d1 === yesterday) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const currentPartner = selectedExchange
    ? selectedExchange.sender._id === currentUser._id
      ? selectedExchange.receiver
      : selectedExchange.sender
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-canvas-border">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-teal" />
          Direct Exchange Chat
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Real-time 1-on-1 messaging with your accepted learning partners.
        </p>
      </div>

      {/* Main Split Chat Container */}
      <div className="bg-canvas-card border border-canvas-border rounded-card shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] max-h-[750px] h-[calc(100vh-240px)]">
        {/* Left Column: Conversations List (hidden on mobile when thread is open) */}
        <div
          className={`md:col-span-4 lg:col-span-4 border-r border-canvas-border flex flex-col bg-canvas-subtle/50 ${
            showMobileThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-canvas-border bg-white flex items-center justify-between">
            <h2 className="font-heading font-bold text-xs text-ink-muted uppercase tracking-wider">
              Conversations ({exchanges.length})
            </h2>
            {connected ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-status-success font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                Live
              </span>
            ) : (
              <span className="text-[11px] text-ink-muted">Polling</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-canvas-border/60">
            {loadingExchanges ? (
              <div className="p-4 space-y-3">
                <Skeleton variant="text" count={4} />
              </div>
            ) : exchanges.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted">
                No active conversations yet. Accept an exchange request to start chatting!
              </div>
            ) : (
              exchanges.map((ex) => {
                const isSender = ex.sender._id === currentUser._id;
                const partner = isSender ? ex.receiver : ex.sender;
                const isSelected = selectedExchange?._id === ex._id;

                const youTeach = isSender ? ex.offeredSkill : ex.wantedSkill;
                const theyTeach = isSender ? ex.wantedSkill : ex.offeredSkill;

                return (
                  <button
                    key={ex._id}
                    type="button"
                    onClick={() => {
                      setSelectedExchange(ex);
                      setShowMobileThread(true);
                    }}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-white border-l-3 border-brand-teal shadow-soft'
                        : 'hover:bg-canvas-subtle'
                    }`}
                  >
                    <Avatar
                      src={partner?.avatar}
                      name={partner?.name}
                      id={partner?._id}
                      size="md"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-heading font-bold text-xs text-ink-primary truncate">
                          {partner?.name}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          {new Date(ex.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-ink-secondary truncate">
                        <span className="text-teach-text font-medium truncate">
                          {theyTeach}
                        </span>
                        <span>↔</span>
                        <span className="text-learn-text font-medium truncate">
                          {youTeach}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Thread */}
        <div
          className={`md:col-span-8 lg:col-span-8 flex flex-col bg-white ${
            !showMobileThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedExchange && currentPartner ? (
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 border-b border-canvas-border flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setShowMobileThread(false)}
                    className="md:hidden p-1 rounded text-ink-muted hover:text-ink-primary"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <Avatar
                    src={currentPartner?.avatar}
                    name={currentPartner?.name}
                    id={currentPartner?._id}
                    size="sm"
                  />

                  <div className="min-w-0">
                    <h2 className="font-heading font-bold text-sm text-ink-primary truncate">
                      {currentPartner?.name}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-ink-secondary mt-0.5">
                      <span>{currentPartner?.location || 'Remote'}</span>
                      <span>•</span>
                      <span className="text-teach-text font-medium">
                        Swapping: {selectedExchange.offeredSkill} ↔ {selectedExchange.wantedSkill}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/profile/${currentPartner._id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>

              {/* Messages Thread Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-canvas/40">
                {loadingMessages ? (
                  <div className="p-8 text-center">
                    <Skeleton variant="text" count={3} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-ink-muted text-xs">
                    <div className="w-12 h-12 rounded-full bg-teach-bg text-brand-teal flex items-center justify-center mb-2">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="font-heading font-semibold text-ink-primary text-sm">
                      Start the Conversation
                    </div>
                    <p className="mt-1 max-w-xs text-ink-secondary">
                      Say hello to {currentPartner.name}! Discuss your availability, exchange goals, and session format.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn =
                      msg.sender?._id === currentUser?._id ||
                      msg.sender === currentUser?._id;

                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const daySeparator = getDaySeparator(
                      msg.createdAt,
                      prevMsg?.createdAt
                    );

                    return (
                      <React.Fragment key={msg._id || idx}>
                        {daySeparator && (
                          <div className="flex items-center justify-center my-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-medium bg-canvas-subtle text-ink-muted border border-canvas-border">
                              {daySeparator}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2 ${
                            isOwn ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isOwn && (
                            <Avatar
                              src={currentPartner?.avatar}
                              name={currentPartner?.name}
                              id={currentPartner?._id}
                              size="xs"
                              className="mb-1"
                            />
                          )}

                          <div
                            className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                              isOwn
                                ? 'bg-teach-bg text-ink-primary border border-teach-border rounded-card rounded-br-none'
                                : 'bg-white text-ink-primary border border-canvas-border rounded-card rounded-bl-none shadow-soft'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div
                              className={`flex items-center gap-1 justify-end text-[10px] mt-1 ${
                                isOwn ? 'text-teach-text' : 'text-ink-muted'
                              }`}
                            >
                              <span>{formatTime(msg.createdAt)}</span>
                              {isOwn && (
                                <Check className="w-3 h-3 text-teach-text" strokeWidth={2} />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Tidy Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-canvas-border bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${currentPartner.name.split(' ')[0]}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-canvas-subtle/70 border border-canvas-border rounded-input text-ink-primary placeholder-ink-muted focus-ring transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newMessageText.trim()}
                  icon={Send}
                  aria-label="Send message"
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-xs text-ink-muted">
              Select an exchange partner from the left panel to begin chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
