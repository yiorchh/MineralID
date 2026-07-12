const screens = document.querySelectorAll('.screen');
const menu = document.getElementById('menu');
const menuBtn = document.getElementById('menuBtn');

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  menu.classList.add('hidden');
}

document.querySelectorAll('[data-screen]').forEach(button => {
  button.addEventListener('click', () => showScreen(button.dataset.screen));
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
const mineralResult = document.getElementById('mineralResult');

const minerals = [
  'Cuarzo', 'Calcita', 'Pirita', 'Calcopirita', 'Malaquita',
  'Hematita', 'Magnetita', 'Galena', 'Yeso', 'Feldespato'
];

async function startCamera() {
  if (stream) return true;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    takeBtn.disabled = false;
    stopBtn.disabled = false;
    status.textContent = 'Cámara encendida.';
    return true;
  } catch (error) {
    status.textContent = 'No fue posible acceder a la cámara. Revisa los permisos y usa HTTPS o localhost.';
    return false;
  }
}

function getRandomIdentification() {
  const selected = [...minerals]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const first = Math.floor(Math.random() * 31) + 50;
  const second = Math.floor(Math.random() * (96 - first - 5)) + 5;
  const third = 100 - first - second;

  return selected.map((name, index) => ({
    name,
    probability: [first, second, third][index]
  })).sort((a, b) => b.probability - a.probability);
}

function showMineralIdentification() {
  const results = getRandomIdentification();
  const [main] = results;

  mineralResult.innerHTML = `
    <h3>Resultado preliminar simulado</h3>
    <p>El mineral puede ser <strong>${main.name}</strong>.</p>
    <p>Probabilidades estimadas:</p>
    <ul>
      ${results.map(item => `<li><strong>${item.name}:</strong> ${item.probability}%</li>`).join('')}
    </ul>
    <small>Este resultado es aleatorio y solo sirve para demostrar el funcionamiento del prototipo.</small>
  `;
  mineralResult.classList.remove('hidden');

  return `El mineral puede ser ${main.name}. Las probabilidades simuladas son: ${results
    .map(item => `${item.name}, ${item.probability} por ciento`)
    .join('; ')}.`;
}

function takePhoto() {
  if (!stream || !video.videoWidth || !video.videoHeight) {
    status.textContent = 'Primero debes encender la cámara.';
    return null;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0);
  photo.src = canvas.toDataURL('image/jpeg', 0.92);
  photo.classList.remove('hidden');
  status.textContent = 'Fotografía capturada y analizada.';
  return showMineralIdentification();
}

function stopCamera() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  video.srcObject = null;
  takeBtn.disabled = true;
  stopBtn.disabled = true;
  status.textContent = 'Cámara apagada.';
}

startBtn.addEventListener('click', startCamera);
takeBtn.addEventListener('click', takePhoto);
stopBtn.addEventListener('click', stopCamera);

const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceStatus = document.getElementById('voiceStatus');

function addChatMessage(text, type) {
  const message = document.createElement('div');
  message.className = type;
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

function assistantReply(text) {
  const normalized = text.toLowerCase();

  if (normalized.includes('preparo') || normalized.includes('muestra') || normalized.includes('limpio')) {
    return 'Retira el exceso de polvo, observa una superficie fresca y usa iluminación uniforme. No realices pruebas peligrosas.';
  }
  if (normalized.includes('preliminar')) {
    return 'Es una primera estimación rápida. Debe confirmarse con un geólogo o laboratorio cuando la decisión sea crítica.';
  }
  if (normalized.includes('guante')) {
    return 'La interfaz utiliza botones grandes. También puedes usar el micrófono para dictar preguntas o pedir que tome una foto.';
  }
  if (normalized.includes('foto') || normalized.includes('cámara') || normalized.includes('camara')) {
    return 'Puedes decir “toma una foto” al usar el micrófono. El asistente abrirá la cámara, la encenderá y hará una captura.';
  }
  return 'Puedo ayudarte con la cámara, la preparación de la muestra y la identificación preliminar. También puedes decir “toma una foto”.';
}

function isTakePhotoCommand(text) {
  const normalized = text.toLowerCase();
  return normalized.includes('toma una foto') ||
    normalized.includes('tomar una foto') ||
    normalized.includes('saca una foto') ||
    normalized.includes('captura una foto');
}

async function executeVoiceCommand(text) {
  if (!isTakePhotoCommand(text)) return false;

  addChatMessage('Abriendo la cámara para tomar la fotografía…', 'bot');
  showScreen('camera');
  const cameraStarted = await startCamera();
  if (!cameraStarted) {
    addChatMessage('No pude acceder a la cámara. Revisa los permisos del navegador.', 'bot');
    return true;
  }

  await new Promise(resolve => setTimeout(resolve, 1200));
  const resultText = takePhoto();
  if (resultText) addChatMessage(resultText, 'bot');
  return true;
}

async function sendMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;

  addChatMessage(cleanText, 'user');
  const commandExecuted = await executeVoiceCommand(cleanText);
  if (!commandExecuted) addChatMessage(assistantReply(cleanText), 'bot');
}

sendBtn.addEventListener('click', async () => {
  const text = userInput.value;
  userInput.value = '';
  await sendMessage(text);
});

userInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') sendBtn.click();
});

document.querySelectorAll('[data-msg]').forEach(button => {
  button.addEventListener('click', () => sendMessage(button.dataset.msg));
});

const voiceBtn = document.getElementById('voiceBtn');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-CL';
  recognition.interimResults = false;
  recognition.continuous = false;

  voiceBtn.addEventListener('click', () => {
    voiceStatus.textContent = 'Escuchando… Puedes decir “toma una foto”.';
    voiceBtn.disabled = true;
    try {
      recognition.start();
    } catch (error) {
      voiceBtn.disabled = false;
    }
  });

  recognition.addEventListener('result', async event => {
    const text = event.results[0][0].transcript;
    userInput.value = '';
    voiceStatus.textContent = `Escuché: “${text}”`;
    await sendMessage(text);
  });

  recognition.addEventListener('end', () => {
    voiceBtn.disabled = false;
    if (voiceStatus.textContent === 'Escuchando… Puedes decir “toma una foto”.') {
      voiceStatus.textContent = 'No se detectó una instrucción. Inténtalo nuevamente.';
    }
  });

  recognition.addEventListener('error', event => {
    voiceBtn.disabled = false;
    voiceStatus.textContent = event.error === 'not-allowed'
      ? 'No se concedió permiso para usar el micrófono.'
      : 'No pude reconocer la voz. Inténtalo nuevamente.';
  });
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = 'Reconocimiento de voz no compatible en este navegador';
  voiceStatus.textContent = 'Este navegador no admite reconocimiento de voz.';
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => {});
}
