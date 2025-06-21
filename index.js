const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const qrcode = require('qrcode');
const fs = require('fs');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SESSION_COUNT = 3;
const sessions = {};
for (let i = 1; i <= SESSION_COUNT; i++) {
  sessions[i] = { sock: null, qr: null };
}
const NUMBERS_FILE = 'numbers.json';
let numbers = [];
const upload = multer({ dest: 'uploads/' });

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
  const url = `https://whatsapptest-stij.onrender.com/send?para=${numero}&mensagem=${encodeURIComponent(mensagem)}`;
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

function loadNumbers() {
  if (fs.existsSync(NUMBERS_FILE)) {
    numbers = JSON.parse(fs.readFileSync(NUMBERS_FILE));
  }
}

function saveNumbers() {
  fs.writeFileSync(NUMBERS_FILE, JSON.stringify(numbers, null, 2));
}

function getAllFiles(dir, base = dir) {
  const result = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, getAllFiles(full, base));
    } else {
      try {
        const rel = path.relative(base, full);
        result[rel] = fs.readFileSync(full, 'utf8');
      } catch (err) {
        result[rel] = '[binary]';
      }
    }
  }
  return result;
}



app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/painel', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});
loadNumbers();

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/status', (_, res) => {
  res.set('Cache-Control', 'no-store');
  const status = {};
  for (const id of Object.keys(sessions)) {
    status[id] = !!(sessions[id].sock && sessions[id].sock.user);
  }
  res.json(status);
});

app.post('/connect/:id?', (req, res) => {
  const id = req.params.id || '1';
  const session = sessions[id];
  if (session.sock && session.sock.user) {
    return res.send('Já conectado');
  }
  startBot(id);
  res.send('Iniciando conexão');
});

app.get('/numbers', (_, res) => {
  res.json(numbers);
});

app.get('/info', (_, res) => {
  const data = getAllFiles(__dirname);
  res.json(data);
});

// Lista todos os grupos que o bot participa
app.get('/grupos', async (_, res) => {
  const session = sessions['1'];
  if (!session.sock) return res.status(500).send('Bot não iniciado');
  try {
    const grupos = await session.sock.groupFetchAllParticipating();
    const lista = Object.values(grupos).map(g => ({ id: g.id, nome: g.subject }));
    res.json(lista);
  } catch (err) {
    console.error('Erro ao listar grupos:', err);
    res.status(500).send('Erro ao listar grupos');
  }
});

// Mostra os integrantes de um grupo específico
app.get('/grupos/:nome', async (req, res) => {
  const session = sessions['1'];
  if (!session.sock) return res.status(500).send('Bot não iniciado');
  const nome = req.params.nome.toLowerCase();
  try {
    const grupos = await session.sock.groupFetchAllParticipating();
    const grupo = Object.values(grupos).find(g => g.subject.toLowerCase() === nome);
    if (!grupo) return res.status(404).send('Grupo não encontrado');
    const meta = await session.sock.groupMetadata(grupo.id);
    const participantes = meta.participants.map(p => ({
      numero: p.id.split('@')[0],
      admin: !!p.admin
    }));
    res.json({ id: meta.id, nome: meta.subject, participantes });
  } catch (err) {
    console.error('Erro ao obter informações do grupo:', err);
    res.status(500).send('Erro ao obter informações do grupo');
  }
});

app.post('/add-number', (req, res) => {
  const numero = req.body.numero;
  if (!numero) return res.status(400).send('Número é obrigatório');
  if (!numbers.includes(numero)) {
    numbers.push(numero);
    saveNumbers();
  }
  res.send('Número adicionado');
});

app.post('/upload-numbers', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('Arquivo é obrigatório');
  try {
    if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);
      data.forEach(r => {
        const n = r.numero || r.number;
        if (n && !numbers.includes(String(n))) numbers.push(String(n));
      });
    } else if (file.originalname.endsWith('.csv')) {
      const content = fs.readFileSync(file.path);
      const records = parse(content, { columns: true, skip_empty_lines: true });
      records.forEach(r => {
        const n = r.numero || r.number;
        if (n && !numbers.includes(String(n))) numbers.push(String(n));
      });
    } else {
      fs.unlinkSync(file.path);
      return res.status(400).send('Formato não suportado');
    }
    saveNumbers();
    fs.unlinkSync(file.path);
    res.send('Números adicionados');
  } catch (err) {
    console.error('Erro ao processar arquivo:', err);
    res.status(500).send('Erro ao processar arquivo');
  }
});

app.post('/disparo', async (req, res) => {
  const { mensagem, intervalo } = req.body;
  if (!mensagem) return res.status(400).send('Mensagem é obrigatória');
  const session = sessions['1'];
  if (!session.sock) return res.status(500).send('Bot não iniciado');
  const delay = parseInt(intervalo || 1000);
  (async () => {
    for (const num of numbers) {
      try {
        await session.sock.sendMessage(`${num}@s.whatsapp.net`, { text: mensagem });
        await new Promise(r => setTimeout(r, delay));
      } catch (e) {
        console.error('Erro ao enviar para', num, e);
      }
    }
  })();
  res.send('Disparo iniciado');
});

app.post('/disparar', (req, res) => {
  const { numeros, mensagem } = req.body;
  if (!numeros || !mensagem) return res.status(400).send('Números e mensagem são obrigatórios');
  disparoState.numbers = numeros.split(',').map(n => formatNumero(n.trim())).filter(Boolean);
  disparoState.mensagem = mensagem;
  disparoState.index = 0;
  disparoState.paused = false;
  disparoState.running = true;
  clearTimeout(disparoState.timer);
  sendNext();
  res.send('Disparo iniciado');
});

app.post('/pausar', (_, res) => {
  if (!disparoState.running) return res.status(400).send('Nenhum disparo em andamento');
  disparoState.paused = true;
  clearTimeout(disparoState.timer);
  res.send('Disparo pausado');
});

app.post('/continuar', (_, res) => {
  if (!disparoState.running) return res.status(400).send('Nenhum disparo em andamento');
  if (!disparoState.paused) return res.status(400).send('Disparo não está pausado');
  disparoState.paused = false;
  sendNext();
  res.send('Disparo retomado');
});

app.get('/qr/:id?', (req, res) => {
  const id = req.params.id || '1';
  const qr = sessions[id].qr;
  if (qr) {
    res.json({ qr });
  } else {
    res.status(404).send('QR Code não disponível.');
  }
});

app.post('/disconnect/:id?', async (req, res) => {
  const id = req.params.id || '1';
  const session = sessions[id];
  if (!session.sock) return res.status(400).send('Bot não conectado');
  try {
    await session.sock.logout();
  } catch (err) {
    console.error('Erro ao deslogar:', err);
  }
  session.sock.end();
  session.sock = null;
  session.qr = null;
  const dir = path.join(__dirname, `auth_info_baileys_${id}`);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  res.send('Desconectado');
});

app.get('/send/:id?', async (req, res) => {
  const id = req.params.id || '1';
  const para = req.query.para;
  const mensagem = req.query.mensagem;
  if (!para || !mensagem) {
    return res.status(400).send('Parâmetros "para" e "mensagem" são obrigatórios.');
  }
  const session = sessions[id];
  if (!session.sock) return res.status(500).send('Bot não iniciado');
  try {
    await session.sock.sendMessage(`${para}@s.whatsapp.net`, { text: mensagem });
    res.send('Mensagem enviada');
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    res.status(500).send('Erro ao enviar mensagem');
  }
});

// Endpoint para verificações via método HEAD
app.head('/secure', (_, res) => {
  res.status(200).end();
});

async function startBot(id = '1') {
  const { state, saveCreds } = await useMultiFileAuthState(`auth_info_baileys_${id}`);
  const sock = makeWASocket({ auth: state, printQRInTerminal: false });
  sessions[id].sock = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      sessions[id].qr = await qrcode.toDataURL(qr);
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) &&
        (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);
      if (shouldReconnect) {
        console.log(`Tentando reconectar instancia ${id}...`);
        startBot(id);
      }
    } else if (connection === 'open') {
      sessions[id].qr = null;
      console.log(`Instancia ${id} conectada ao WhatsApp`);
    }
  });

}

for (let i = 1; i <= SESSION_COUNT; i++) {
  startBot(String(i));
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
