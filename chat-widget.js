// Add required styles
const style = document.createElement('style');
style.textContent = `
  @import url('https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css');
  .chat-widget-container * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
`;
document.head.appendChild(style);

class ChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${style.textContent}
      </style>
      <div class="chat-widget-container fixed bottom-4 right-4 z-50">
        <button id="toggleBtn" class="w-14 h-14 rounded-full bg-[#002752] text-white flex items-center justify-center shadow-lg hover:bg-[#001f42] transition-colors">
          ${this.isOpen ? this.renderCloseIcon() : this.renderMessageIcon()}
        </button>
        
        ${this.isOpen ? this.renderChatWindow() : ''}
      </div>
    `;
  }

  renderMessageIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  }

  renderCloseIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  }

  renderSendIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
  }

  renderChatWindow() {
    return `
      <div class="absolute bottom-16 right-0 w-[350px] h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
        <div class="p-4 bg-[#002752] rounded-t-lg text-white">
          <div class="flex items-center gap-3">
            <img
              src="https://assets.zyrosite.com/dJo5B912eBsrJD3M/0_0000a1_-mnlqWPq6x6Uv4ZD4.png"
              alt="Logo"
              class="w-8 h-8 object-contain"
            />
            <div>
              <h3 class="font-semibold">ProsesAI</h3>
            </div>
          </div>
        </div>

        <div id="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          ${this.messages.length === 0 ? `
            <div class="text-center text-gray-500 mt-4">
              <p class="font-medium">Hi 👋, how can we help?</p>
            </div>
          ` : ''}
          
          ${this.messages.map(msg => this.renderMessage(msg)).join('')}
          
          ${this.isLoading ? this.renderLoadingIndicator() : ''}
        </div>

        <form id="chatForm" class="p-4 border-t">
          <div class="flex gap-2">
            <input
              type="text"
              id="messageInput"
              placeholder="Type your message..."
              class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002752]"
            />
            <button
              type="submit"
              class="p-2 bg-[#002752] text-white rounded-lg hover:bg-[#001f42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ${this.renderSendIcon()}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderMessage(msg) {
    return `
      <div class="flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[80%] p-3 rounded-lg ${
          msg.type === 'user'
            ? 'bg-[#002752] text-white'
            : 'bg-gray-100 text-gray-800'
        }">
          ${msg.content}
        </div>
      </div>
    `;
  }

  renderLoadingIndicator() {
    return `
      <div class="flex justify-start">
        <div class="p-3 flex items-center space-x-2">
          <div class="w-2 h-2 bg-[#002752] rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-[#002752] rounded-full animate-bounce" style="animation-delay: 200ms"></div>
          <div class="w-2 h-2 bg-[#002752] rounded-full animate-bounce" style="animation-delay: 400ms"></div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const toggleBtn = this.shadowRoot.getElementById('toggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        this.render();
      });
    }

    const form = this.shadowRoot.getElementById('chatForm');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const input = this.shadowRoot.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;

    input.value = '';
    this.messages.push({
      type: 'user',
      content: message,
      timestamp: new Date()
    });

    this.isLoading = true;
    this.render();

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
      
      this.messages.push({
        type: 'bot',
        content: data.response || 'Thank you for your message. We will get back to you soon.',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error:', error);
      this.messages.push({
        type: 'bot',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      });
    } finally {
      this.isLoading = false;
      this.render();
    }
  }
}

// Register the custom element
customElements.define('chat-widget', ChatWidget);
