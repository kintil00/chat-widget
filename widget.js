// Chat Widget Script
(function() {
    // Create and inject styles
    const styles = `
        /* Basic widget styles */
        .n8n-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }

        .chat-container {
            width: 350px;
            height: 500px;
            background-color: var(--n8n-chat-background-color, #ffffff);
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            font-family: 'Geist', sans-serif;
            color: var(--n8n-chat-font-color, #333333);
        }

        .chat-container.position-left {
            left: 20px;
            right: auto;
        }

        .chat-interface {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .brand-header {
            background-color: var(--n8n-chat-primary-color, #854fff);
            color: #ffffff;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .brand-header img {
            width: 30px;
            height: 30px;
            border-radius: 50%;
        }

        .brand-header span {
            font-weight: 500;
        }

        .chat-messages {
            flex-grow: 1;
            padding: 10px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .chat-message {
            padding: 8px 12px;
            border-radius: 20px;
            max-width: 80%;
        }

        .chat-message.user {
            background-color: var(--n8n-chat-secondary-color, #6b3fd4);
            color: #ffffff;
            align-self: flex-end;
        }

        .chat-message.bot {
            background-color: #f0f0f0;
            color: var(--n8n-chat-font-color, #333333);
            align-self: flex-start;
        }

        .chat-input {
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }

        .chat-input textarea {
            flex-grow: 1;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 8px;
            resize: none;
            height: 40px;
        }

        .chat-input button {
            background-color: var(--n8n-chat-primary-color, #854fff);
            color: #ffffff;
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            cursor: pointer;
        }

        .chat-footer {
            padding: 10px;
            text-align: center;
            font-size: 0.8em;
        }

        .chat-footer a {
            color: var(--n8n-chat-primary-color, #854fff);
            text-decoration: none;
        }

        .close-button {
            background: none;
            border: none;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
        }
    `;

    // Default configuration
    const defaultConfig = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '',
            responseTimeText: '',
            poweredBy: {
                text: 'Powered by ProsesAI',
                link: 'https://prosesai.com'
            }
        },
        style: {
            primaryColor: '',
            secondaryColor: '',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // Merge user config with defaults
    const config = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
        } : defaultConfig;

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    chatContainer.innerHTML = chatInterfaceHTML;
    
    widgetContainer.appendChild(chatContainer);
    document.body.appendChild(widgetContainer);

    // Get DOM elements
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');

    function generateUUID() {
        return crypto.randomUUID();
    }

    async function handleApiResponse(response) {
        const data = await response.json();
        return Array.isArray(data) ? data[0].output : data.output;
    }

    function appendMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage(message) {
        if (!currentSessionId) {
            console.error('No active session');
            return;
        }

        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: {
                userId: ""
            }
        };

        appendMessage(message, 'user');

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });
            
            const botMessage = await handleApiResponse(response);
            appendMessage(botMessage, 'bot');
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('Sorry, there was an error sending your message.', 'bot');
        }
    }

    // Event Listeners
    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
        }
    });
    
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
            }
        }
    });

    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
})();
