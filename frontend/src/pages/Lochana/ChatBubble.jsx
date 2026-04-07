import { useState, useEffect, useRef } from "react";
import * as itemService from "../../services/itemService";
import { getImageUrl } from "../../services/itemService";
import { toast } from "react-toastify";

const ChatBubble = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active chat
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Load conversations when panel opens
  useEffect(() => {
    if (open && !activeConvo) {
      fetchConversations();
    }
  }, [open]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await itemService.getMyConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (convo) => {
    setActiveConvo(convo);
    setChatLoading(true);
    try {
      const data = await itemService.getConversation(convo.item._id);
      setMessages(Array.isArray(data) ? data : []);
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        150,
      );
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvo) return;
    // Find the other participant
    const otherUser = messages.find((m) => m.sender?._id !== user?._id);
    if (!otherUser) return;
    setSending(true);
    try {
      const msg = await itemService.sendMessage({
        itemListingId: activeConvo.item._id,
        receiverId: otherUser.sender._id,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      console.error("Failed to send:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const goBack = () => {
    setActiveConvo(null);
    setMessages([]);
    setNewMessage("");
    fetchConversations();
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Chat panel */}
      {open && (
        <div className="mb-3 w-[340px] bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-between shrink-0">
            {activeConvo ? (
              <div className="flex items-center space-x-2 min-w-0">
                <button
                  onClick={goBack}
                  className="text-white/80 hover:text-white transition-colors mr-1"
                >
                  <i className="fas fa-arrow-left text-sm"></i>
                </button>
                <div className="w-6 h-6 rounded-lg bg-white/20 overflow-hidden flex-shrink-0">
                  {activeConvo.item?.images?.[0] ? (
                    <img
                      src={getImageUrl(activeConvo.item.images[0])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-box text-white/40 text-[8px]"></i>
                    </div>
                  )}
                </div>
                <span className="text-white font-semibold text-sm truncate">
                  {activeConvo.item?.title}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <i className="fas fa-comments text-white"></i>
                <span className="text-white font-semibold text-sm">
                  My Chats
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setOpen(false);
                setActiveConvo(null);
                setMessages([]);
                setNewMessage("");
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Content */}
          {!activeConvo ? (
            /* Conversations list */
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-10">
                  <i className="fas fa-spinner fa-spin text-xl text-blue-400"></i>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    <i className="fas fa-comment-slash text-lg text-green-200/20"></i>
                  </div>
                  <p className="text-sm text-white">No conversations yet</p>
                  <p className="text-xs text-green-200/40 mt-1">
                    Messages will appear here
                  </p>
                </div>
              ) : (
                conversations.map((convo, idx) => (
                  <button
                    key={convo.item?._id || idx}
                    onClick={() => openConversation(convo)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                      {convo.item?.images?.[0] ? (
                        <img
                          src={getImageUrl(convo.item.images[0])}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-box text-green-200/20"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {convo.item?.title}
                      </p>
                      <p className="text-[11px] text-green-200/40 truncate">
                        {convo.lastMessage?.sender?.username}:{" "}
                        {convo.lastMessage?.content}
                      </p>
                    </div>
                    <span className="text-[10px] text-green-200/30 flex-shrink-0">
                      {convo.lastMessage?.createdAt &&
                        timeAgo(convo.lastMessage.createdAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Active conversation */
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                {chatLoading ? (
                  <div className="text-center py-10">
                    <i className="fas fa-spinner fa-spin text-xl text-blue-400"></i>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-green-200/40">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?._id === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                            isMe
                              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-md"
                              : "bg-white/10 text-white rounded-bl-md"
                          }`}
                        >
                          {!isMe && (
                            <p className="text-[10px] text-cyan-300/60 font-medium mb-0.5">
                              {msg.sender?.username}
                            </p>
                          )}
                          <p className="text-[13px]">{msg.content}</p>
                          <p
                            className={`text-[9px] mt-0.5 ${isMe ? "text-white/50" : "text-green-200/30"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              {/* Reply input */}
              {messages.length > 0 && (
                <div className="px-4 py-2.5 border-t border-white/10 shrink-0">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a reply..."
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-green-200/30 focus:outline-none focus:border-blue-400/40"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl disabled:opacity-40 transition-all"
                    >
                      {sending ? (
                        <i className="fas fa-spinner fa-spin text-sm"></i>
                      ) : (
                        <i className="fas fa-paper-plane text-sm"></i>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          open
            ? "bg-gradient-to-r from-blue-700 to-cyan-600 rotate-0"
            : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-110"
        }`}
        style={{ boxShadow: "0 4px 24px rgba(59, 130, 246, 0.4)" }}
      >
        <i
          className={`fas ${open ? "fa-times" : "fa-comments"} text-white text-xl`}
        ></i>
      </button>
    </div>
  );
};

export default ChatBubble;
