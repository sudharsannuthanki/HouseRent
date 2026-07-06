import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getConversation, sendChatMessage } from "../../api";
import { getUser } from "../../auth";
import { formatINRShort } from "../../utils/formatCurrency";
import Toast from "../common/Toast";

const POLL_INTERVAL_MS = 4000;

function ChatRoom() {
  const { bookingId } = useParams();
  const me = getUser();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  async function loadConversation(showSpinner = false) {
    try {
      if (showSpinner) setIsLoading(true);
      const data = await getConversation(bookingId);
      setConversation(data.booking);
      setMessages(data.messages);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }

  useEffect(() => {
    loadConversation(true);
    pollRef.current = setInterval(() => loadConversation(false), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    try {
      setIsSending(true);
      const message = await sendChatMessage(bookingId, text);
      setMessages((current) => [...current, message]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) return <p className="container">Loading conversation...</p>;
  if (error && !conversation) return <p className="container empty-state">{error}</p>;
  if (!conversation) return null;

  const otherPartyName = me?.role === "owner" ? conversation.renter?.name : conversation.property?.owner?.name;

  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <div className="glass-card chat-shell">
        <div className="chat-header">
          <div>
            <Link to={`/properties/${conversation.property._id}`} className="chat-header-title">
              {conversation.property.title}
            </Link>
            <p className="chat-header-sub">
              {conversation.property.city} &middot; {formatINRShort(conversation.property.price)}
              {conversation.property.listingType === "rent" ? " / month" : ""}
            </p>
          </div>
          <span className={`badge ${conversation.status}`}>{conversation.status}</span>
        </div>

        <p className="chat-with">Chatting with <strong>{otherPartyName || "the other party"}</strong></p>

        <Toast message={error} type="error" />

        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet. Say hello!</p>
          ) : (
            messages.map((message) => {
              const isMine = message.sender?._id === me?.id;
              return (
                <div key={message._id} className={`chat-bubble-row ${isMine ? "mine" : ""}`}>
                  <div className={`chat-bubble ${isMine ? "mine" : "theirs"}`}>
                    <p className="chat-bubble-text">{message.text}</p>
                    <span className="chat-bubble-time">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-row">
          <input
            type="text"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={2000}
          />
          <button className="btn" type="submit" disabled={isSending || !draft.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;
