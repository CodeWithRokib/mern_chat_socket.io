import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState({ username: 'User1', role: 'user' }); // Example user

  useEffect(() => {
    // Fetch messages from API
    const fetchMessages = async () => {
      const response = await axios.get('http://localhost:5000/api/messages');
      setMessages(response.data);
    };

    fetchMessages();

    // Listen for new messages
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    const newMessage = { sender: user._id, content: message };

    // Send message to API
    const response = await axios.post('http://localhost:5000/api/messages', newMessage);
    const savedMessage = response.data;

    // Emit message via Socket.io
    socket.emit('chat message', savedMessage);

    setMessage('');
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender.username}: </strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
