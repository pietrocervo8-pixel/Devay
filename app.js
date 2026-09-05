const state = {
  chats: ['Ideas para mi proyecto', 'Organizar la semana', 'Aprender JavaScript'],
  messages: []
};

const welcome = document.getElementById('welcome');
const messages = document.getElementById('messages');
const input = document.getElementById('promptInput');
const composer = document.getElementById('composer');
const chatList = document.getElementById('chatList');
const sidebar = document.getElementById('sidebar');
const authScreen = document.getElementById('authScreen');
const signupForm = document.getElementById('signupForm');
const profileName = document.getElementById('profileName');
const profileAvatar = document.getElementById('profileAvatar');
const welcomeCopy = document.getElementById('welcomeCopy');
const downloadButton = document.getElementById('downloadButton');
const loginForm = document.getElementById('loginForm');
const authTitle = document.getElementById('authTitle');
const authEyebrow = document.getElementById('authEyebrow');
const authIntro = document.getElementById('authIntro');
const modalLayer = document.getElementById('modalLayer');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalActions = document.getElementById('modalActions');
const modalIcon = document.getElementById('modalIcon');
let installPrompt;
let activeChat = 0;
let callRecognition;
const tasks = JSON.parse(localStorage.getItem('devayTasks') || '[]');

function enterApp(profile) {
  authScreen.classList.add('hidden');
  profileName.textContent = profile.name;
  profileAvatar.textContent = profile.name.charAt(0).toUpperCase();
  welcomeCopy.textContent = `Piensa en voz alta, ${profile.name}. Devay te ayuda a ordenar ideas, resolver problemas y empezar cosas nuevas.`;
}

function openModal({ title, eyebrow = 'Devay', icon = 'D', content, actions }) {
  modalTitle.textContent = title;
  document.getElementById('modalEyebrow').textContent = eyebrow;
  modalIcon.textContent = icon;
  modalContent.innerHTML = content;
  modalActions.innerHTML = actions;
  modalLayer.classList.remove('hidden');
}

function closeModal() { modalLayer.classList.add('hidden'); modalContent.innerHTML = ''; modalActions.innerHTML = ''; }

function escapeMarkup(value) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

function saveTasks() { localStorage.setItem('devayTasks', JSON.stringify(tasks)); }

function buildWorkPlan(request) {
  const lower = request.toLowerCase();
  if (lower.includes('semana') || lower.includes('organ')) return ['Revisar tus pendientes', 'Elegir tres prioridades', 'Bloquear tiempo en el calendario', 'Dejar un espacio para imprevistos'];
  if (lower.includes('app') || lower.includes('web') || lower.includes('proyecto')) return ['Definir el problema que resuelve', 'Escribir la primera versión mínima', 'Construir y probar la función principal', 'Revisar y publicar una primera versión'];
  if (lower.includes('estudi') || lower.includes('aprender')) return ['Definir el tema y el objetivo', 'Dividirlo en sesiones cortas', 'Practicar con un ejemplo', 'Revisar lo aprendido'];
  return ['Aclarar el resultado que quieres', 'Dividirlo en una primera acción', 'Hacer una prueba pequeña', 'Revisar y continuar'];
}

function renderWorkCenter() {
  const openTasks = tasks.filter((task) => !task.done).length;
  modalContent.innerHTML = `<p class="modal-copy">Dile qué quieres que haga y Devay lo convertirá en una acción o un plan. ${openTasks ? `<strong>${openTasks} tarea${openTasks === 1 ? '' : 's'} pendiente${openTasks === 1 ? '' : 's'}.</strong>` : 'No tienes tareas pendientes.'}</p><form class="work-form" id="workForm"><input class="modal-input" id="taskInput" placeholder="Ej.: abre Google y busca hola" required /><button class="modal-primary" type="submit">Ejecutar</button></form><div class="task-list">${tasks.length ? tasks.map((task, index) => `<article class="task-card ${task.done ? 'done' : ''}"><button class="task-check" data-task-done="${index}" aria-label="Marcar tarea">${task.done ? '✓' : '○'}</button><div><strong>${escapeMarkup(task.title)}</strong><ol>${task.steps.map((step) => `<li>${escapeMarkup(step)}</li>`).join('')}</ol></div><button class="task-delete" data-task-delete="${index}" aria-label="Borrar tarea">×</button></article>`).join('') : '<p class="empty-tasks">Tus planes aparecerán aquí.</p>'}</div>`;
  document.getElementById('workForm').addEventListener('submit', (event) => { event.preventDefault(); const title = document.getElementById('taskInput').value.trim(); if (!title) return; const lower = title.toLowerCase(); const googleMatch = title.match(/(?:abre|abrir)\s+google(?:\s+y)?\s+(?:busca|buscar)\s+(.+)/i); if (googleMatch) { const query = googleMatch[1].trim(); closeModal(); showPermission(`abrir Google y buscar "${query}"`, () => { window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer'); addMessage(`He abierto Google y he buscado: ${query}`, 'assistant'); }); return; } if ((lower.includes('roblox') || lower.includes('roblox studio')) && (lower.includes('abre') || lower.includes('abrir'))) { closeModal(); showPermission('intentar abrir Roblox en tu computadora', () => { window.open('roblox://', '_blank'); addMessage('He enviado la orden para abrir Roblox. Si no está instalado, abre la página oficial para instalarlo.', 'assistant'); }); return; } if (lower.includes('script') && lower.includes('javascript') && (lower.includes('ia') || lower.includes('inteligencia'))) { closeModal(); showPermission('crear un asistente IA en JavaScript', () => { addMessage('He preparado un asistente JavaScript con historial, instrucciones y conexión a un backend. Descarga el archivo para abrirlo en VS Code.', 'assistant'); addAiScriptDownload(); }); return; } tasks.unshift({ title, steps: buildWorkPlan(title), done: false }); saveTasks(); renderWorkCenter(); });
  modalContent.querySelectorAll('[data-task-done]').forEach((button) => button.addEventListener('click', () => { tasks[Number(button.dataset.taskDone)].done = !tasks[Number(button.dataset.taskDone)].done; saveTasks(); renderWorkCenter(); }));
  modalContent.querySelectorAll('[data-task-delete]').forEach((button) => button.addEventListener('click', () => { tasks.splice(Number(button.dataset.taskDelete), 1); saveTasks(); renderWorkCenter(); }));
}

function showWorkCenter() { openModal({ title: 'Centro de trabajo', eyebrow: 'Devay puede ayudarte a avanzar', icon: '◇', content: '', actions: '<button class="modal-secondary" data-close>Cerrar</button>' }); renderWorkCenter(); }

function showToolsMenu() {
  openModal({ title: 'Herramientas', eyebrow: 'Tu espacio Devay', icon: 'D', content: '<p class="modal-copy">Gestiona esta conversación y accede rápidamente a tus herramientas.</p>', actions: '<button class="modal-secondary" id="exportChat">Exportar conversación</button><button class="modal-secondary" id="clearChat">Limpiar chat</button><button class="modal-primary" id="openWork">Centro de trabajo</button>' });
  document.getElementById('exportChat').addEventListener('click', () => { const transcript = state.messages.map((message) => `${message.role === 'user' ? 'Tú' : 'Devay'}: ${message.text}`).join('\n\n'); const blob = new Blob([transcript || 'Esta conversación todavía está vacía.'], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'conversacion-devay.txt'; link.click(); URL.revokeObjectURL(url); closeModal(); });
  document.getElementById('clearChat').addEventListener('click', () => { state.messages = []; messages.innerHTML = ''; welcome.hidden = false; closeModal(); });
  document.getElementById('openWork').addEventListener('click', () => { closeModal(); showWorkCenter(); });
}

function showAuthMode(mode) {
  const loginMode = mode === 'login';
  signupForm.classList.toggle('hidden', loginMode);
  loginForm.classList.toggle('hidden', !loginMode);
  authEyebrow.textContent = loginMode ? 'Qué bueno verte de nuevo' : 'Empieza tu espacio personal';
  authTitle.textContent = loginMode ? 'Inicia sesión' : 'Crea tu cuenta';
  authIntro.textContent = loginMode ? 'Escribe tu nombre y contraseña para entrar a Devay.' : 'Completa tus datos para que Devay pueda adaptar la experiencia a ti.';
}

async function hashPassword(password) { const data = new TextEncoder().encode(password); const digest = await crypto.subtle.digest('SHA-256', data); return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join(''); }

function showRename(chatIndex) {
  openModal({ title: 'Cambiar nombre', icon: '✎', content: `<label class="modal-label">Nombre de la conversación<input class="modal-input" id="renameInput" value="${state.chats[chatIndex]}" maxlength="48" /></label>`, actions: '<button class="modal-secondary" data-close>Cancelar</button><button class="modal-primary" id="confirmRename">Guardar nombre</button>' });
  document.getElementById('confirmRename').addEventListener('click', () => { const name = document.getElementById('renameInput').value.trim(); if (name) { state.chats[chatIndex] = name; renderChats(); closeModal(); } });
  document.getElementById('renameInput').focus();
}

function showDelete(chatIndex) {
  openModal({ title: 'Borrar conversación', eyebrow: 'Esta acción no se puede deshacer', icon: '⌫', content: `<p class="modal-copy">Se eliminará <strong>${state.chats[chatIndex]}</strong> de esta sesión.</p>`, actions: '<button class="modal-secondary" data-close>Cancelar</button><button class="modal-danger" id="confirmDelete">Borrar conversación</button>' });
  document.getElementById('confirmDelete').addEventListener('click', () => { state.chats.splice(chatIndex, 1); if (!state.chats.length) state.chats.push('Nueva conversación'); activeChat = 0; renderChats(); messages.innerHTML = ''; welcome.hidden = false; closeModal(); });
}

function showAccountMenu() {
  const profile = JSON.parse(localStorage.getItem('devayProfile') || 'null');
  openModal({ title: profile ? profile.name : 'Invitado', eyebrow: profile?.email || 'Sesión local', icon: '◉', content: '<p class="modal-copy">Administra tu sesión y tus preferencias de privacidad.</p>', actions: '<button class="modal-secondary" data-close>Volver</button><button class="modal-danger" id="logoutButton">Cerrar sesión</button>' });
  document.getElementById('logoutButton').addEventListener('click', () => { sessionStorage.removeItem('devaySession'); closeModal(); location.reload(); });
}

function showPermission(actionText, onAllow = () => {}) {
  openModal({ title: 'Permiso necesario', eyebrow: 'Control de tu equipo', icon: '⌁', content: `<p class="modal-copy">Devay quiere <strong>${actionText}</strong>. Solo continuará si lo autorizas. No se enviarán ni leerán archivos personales.</p><div class="permission-note">Si eliges “No permitir”, la acción se cancela y no se abrirá nada.</div>`, actions: '<button class="modal-secondary" data-close>No permitir</button><button class="modal-primary" id="allowAction">Permitir una vez</button>' });
  document.getElementById('allowAction').addEventListener('click', () => { closeModal(); addMessage('Permiso concedido: ' + actionText, 'user'); onAllow(); if (actionText.includes('script')) { addMessage('He preparado la idea del script. Pulsa el botón de descarga que aparecerá para abrirlo en Visual Studio Code.\n\nNo puedo abrir VS Code ni escribir en tu equipo directamente desde el navegador.', 'assistant'); addScriptDownload(); } else if (actionText.includes('instalar')) addMessage('Puedo guiarte paso a paso, pero la instalación debe confirmarse en tu sistema operativo. No ejecutaré programas sin una acción visible tuya.', 'assistant'); });
}

function addScriptDownload() {
  const item = document.createElement('div'); item.className = 'file-action'; item.innerHTML = '<span>JS</span><div><strong>devay-script.js</strong><small>Script preparado por Devay</small></div><button id="downloadScript">Descargar</button>'; messages.appendChild(item); document.getElementById('downloadScript').addEventListener('click', () => { const blob = new Blob([`// Script preparado por Devay\nconsole.log('Hola desde Devay');\n`], { type: 'text/javascript' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'devay-script.js'; link.click(); URL.revokeObjectURL(url); });
}

function addAiScriptDownload() {
  const code = `class DevayAssistant {
  constructor({ model = 'local', instructions = '' } = {}) {
    this.model = model;
    this.instructions = instructions;
    this.history = [];
  }

  async ask(message) {
    this.history.push({ role: 'user', content: message });
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, instructions: this.instructions, messages: this.history })
    });
    if (!response.ok) throw new Error('No se pudo conectar con el modelo');
    const data = await response.json();
    const answer = data.answer ?? data.choices?.[0]?.message?.content ?? '';
    this.history.push({ role: 'assistant', content: answer });
    return answer;
  }
}

const assistant = new DevayAssistant({ instructions: 'Responde en español, explica tu razonamiento con claridad y propone soluciones seguras.' });
assistant.ask('Hola, ¿en qué puedes ayudarme?').then(console.log).catch(console.error);
`;
  const item = document.createElement('div'); item.className = 'file-action'; item.innerHTML = '<span>AI</span><div><strong>devay-assistant.js</strong><small>Asistente JavaScript listo para conectar a tu backend</small></div><button id="downloadAiScript">Descargar</button>'; messages.appendChild(item); document.getElementById('downloadAiScript').addEventListener('click', () => { const blob = new Blob([code], { type: 'text/javascript' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'devay-assistant.js'; link.click(); URL.revokeObjectURL(url); });
}

function startCallMode() {
  openModal({ title: 'Modo llamada', eyebrow: 'Habla con Devay', icon: '◉', content: '<div class="call-status" id="callStatus"><span></span> Listo para escucharte</div><p class="modal-copy">Habla con naturalidad. Devay transcribirá tu voz y responderá usando audio cuando el navegador lo permita.</p>', actions: '<button class="modal-secondary" data-close>Salir</button><button class="modal-primary" id="startListening">Activar micrófono</button>' });
  document.getElementById('startListening').addEventListener('click', () => { const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SpeechRecognition) { const callInput = document.getElementById('callInput'); if (!callInput) { document.getElementById('callStatus').innerHTML = '<span></span> Este navegador no admite voz'; document.getElementById('modalContent').insertAdjacentHTML('beforeend', '<label class="modal-label call-fallback-label">Escribe para continuar<input class="modal-input" id="callInput" placeholder="Escribe tu mensaje..." /></label>'); document.getElementById('startListening').textContent = 'Responder'; document.getElementById('callInput').focus(); return; } const typed = callInput.value.trim(); if (!typed) return; closeModal(); sendMessage(typed); return; } callRecognition = new SpeechRecognition(); callRecognition.lang = 'es-ES'; callRecognition.onstart = () => { document.getElementById('callStatus').innerHTML = '<span class="listening"></span> Escuchando...'; }; callRecognition.onresult = (event) => { const spoken = event.results[0][0].transcript; closeModal(); sendMessage(spoken); if ('speechSynthesis' in window) setTimeout(() => speechSynthesis.speak(new SpeechSynthesisUtterance(getReply(spoken))), 900); }; callRecognition.onerror = () => { document.getElementById('callStatus').innerHTML = '<span></span> No pude acceder al micrófono'; }; callRecognition.start(); });
}

const savedProfile = JSON.parse(localStorage.getItem('devayProfile') || 'null');
if (sessionStorage.getItem('devaySession') === 'active' && savedProfile) enterApp(savedProfile);
else if (savedProfile) { showAuthMode('login'); document.getElementById('loginNameInput').value = savedProfile.name; }

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('nameInput').value.trim();
  const birth = document.getElementById('birthInput').value;
  const formError = document.getElementById('formError');
  const age = new Date().getFullYear() - new Date(`${birth}T00:00:00`).getFullYear();
  if (age < 13) { formError.textContent = 'Debes tener al menos 13 años para continuar.'; return; }
  const profile = { name, birth, passwordHash: await hashPassword(document.getElementById('passwordInput').value) };
  localStorage.setItem('devayProfile', JSON.stringify(profile)); sessionStorage.setItem('devaySession', 'active'); enterApp(profile);
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('loginNameInput').value.trim();
  const passwordHash = await hashPassword(document.getElementById('loginPasswordInput').value);
  const profile = JSON.parse(localStorage.getItem('devayProfile') || 'null');
  if (!profile || !profile.passwordHash || profile.name.toLowerCase() !== name.toLowerCase() || profile.passwordHash !== passwordHash) { document.getElementById('loginError').textContent = 'El nombre o la contraseña no son correctos.'; return; }
  sessionStorage.setItem('devaySession', 'active'); enterApp(profile);
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

downloadButton.addEventListener('click', async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    return;
  }
  downloadButton.innerHTML = '<span>✓</span> Abre el menú del navegador para instalar';
  setTimeout(() => { downloadButton.innerHTML = '<span>↓</span> Download Devay'; }, 3500);
});

function renderChats() {
  chatList.innerHTML = state.chats.map((chat, index) => `<div class="chat-row"><button class="chat-item ${index === activeChat ? 'active' : ''}" data-chat="${index}">${chat}</button><button class="chat-more" data-menu="${index}" aria-label="Opciones de ${chat}">•••</button></div>`).join('');
}

function addMessage(text, role) {
  state.messages.push({ text, role });
  welcome.hidden = true;
  const item = document.createElement('div');
  item.className = `message ${role}`;
  item.innerHTML = role === 'user'
    ? `<div class="message-bubble"></div>`
    : `<div class="avatar devay-avatar">D</div><div><div class="message-label">DEVAY</div><div class="message-bubble"></div></div>`;
  item.querySelector('.message-bubble').textContent = text;
  messages.appendChild(item);
  document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
}

function getReply(text) {
  const lower = text.toLowerCase();
  const profile = JSON.parse(localStorage.getItem('devayProfile') || 'null');
  const firstName = profile?.name?.split(' ')[0] || 'amigo';
  const recent = state.messages.filter((message) => message.role === 'user').slice(-3).map((message) => message.text).join(' ').toLowerCase();
  if (lower.includes('me siento') || lower.includes('triste') || lower.includes('ansiedad') || lower.includes('estres')) return `Te escucho, ${firstName}. No tienes que resolverlo todo de golpe. Cuéntame qué pesa más ahora y lo separamos en una cosa pequeña que podamos hacer juntos.`;
  if (lower.includes('gracias') || lower.includes('me ayudaste')) return 'Siempre. Me alegra que te haya servido. Seguimos con el siguiente paso cuando quieras.';
  if (lower.includes('cómo estás') || lower.includes('como estas')) return 'Estoy aquí contigo y listo para ayudarte. ¿Quieres trabajar en algo, aprender, organizarte o simplemente hablar un rato?';
  if (lower.includes('no sé') || lower.includes('no se') || lower.includes('estoy perdido')) return `Vamos a quitarle ruido, ${firstName}. Dime cuál es el resultado que quieres y qué es lo que te bloquea; yo te propongo el primer paso, sin complicarlo.`;
  if (lower.includes('objetivo') || lower.includes('meta')) return 'Convierte esa meta en una escena concreta: ¿qué tendría que estar pasando dentro de siete días para que digas “avancé”? A partir de eso hacemos un plan corto y medible.';
  if (lower.includes('blender')) return 'En Blender puedo ayudarte con modelado, materiales, iluminación, animación y scripts Python. Dime qué quieres construir y te lo divido en una escena mínima, herramientas y pasos de revisión.';
  if (lower.includes('roblox studio')) return 'Para Roblox Studio puedo ayudarte con Luau, objetos, interfaces, sistemas de monedas, guardado y diseño del juego. Empezamos por la mecánica principal y luego la hacemos robusta.';
  if (lower.includes('visual studio') || lower.includes('vs code')) return 'En VS Code puedo ayudarte a diseñar la estructura, escribir el código, revisar errores, preparar scripts y explicar cada decisión. Dime el lenguaje y el resultado exacto que buscas.';
  if (lower.includes('qué hago hoy') || lower.includes('que hago hoy')) return 'Te propongo tres movimientos: termina una tarea pequeña, aprende algo que puedas aplicar hoy y deja preparado el primer paso de mañana. Si me dices cuánto tiempo tienes, te hago el horario.';
  if (recent.includes('proyecto') && (lower.includes('siguiente') || lower.includes('ahora'))) return 'El siguiente paso es hacer una versión pequeña que funcione. No la perfecciones todavía: prueba la parte principal, observa qué falla y luego mejoramos con datos reales.';
  if (lower.includes('quién eres') || lower.includes('quien eres') || lower.includes('qué puedes')) return `Soy Devay, ${firstName}: una asistente para pensar con claridad, aprender más rápido y convertir ideas en acciones. Puedo explicarte temas, escribir, programar, organizar planes y ayudarte a tomar decisiones.`;
  if (lower.includes('resumen') || lower.includes('resume')) return 'Puedo resumirlo. Envíame el texto y te devolveré las ideas principales, los datos importantes y una conclusión breve, sin perder el contexto.';
  if (lower.includes('correo') || lower.includes('email')) return 'Puedo ayudarte a redactarlo. Dime a quién va dirigido, qué quieres conseguir y el tono que prefieres: profesional, cercano o directo.';
  if (lower.includes('decidir') || lower.includes('decisión') || lower.includes('opción')) return 'Vamos a decidir con calma. Escribe las opciones, qué te importa más y qué riesgo quieres evitar. Las compararemos por impacto, esfuerzo y beneficio a largo plazo.';
  if (lower.includes('traduc') || lower.includes('inglés') || lower.includes('english')) return 'Claro. Pega el texto y dime a qué idioma lo quieres traducir. También puedo adaptar el tono para que suene natural, no solo traducir palabra por palabra.';
  if (lower.includes('semana') || lower.includes('organ')) return 'Claro. Empieza con tres prioridades reales para esta semana, no con una lista infinita.\n\n1. Elige una tarea importante para cada día.\n2. Reserva un bloque pequeño para lo inesperado.\n3. Deja el viernes para cerrar pendientes y revisar cómo te fue.\n\n¿Quieres que lo convierta en un horario concreto?';
  if (lower.includes('idea') || lower.includes('creativ')) return 'Me gusta ese impulso. Aquí van tres caminos para empezar:\n\n• Un diario visual que convierta tus hábitos en pequeñas escenas.\n• Una herramienta que ayude a elegir qué cocinar con lo que ya tienes.\n• Un mapa personal de lugares, personas y momentos que te inspiran.\n\nLa mejor idea es la que puedes probar en una tarde. ¿Cuál te llama más?';
  if (lower.includes('javascript') || lower.includes('difícil') || lower.includes('explica')) return 'Vamos a hacerlo sencillo: JavaScript es el lenguaje que permite que una página responda a lo que haces. Cuando pulsas un botón y algo cambia, normalmente hay JavaScript detrás.\n\nPiensa en tres piezas: datos (lo que sabes), funciones (lo que haces) y eventos (lo que dispara una acción). Esa combinación ya te permite construir cosas bastante interesantes.';
  if (lower.includes('hola') || lower.includes('buenas')) return '¡Hola! Soy Devay. Puedo ayudarte a pensar, aprender, planificar o crear. ¿Qué tienes en mente?';
  if (lower.includes('código') || lower.includes('program') || lower.includes('app')) return 'Podemos convertirlo en un proyecto concreto. Primero define qué problema resuelve, quién lo usaría y cuál es la versión más pequeña que puedes construir hoy. Después elegimos la tecnología y dividimos el trabajo en pasos.';
  if (lower.endsWith('?') || lower.includes('qué ') || lower.includes('cómo ') || lower.includes('por qué ') || lower.includes('puedes ')) return `Buena pregunta. Para responderte bien necesito ubicar el objetivo: ¿quieres una explicación, una recomendación o que prepare una acción? Si me das un poco de contexto, te responderé con una solución concreta.`;
  if (lower.includes('quiero ') || lower.includes('necesito ') || lower.includes('ayúdame') || lower.includes('ayudame')) return `Entendido, ${firstName}. Lo convierto en algo práctico. Dime el resultado exacto que esperas y las condiciones importantes, por ejemplo tiempo, herramienta o formato; después te daré el primer paso y, si hace falta, un plan completo.`;
  if (lower.includes('tengo ') || lower.includes('me pasa ') || lower.includes('problema') || lower.includes('error')) return `Vamos a encontrar la causa. ¿Qué esperabas que ocurriera, qué ocurrió realmente y qué cambió justo antes? Con esas tres piezas puedo proponerte una solución ordenada.`;
  return `Entiendo la idea: “${text}”. Para no darte una respuesta inventada, dime qué quieres obtener exactamente: una explicación, código, un plan o una acción. En cuanto lo aclares, lo resolvemos paso a paso.`;
}

function showReply(text) {
  const typing = document.createElement('div');
  typing.className = 'message assistant';
  typing.innerHTML = '<div class="avatar devay-avatar">D</div><div><div class="message-label">DEVAY</div><div class="message-bubble typing"><i></i><i></i><i></i></div></div>';
  messages.appendChild(typing);
  document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
  setTimeout(() => { typing.remove(); addMessage(getReply(text), 'assistant'); }, 750);
}

function sendMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  const lower = clean.toLowerCase();
  if (lower.includes('hazlo por mí') || lower.includes('hazlo por mi') || lower.includes('hazlo todo') || lower.includes('haz todo') || lower.includes('trabaja por mí') || lower.includes('trabaja por mi')) { showWorkCenter(); return; }
  if ((lower.includes('roblox') || lower.includes('roblox studio')) && (lower.includes('abre') || lower.includes('abrir'))) { showPermission('intentar abrir Roblox en tu computadora', () => { window.open('roblox://', '_blank'); addMessage('He enviado la orden para abrir Roblox. Si no está instalado, abre la página oficial para instalarlo.', 'assistant'); }); return; }
  if (lower.includes('script') && lower.includes('javascript') && (lower.includes('ia') || lower.includes('inteligencia'))) { showPermission('crear un asistente IA en JavaScript', () => { addMessage('He preparado un asistente JavaScript con historial, instrucciones y conexión a un backend. Descarga el archivo para abrirlo en VS Code.', 'assistant'); addAiScriptDownload(); }); return; }
  if (lower.includes('instálame') || lower.includes('instalame') || lower.includes('instala esta app')) { input.value = ''; input.style.height = 'auto'; showPermission('instalar una aplicación'); return; }
  if ((lower.includes('script') || lower.includes('código')) && (lower.includes('visual studio') || lower.includes('vs code') || lower.includes('hazme'))) { input.value = ''; input.style.height = 'auto'; showPermission('crear un script y prepararlo para Visual Studio Code'); return; }
  addMessage(clean, 'user');
  input.value = '';
  input.style.height = 'auto';
  showReply(clean);
}

composer.addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value); });
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 120)}px`; });
input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); composer.requestSubmit(); } });
document.querySelectorAll('.suggestion').forEach((button) => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
chatList.addEventListener('click', (event) => { const chatButton = event.target.closest('[data-chat]'); const menuButton = event.target.closest('[data-menu]'); if (chatButton) { activeChat = Number(chatButton.dataset.chat); state.messages = []; renderChats(); messages.innerHTML = ''; welcome.hidden = false; } if (menuButton) { const chatIndex = Number(menuButton.dataset.menu); openModal({ title: state.chats[chatIndex], eyebrow: 'Opciones de conversación', icon: '☷', content: '<p class="modal-copy">Cambia el nombre o elimina esta conversación.</p>', actions: '<button class="modal-secondary" data-close>Cancelar</button><button class="modal-secondary" id="renameChat">Cambiar nombre</button><button class="modal-danger" id="deleteChat">Borrar</button>' }); document.getElementById('renameChat').addEventListener('click', () => { closeModal(); showRename(chatIndex); }); document.getElementById('deleteChat').addEventListener('click', () => { closeModal(); showDelete(chatIndex); }); } });
document.getElementById('newChat').addEventListener('click', () => { state.chats.unshift('Nueva conversación'); activeChat = 0; state.messages = []; renderChats(); messages.innerHTML = ''; welcome.hidden = false; input.focus(); sidebar.classList.remove('open'); });
document.getElementById('mobileMenu').addEventListener('click', () => sidebar.classList.toggle('open'));
document.getElementById('themeToggle').addEventListener('click', () => { document.body.classList.toggle('dark'); document.getElementById('themeLabel').textContent = document.body.classList.contains('dark') ? 'Modo oscuro' : 'Modo claro'; });
document.getElementById('accountButton').addEventListener('click', showAccountMenu);
document.getElementById('workButton').addEventListener('click', showWorkCenter);
document.getElementById('moreButton').addEventListener('click', showToolsMenu);
document.getElementById('callButton').addEventListener('click', startCallMode);
document.getElementById('modalClose').addEventListener('click', closeModal);
modalLayer.addEventListener('click', (event) => { if (event.target === modalLayer || event.target.closest('[data-close]')) closeModal(); });
document.getElementById('guestButton').addEventListener('click', () => { sessionStorage.setItem('devaySession', 'active'); enterApp({ name: 'Invitado' }); });
document.getElementById('loginSwitch').addEventListener('click', () => showAuthMode('login'));
document.getElementById('signupSwitch').addEventListener('click', () => showAuthMode('signup'));
renderChats();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js?v=7', { updateViaCache: 'none' }).then((registration) => registration.update());
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!window.__devayReloaded) { window.__devayReloaded = true; location.reload(); } });
}
