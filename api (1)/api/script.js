const chatInput = document.querySelector('.chat-input textarea');
const sendButton = document.getElementById('send-btn');
const chatbox = document.querySelector('.chatbox');
const closeButton = document.getElementById('close-btn');

const API_KEY = 'AIzaSyC4BhJH3bqzHr99H4h4t0sCBjLTW6-cQbI';

const MODEL_ID = 'gemini-2.5-flash';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

let isGenerating = false;

const createChatElement = (message, className) => {
  const chatElement = document.createElement('li');
  chatElement.classList.add('chat', className);
  const messageText = message.replace(/\n/g, '<br>');
  chatElement.innerHTML = `<p>${messageText}</p>`;
  return chatElement;
};

const generateResponse = async (userMessage) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { parts: [ { text: userMessage } ] }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text
                        || 'No se pudo generar una respuesta válida.';
    return textResponse;

  } catch (error) {
    console.error('Error en la API:', error);
    if (error.message.includes('model')) {
      return '⚠️ Error: modelo no encontrado o no soportado.';
    } else if (error.message.includes('API key')) {
      return '⚠️ Error de autenticación: revisa tu API key o habilita el acceso.';
    } else {
      return '⚠️ Hubo un problema al procesar la solicitud.';
    }
  }
};

const handleSendMessage = async () => {
  if (isGenerating) return;
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  isGenerating = true;
  chatInput.value = '';
  sendButton.disabled = true;
  chatInput.disabled = true;

  chatbox.appendChild(createChatElement(userMessage, 'outgoing'));
  chatbox.scrollTop = chatbox.scrollHeight;

  const thinkingElement = createChatElement('Escribiendo...', 'incoming');
  chatbox.appendChild(thinkingElement);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const botResponse = await generateResponse(userMessage);
    thinkingElement.remove();
    chatbox.appendChild(createChatElement(botResponse, 'incoming'));
  } catch (err) {
    thinkingElement.remove();
    chatbox.appendChild(createChatElement(err.message || 'Error al procesar la respuesta.', 'incoming'));
  } finally {
    chatbox.scrollTop = chatbox.scrollHeight;
    isGenerating = false;
    sendButton.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
};

sendButton.addEventListener('click', handleSendMessage);

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
});

chatInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

closeButton.addEventListener('click', () => {
  document.querySelector('.chatBot-container').style.display = 'none';
});

chatInput.focus();
