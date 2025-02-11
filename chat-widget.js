import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://n8.prosesai.com/webhook/manychat_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          route: 'general',
        }),
      });

      const data = await response.json();
      
      // Add bot response
      const botMessage = {
        type: 'bot',
        content: data.response || 'Thank you for your message. We will get back to you soon.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#002752] text-white flex items-center justify-center shadow-lg hover:bg-[#001f42] transition-colors"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#002752] rounded-t-lg text-white">
            <div className="flex items-center gap-3">
              <img
                src="https://assets.zyrosite.com/dJo5B912eBsrJD3M/0_0000a1_-mnlqWPq6x6Uv4ZD4.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h3 className="font-semibold">ProsesAI</h3>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                <p className="font-medium">Hi 👋, how can we help?</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-[#002752] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#002752] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#002752] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 bg-[#002752] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002752]"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-2 bg-[#002752] text-white rounded-lg hover:bg-[#001f42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
