import { useState } from "react";
import { GiFullMotorcycleHelmet } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_URL;

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am your RideLanka assistant. Ask me about bookings, vendor flows, admin actions, payments, or routes.",
    },
  ]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages }),
      });

      const data = await response.json();
      if (!response.ok) {
        const serverError = data?.error || "Chatbot service error";
        const detail = (data?.detail || "").toString();

        if (detail.includes("RESOURCE_EXHAUSTED") || detail.includes("Quota exceeded")) {
          throw new Error("Chatbot API quota exceeded. Please try again in a minute.");
        }

        throw new Error(`${serverError}${detail ? `: ${detail.slice(0, 180)}` : ""}`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "No response received." },
      ]);
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isNetworkError
            ? "I could not connect to the chatbot backend . Please start the Flask service and try again."
            : `Chatbot error: ${error.message}`,
        },
      ]);
      console.error("Chatbot error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          zIndex: 1200,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "#FF8C00",
          color: "white",
          fontSize: "22px",
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Open chatbot"
        title="Open chatbot"
      >
         <GiFullMotorcycleHelmet className="h-10 w-10"/>
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "90px",
            width: "360px",
            maxWidth: "calc(100vw - 24px)",
            height: "520px",
            maxHeight: "72vh",
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "16px",
            boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#0A2540",
              color: "#ffffff",
              padding: "12px 14px",
              fontWeight: 700,
            }}
          >
            RideLanka Chatbot
             <button
                onClick={() => setIsOpen(false)}
                type="submit"
                style={{
                position: "absolute",
                top: "12px",
                right: "14px",
                background: "transparent",
                }
                   
                }
                >
                    <IoMdClose />
                </button>
          </div>


          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  background: msg.role === "user" ? "#0f766e" : "#ffffff",
                  color: msg.role === "user" ? "#ffffff" : "#111827",
                  border:
                    msg.role === "user" ? "none" : "1px solid #e5e7eb",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.4,
                  fontSize: "14px",
                }}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "8px 10px",
                  fontSize: "13px",
                  color: "#4b5563",
                }}
              >
                Thinking...
              </div>
            )}
          </div>

          <form
            onSubmit={onSubmit}
            style={{
              display: "flex",
              gap: "8px",
              padding: "10px",
              borderTop: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about this platform..."
              style={{
                flex: 1,
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "10px",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "10px 14px",
                background: loading ? "#94a3b8" : "#007BFF" ,
                
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
            
              }}
            >
              Send
            </button>
           
          </form>
        </div>
      )}
    </>
  );
}
