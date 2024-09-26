import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown"; // Import react-markdown
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatDisplayRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message) return;

    const userMessage = { sender: "user", text: message };
    setChat([...chat, userMessage]);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: message }],
              },
              {
                role: "model",
                parts: [{ text: "" }],
              },
            ],
            systemInstruction: {
              role: "user",
              parts: [{ text: "long" }],
            },
            generationConfig: {
              temperature: 1,
              topK: 64,
              topP: 0.95,
              maxOutputTokens: 8192,
              responseMimeType: "text/plain",
            },
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        const botMessage = {
          sender: "bot",
          text:
            data.candidates[0].content?.parts[0]?.text ?? "Sorry, I couldn't understand that. Could you please rephrase?",
          media: data.media,
          type: data.type,
        };

        console.log("Bot Message:", botMessage);
        setChat((prevChat) => [...prevChat, botMessage]);
      } else {
        console.error("Error interacting with the chatbot API:", data.error);
        setChat((prevChat) => [
          ...prevChat,
          {
            sender: "bot",
            text: "There was an error processing your request.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error interacting with the chatbot API:", error);
      setChat((prevChat) => [
        ...prevChat,
        { sender: "bot", text: "There was an error processing your request." },
      ]);
    }

    setMessage("");
  };

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="App">
      <h1 className="tima-sage">
        <span className="tima">Tima</span>
        <span className="sage">SAGE</span>
      </h1>

      <div className="chat-display" ref={chatDisplayRef}>
        {chat.map((entry, index) => (
          <div key={index} className="message-wrapper">
            {entry.sender === "user" ? (
              <div className="user-message">{entry.text}</div>
            ) : (
              <div className="bot-message">
                <ReactMarkdown>{entry.text}</ReactMarkdown> {/* Use ReactMarkdown here */}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about lesson plans, quizzes, or explanations..."
          rows="2"
        />
        <button type="submit" disabled={!message.trim()}>
          <i className="fas fa-paper-plane icon"></i>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
