"use client";
import { useState } from "react";

const contacts = [
  { id: 1, name: "Alice Smith" },
  { id: 2, name: "Bob Johnson" },
  { id: 3, name: "Charlie Lee" },
];

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messages, setMessages] = useState<{ [key: number]: string[] }>({});
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: [
        ...(prev[selectedContact.id] || []),
        input
      ]
    }));
    setInput("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", border: "1px solid #ccc" }}>
      {/* Contacts List */}
      <div style={{ width: "250px", borderRight: "1px solid #ddd", padding: "1rem" }}>
        <h2>Contacts</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {contacts.map(contact => (
            <li
              key={contact.id}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                background: selectedContact.id === contact.id ? "#f0f0f0" : "transparent"
              }}
              onClick={() => setSelectedContact(contact)}
            >
              <strong>{contact.name}</strong>
            </li>
          ))}
        </ul>
      </div>
      {/* Chat Window */}
      <div style={{ flex: 1, padding: "1rem", overflow: "auto", display: "flex", flexDirection: "column" }}>
        <h2>Chat with {selectedContact.name}</h2>
        <div style={{ flex: 1, marginBottom: "1rem", overflowY: "auto" }}>
          {(messages[selectedContact.id] || []).map((msg, idx) => (
            <div key={idx} style={{ margin: "0.5rem 0", textAlign: "right" }}>
              <div style={{ display: "inline-block", background: "#e0ffe0", padding: "0.5rem 1rem", borderRadius: "16px" }}>
                {msg}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          />
          <button
            onClick={handleSend}
            style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", border: "none", background: "#007bff", color: "#fff" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
