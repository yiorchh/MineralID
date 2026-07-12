
const screens = document.querySelectorAll('.screen');
const menu = document.getElementById('menu');
const menuBtn = document.getElementById('menuBtn');

function showScreen(id) {
  screens.forEach(s => s.classList.toggle('active', s.id === id));
  menu.classList.add('hidden');
}

document.querySelectorAll('[data-screen]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});
menuBtn.addEventListener('click', () => menu.classList.toggle('hidden'));

let stream = null;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const startBtn = document.getElementById('startCamera');
const takeBtn = document.getElementById('takePhoto');
const stopBtn = document.getElementById('stopCamera');
const status = document.getElementById('cameraStatus');

startBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = stream;
    takeBtn.disabled = false;
    stopBtn.disabled = false;
    status.textContent = 'Cámara encendida.';
  } catch (err) {
    status.textContent = 'No fue posible acceder a la cámara. Revisa permisos y usa HTTPS o localhost.';
  }
});

takeBtn.addEventListener('click', () => {
  if (!stream) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  photo.src = canvas.toDataURL('image/jpeg', 0.92);
  photo.classList.remove('hidden');
  status.textContent = 'Fotografía capturada.';
});

stopBtn.addEventListener('click', () => {
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  video.srcObject = null;
  takeBtn.disabled = true;
  stopBtn.disabled = true;
  status.textContent = 'Cámara apagada.';
});

const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function assistantReply(text) {
  const t = text.toLowerCase();
  if (t.includes('foto') || t.includes('cámara') || t.includes('camara')) {
    return 'Ve a Cámara, presiona “Encender cámara”, apunta la muestra con buena luz y luego selecciona “Tomar foto”.';
  }
  if (t.includes('preparo') || t.includes('muestra') || t.includes('limpio')) {
    return 'Retira el exceso de polvo, observa una superficie fresca y usa iluminación uniforme. No realices pruebas peligrosas.';
  }
  if (t.includes('preliminar')) {
    return 'Es una primera estimación rápida. Debe confirmarse con un geólogo o laboratorio cuando la decisión sea crítica.';
  }
  if (t.includes('guante')) {
    return 'La interfaz utiliza botones grandes. También puedes usar el micrófono para dictar preguntas si el navegador lo permite.';
  }
  return 'Puedo ayudarte con la cámara, la preparación de la muestra, el uso con guantes y el significado de identificación preliminar.';
}

function sendMessage(text) {
  if (!text.trim()) return;
  const user = document.createElement('div');
  user.className = 'user';
  user.textContent = text;
  chat.appendChild(user);

  const bot = document.createElement('div');
  bot.className = 'bot';
  bot.textContent = assistantReply(text);
  chat.appendChild(bot);
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.addEventListener('click', () => {
  sendMessage(userInput.value);
  userInput.value = '';
});
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.click();
});
document.querySelectorAll('[data-msg]').forEach(btn => {
  btn.addEventListener('click', () => sendMessage(btn.dataset.msg));
});

const voiceBtn = document.getElementById('voiceBtn');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-CL';
  recognition.interimResults = false;
  voiceBtn.addEventListener('click', () => recognition.start());
  recognition.addEventListener('result', e => {
    const text = e.results[0][0].transcript;
    userInput.value = text;
    sendMessage(text);
    userInput.value = '';
  });
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = 'Reconocimiento de voz no compatible en este navegador';
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => {});
}
