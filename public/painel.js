const SEND_BASE = 'https://whatsapptest-stij.onrender.com';

const disparoState = {
  running: false,
  paused: false,
  index: 0,
  numbers: [],
  mensagem: '',
  timer: null
};

function formatNumero(n) {
  n = String(n).replace(/\D/g, '');
  if (n.startsWith('55') && n.length === 13 && n[4] === '9') {
    n = n.slice(0, 4) + n.slice(5);
  }
  return n;
}

async function sendToApi(numero, mensagem) {
  const url = `${SEND_BASE}/send?para=${numero}&mensagem=${encodeURIComponent(mensagem)}`;
  try {
    await fetch(url);
  } catch (err) {
    console.error('Falha ao enviar', numero, err);
  }
}

function sendNext() {
  if (!disparoState.running || disparoState.paused) return;
  if (disparoState.index >= disparoState.numbers.length) {
    disparoState.running = false;
    return;
  }
  const num = disparoState.numbers[disparoState.index];
  sendToApi(num, disparoState.mensagem).finally(() => {
    disparoState.index++;
    const delay = Math.floor(Math.random() * (210 - 30 + 1) + 30) * 1000;
    disparoState.timer = setTimeout(sendNext, delay);
  });
}

function iniciar() {
  const numeros = document.getElementById('numeros').value;
  const mensagem = document.getElementById('mensagem').value;
  disparoState.numbers = numeros.split(',').map(n => formatNumero(n.trim())).filter(Boolean);
  disparoState.mensagem = mensagem;
  disparoState.index = 0;
  disparoState.paused = false;
  disparoState.running = true;
  clearTimeout(disparoState.timer);
  sendNext();
}

function pausar() {
  if (!disparoState.running) return;
  disparoState.paused = true;
  clearTimeout(disparoState.timer);
}

function continuar() {
  if (!disparoState.running || !disparoState.paused) return;
  disparoState.paused = false;
  sendNext();
}

document.getElementById('iniciar').addEventListener('click', iniciar);
document.getElementById('pausar').addEventListener('click', pausar);
document.getElementById('continuar').addEventListener('click', continuar);
