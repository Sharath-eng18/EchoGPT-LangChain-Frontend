import '../styles/ChatMessage.css';

const ChatMessage = ({ message }) => {
  const { role, content, timestamp, isError } = message;

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message ${role} ${isError ? 'error' : ''}`}>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">
            {role === 'user' ? '👤 You' : '🤖 AI Assistant'}
          </span>
          <span className="message-time">
            {formatTime(timestamp)}
          </span>
        </div>
        <div className="message-text">
          {content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
