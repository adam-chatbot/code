import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMsg = input;
    setMessages([...messages, { sender: 'user', text: userMsg }]);
    setInput('');

    const res = await fetch('http://a634f29b5785e4f52a75eb929cd2b534-572735873.us-west-2.elb.amazonaws.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });
    const { response } = await res.json();
    setMessages(prev => [...prev, { sender: 'bot', text: response }]);
  };

  return (
    <div>
      <div style={{ height: '400px', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
