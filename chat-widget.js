(function() {
  // Konfigurasi default. Jika website sudah mendefinisikan window.ChatWidgetConfig, gunakan konfigurasi tersebut.
  var config = window.ChatWidgetConfig || {
    webhook: {
      url: 'https://primary-production-6a14.up.railway.app/webhook/32018f08-0544-4a99-b68b-08a9591c9c25/chat',
      route: 'general'
    },
    branding: {
      logo: 'https://assets.zyrosite.com/dJo5B912eBsrJD3M/0_0000a1_-mnlqWPq6x6Uv4ZD4.png',
      name: 'ProsesAI',
      welcomeText: 'Hi 👋, how can we help?',
      responseTimeText: 'We typically respond right away'
    },
    style: {
      primaryColor: '#0079ad',
      secondaryColor: '#005b82',
      position: 'right',
      backgroundColor: '#ffffff',
      fontColor: '#333333'
    }
  };

  // Fungsi untuk menyuntikkan CSS ke dalam <head>
  function injectStyles(cssText) {
    var styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    if (styleEl.styleSheet) {
      styleEl.styleSheet.cssText = cssText;
    } else {
      styleEl.appendChild(document.createTextNode(cssText));
    }
    document.head.appendChild(styleEl);
  }

  // CSS untuk chat widget (gunakan nilai dari config.style)
  var styles = `
    /* Container posisi widget */
    #chat-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: Arial, sans-serif;
    }
    /* Tombol chat */
    #chat-widget-button {
      background-color: ${config.style.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-size: 24px;
    }
    /* Modal chat widget */
    #chat-widget-modal {
      display: none;
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background-color: ${config.style.backgroundColor};
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    /* Header widget */
    #chat-widget-header {
      background-color: ${config.style.primaryColor};
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #chat-widget-header img {
      height: 30px;
    }
    #chat-widget-header span {
      flex-grow: 1;
      margin-left: 10px;
      font-weight: bold;
    }
    #chat-widget-header button {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    /* Area pesan */
    #chat-widget-messages {
      height: 370px;
      overflow-y: auto;
      padding: 15px;
      background-color: #f9f9f9;
    }
    /* Area input pesan */
    #chat-widget-input-area {
      display: flex;
      padding: 10px;
      border-top: 1px solid #f0f0f0;
    }
    #chat-widget-input {
      flex-grow: 1;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 10px;
      outline: none;
    }
    #chat-widget-send {
      background-color: ${config.style.primaryColor};
      color: white;
      border: none;
      padding: 10px 15px;
      margin-left: 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    /* Footer widget */
    #chat-widget-footer {
      background-color: #f0f0f0;
      color: #666;
      text-align: center;
      padding: 10px;
      font-size: 12px;
    }
  `;
  injectStyles(styles);

  // Buat elemen container untuk chat widget
  var container = document.createElement('div');
  container.id = 'chat-widget-container';
  container.innerHTML = `
    <button id="chat-widget-button">💬</button>
    <div id="chat-widget-modal">
      <div id="chat-widget-header">
        <img src="${config.branding.logo}" alt="${config.branding.name} Logo">
        <span>${config.branding.name} Chat</span>
        <button id="close-widget">×</button>
      </div>
      <div id="chat-widget-messages"></div>
      <div id="chat-widget-input-area">
        <input type="text" id="chat-widget-input" placeholder="Type your message...">
        <button id="chat-widget-send">Send</button>
      </div>
      <div id="chat-widget-footer">
        Powered by ${config.branding.name}
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Referensi elemen
  var chatButton   = document.getElementById('chat-widget-button');
  var chatModal    = document.getElementById('chat-widget-modal');
  var closeButton  = document.getElementById('close-widget');
  var sendButton   = document.getElementById('chat-widget-send');
  var chatInput    = document.getElementById('chat-widget-input');
  var chatMessages = document.getElementById('chat-widget-messages');

  // Fungsi untuk menambahkan pesan ke area chat
  function appendMessage(text, sender) {
    var messageElem = document.createElement('div');
    messageElem.style.marginBottom = '10px';
    messageElem.style.maxWidth = '80%';
    messageElem.style.padding = '8px';
    messageElem.style.borderRadius = '8px';
    // Gunakan warna berbeda untuk pesan user dan bot
    if (sender === 'user') {
      messageElem.style.backgroundColor = '#d1e7ff';
      messageElem.style.alignSelf = 'flex-end';
    } else {
      messageElem.style.backgroundColor = '#e2e2e2';
      messageElem.style.alignSelf = 'flex-start';
    }
    messageElem.textContent = text;
    chatMessages.appendChild(messageElem);
    // Auto-scroll ke bagian bawah pesan
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Event listener untuk membuka widget
  chatButton.addEventListener('click', function() {
    chatModal.style.display = 'block';
    // Jika belum ada pesan, tampilkan pesan sambutan
    if (chatMessages.innerHTML.trim() === '') {
      appendMessage(config.branding.welcomeText, 'bot');
    }
  });

  // Event listener untuk menutup widget
  closeButton.addEventListener('click', function() {
    chatModal.style.display = 'none';
  });

  // Fungsi untuk mengirim pesan
  function sendMessage() {
    var messageText = chatInput.value.trim();
    if (messageText === '') return;
    // Tampilkan pesan dari user
    appendMessage(messageText, 'user');
    // Bersihkan input pesan
    chatInput.value = '';

    // Kirim pesan ke endpoint webhook menggunakan fetch
    fetch(config.webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: config.webhook.route,
        message: messageText
      })
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        // Jika respon dari server memiliki reply, tampilkan sebagai pesan dari bot
        if (data.reply) {
          appendMessage(data.reply, 'bot');
        }
      })
      .catch(function(error) {
        console.error('Error sending message:', error);
        appendMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', 'bot');
      });
  }

  // Event listener untuk tombol "Send"
  sendButton.addEventListener('click', sendMessage);

  // Kirim pesan saat menekan tombol Enter di input
  chatInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
})();