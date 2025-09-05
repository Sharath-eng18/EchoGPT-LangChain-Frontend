import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import '../styles/ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Backend API URL - use relative path for Vercel deployment
  const API_BASE_URL = "https://echogpt-langchain-backend.onrender.com/";

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'ai',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  }, []);

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare message history for the API
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role === 'ai' ? 'ai' : 'user',
        content: msg.content
      }));

      // Send request to backend API
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: messageHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Create AI message
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.content,
        timestamp: new Date()
      };

      // Add AI response to chat
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please check if the backend is running.');
      
      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'ai',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  return (
  <div className='chatbot-wrapper'>
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>AI ChatBot</h1>
        <button onClick={clearChat} className="clear-button">
          Clear Chat
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="dismiss-error">×</button>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}
        {isLoading && (
          <div className="loading-message">
            <div className="loading-indicator">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={sendMessage}
        disabled={isLoading}
      />
    </div>
  </div>
  );
};

export default ChatBot;
