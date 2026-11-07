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

    // Real-time Socket.io dispatch
    if (socket && connected) {
      socket.emit('send-message', {
        exchangeId: selectedExchange._id,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-ink-primary">
        <div className="flex items-baseline gap-3 sm:gap-4">
          <span className="chapter-num text-display-sm sm:text-display-md leading-none" aria-hidden="true">4</span>
          <h1 className="font-display font-medium text-display-sm sm:text-display-md tracking-[-0.02em] text-ink-primary">
            Direct Exchange Chat
          </h1>
        </div>
        <p className="text-base text-ink-secondary mt-2 max-w-2xl">
          Real-time 1-on-1 messaging with your accepted learning partners.
        </p>
      </div>

      {/* Main Split Chat Container */}
      <div className="bg-canvas-card border border-canvas-border border-t-2 border-t-ink-primary rounded-card overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] max-h-[750px] h-[calc(100vh-240px)]">
        {/* Left Column: Conversations List (hidden on mobile when thread is open) */}
        <div
          className={`md:col-span-4 lg:col-span-4 border-r border-canvas-border flex flex-col bg-canvas ${
            showMobileThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-3.5 border-b border-canvas-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-ink-secondary numerals">
              Conversations ({exchanges.length})
            </h2>
            {connected ? (
              <span className="inline-flex items-center gap-1 text-xs text-status-success font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                Live
              </span>
            ) : (
              <span className="text-xs text-ink-muted">Polling</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-canvas-border">
            {loadingExchanges ? (
              <div className="p-4 space-y-3">
                <Skeleton variant="text" count={4} />
              </div>
            ) : exchanges.length === 0 ? (
              <div className="p-6 text-sm text-ink-muted leading-relaxed">
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
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 select-none border-l-2 ${
                      isSelected
                        ? 'bg-canvas-card border-brand-teal'
                        : 'border-transparent hover:bg-canvas-card'
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
                        <span className="font-display font-medium text-base text-ink-primary truncate">
                          {partner?.name}
                        </span>
                        <span className="text-xs text-ink-muted numerals flex-shrink-0">
                          {new Date(ex.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-secondary truncate">
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
          className={`md:col-span-8 lg:col-span-8 flex flex-col bg-canvas-card min-w-0 ${
            !showMobileThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedExchange && currentPartner ? (
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 border-b border-canvas-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setShowMobileThread(false)}
                    className="md:hidden p-1 rounded-button text-ink-muted hover:text-ink-primary"
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
                    <h2 className="font-display font-medium text-lg leading-snug text-ink-primary truncate">
                      {currentPartner?.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-ink-secondary mt-0.5 min-w-0">
                      <span className="flex-shrink-0">{currentPartner?.location || 'Remote'}</span>
                      <span className="text-ink-faint" aria-hidden="true">/</span>
                      <span className="text-teach-text font-medium truncate">
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
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-canvas/60">
                {loadingMessages ? (
                  <div className="p-8 text-center">
                    <Skeleton variant="text" count={3} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-ink-muted text-sm">
                    <div className="w-10 h-10 border border-ink-primary text-brand-teal flex items-center justify-center mb-3" aria-hidden="true">
                      <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="font-display font-medium text-ink-primary text-title">
                      Start the Conversation
                    </div>
                    <p className="mt-1.5 max-w-xs text-ink-secondary leading-relaxed">
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
                          <div className="flex items-center gap-3 my-5">
                            <span className="h-px flex-1 bg-canvas-border" aria-hidden="true" />
                            <span className="font-display italic text-sm text-ink-muted">
                              {daySeparator}
                            </span>
                            <span className="h-px flex-1 bg-canvas-border" aria-hidden="true" />
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
                            className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2 text-[15px] leading-relaxed ${
                              isOwn
                                ? 'bg-ink-primary text-white border border-ink-primary rounded-card'
                                : 'bg-canvas-card text-ink-primary border border-canvas-border-dark rounded-card'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div
                              className={`flex items-center gap-1 justify-end text-xs mt-1 ${
                                isOwn ? 'text-white/70' : 'text-ink-muted'
                              }`}
                            >
                              <span>{formatTime(msg.createdAt)}</span>
                              {isOwn && (
                                <Check className="w-3 h-3 text-white/70" strokeWidth={2} />
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
                className="p-3 border-t border-canvas-border flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${currentPartner.name.split(' ')[0]}...`}
                  value={newMessageText}
                  maxLength={2000}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 min-w-0 px-3.5 py-2 text-[15px] bg-canvas border border-canvas-border-dark rounded-input text-ink-primary placeholder-ink-muted hover:border-ink-muted focus-ring transition-colors"
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
            <div className="h-full flex items-center justify-center p-8 text-center font-display italic text-lg text-ink-muted">
              Select an exchange partner from the left panel to begin chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
