import React, { useState, useEffect, useRef } from 'react';
import { getUserExchanges } from '../services/exchangeService';
import { getMessagesByExchange, sendMessage as sendMessageApi } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  ArrowRightLeft, 
  Loader2, 
  Check, 
  CheckCheck,
  BookOpen,
  Sparkles
} from 'lucide-react';

const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const { socket, connected } = useSocket();
  const { showNotification } = useNotification();

  const [exchanges, setExchanges] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingExchanges, setLoadingExchanges] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const chatBottomRef = useRef(null);

  // Fetch all accepted exchanges on load
  useEffect(() => {
    fetchAcceptedExchanges();
  }, []);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (selectedExchange) {
      fetchChatMessages(selectedExchange._id);

      // Join socket room
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
          (ex) => ex.status === 'Accepted' || ex.status === 'In Progress' || ex.status === 'Completed'
        );
        setExchanges(active);
        if (active.length > 0) {
          setSelectedExchange(active[0]);
        }
      }
    } catch (err) {
      showNotification('Failed to load active exchange partners', 'error');
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
      showNotification('Failed to load chat history', 'error');
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
    const receiverId = isSender ? selectedExchange.receiver._id : selectedExchange.sender._id;

    // Send via Socket.io for instant delivery
    if (socket && connected) {
      socket.emit('send-message', {
        exchangeId: selectedExchange._id,
        senderId: currentUser._id,
        receiverId,
        content,
      });
    } else {
      // Fallback REST API call
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
        showNotification('Failed to send message', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-indigo-600" /> Real-Time Chat Engine
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Direct WebSocket 1-on-1 communication with your accepted skill exchange partners.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[580px]">
        
        {/* Left Sidebar: Conversations List */}
        <div className="border-r border-gray-100 p-4 space-y-3 bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            Active Exchange Partners ({exchanges.length})
          </h3>

          {loadingExchanges ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading partners...</p>
            </div>
          ) : exchanges.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              No active exchange partners yet. Accept a skill request to start chatting!
            </div>
          ) : (
            <div className="space-y-1.5">
              {exchanges.map((ex) => {
                const isReceiver = ex.receiver._id === currentUser._id;
                const partner = isReceiver ? ex.sender : ex.receiver;
                const isSelected = selectedExchange?._id === ex._id;

                return (
                  <button
                    key={ex._id}
                    onClick={() => setSelectedExchange(ex)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-800 font-bold text-xs flex items-center justify-center border border-white shrink-0">
                      {partner.name ? partner.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>

                    <div className="truncate flex-grow">
                      <p className="font-bold text-sm truncate">{partner.name}</p>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>
                        {ex.offeredSkill} ⇄ {ex.wantedSkill}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Area: Chat Window */}
        <div className="md:col-span-2 flex flex-col justify-between bg-white">
          {selectedExchange ? (
            <>
              {/* Chat Header */}
              {(() => {
                const isReceiver = selectedExchange.receiver._id === currentUser._id;
                const partner = isReceiver ? selectedExchange.sender : selectedExchange.receiver;

                return (
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        {partner.name ? partner.name.slice(0, 2).toUpperCase() : 'US'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{partner.name}</h3>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-indigo-500" /> {selectedExchange.offeredSkill} 
                          <span>⇄</span> 
                          <Sparkles className="w-3 h-3 text-purple-500" /> {selectedExchange.wantedSkill}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-semibold text-emerald-600">WebSocket Live</span>
                    </div>
                  </div>
                );
              })()}

              {/* Chat Messages Body */}
              <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-3 bg-slate-50/50 max-h-[420px]">
                {loadingMessages ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading chat thread...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    No messages in this conversation yet. Send a hello! 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = (msg.sender?._id || msg.sender) === currentUser._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2 bg-white">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-gray-400 my-auto">
              Select an exchange partner from the left sidebar to start chatting.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessagesPage;
