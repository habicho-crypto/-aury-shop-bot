const http = require('http');
const https = require('https');

const CATALOG = `
Tienda: Aury Shop | Mercado Libre México | auryshopmx@gmail.com

PRODUCTOS ACTIVOS:
1. Kit Mundialista 3 en 1 — $859 público / $749 mayorista 2+ unidades
   Incluye: Selfie Stick Básico + Audífonos Future Pod ANC + Power Bank Slim01
   Ideal para: Hot Sale mayo, Buen Fin noviembre, Navidad, San Valentín

2. Power Bank G-Tide Slim01 5000mAh — $429 público
   Colores: Azul, Lila y Negro | Stock: ~5 unidades individuales
   Características: 5000mAh, magnético, carga rápida 20W, diseño slim
   Mayorista: 2+ pzas $399 c/u | 4+ pzas $349 c/u

3. Audífonos G-Tide Future Pod ANC — $449 público
   Colores: Blanco, Negro y Lila | Stock: 5 unidades individuales
   Características: True Wireless, ANC, pantalla táctil LCD, Bluetooth 5.3
   Mayorista: 2+ pzas $399 c/u | Publicación Premium ML

4. Selfie Stick Pro JC-35 — $259 público
   Stock: 3 unidades | Bluetooth, extensible, trípode integrado
   Nota: Selfie Stick Básico SOLO en Kit Mundialista, no venta individual

PRÓXIMAMENTE: Proyector PJ50 — $2,799

ENVÍOS: Incluidos vía Mercado Envíos. Tiempos según ubicación.
GARANTÍA: Respaldada por políticas de Mercado Libre.
DEVOLUCIONES: Según política ML vigente.
PAGOS: Tarjeta, transferencia, OXXO, meses sin intereses.
COMPATIBILIDAD: Power Bank compatible con iPhone y Android. Audífonos Bluetooth 5.3 con cualquier smartphone.
`;

const SYSTEM = `Eres el asistente de atención al cliente de Aury Shop, tienda en Mercado Libre México.
Tu trabajo es responder preguntas de clientes de forma NATURAL, AMABLE y CONVERSACIONAL.

REGLAS:
- Responde como lo haría una vendedora amable y experta, no como un robot
- Máximo 4 líneas, directo al punto
- Usa 1-2 emojis máximo, solo cuando aporten
- Si no sabes algo, di "Te confirmo ese dato y te aviso 😊"
- Nunca inventes información que no esté en el catálogo
- Responde siempre en español
- Si preguntan por varios productos, menciónalos todos con sus precios
- Sé orgánico: varía tus respuestas, no las repitas igual

CATÁLOGO:
${CATALOG}`;

function callGroq(messages, callback) {
  const body = JSON.stringify({
    model: 'llama-3.1-8b-instant',
    max_tokens: 300,
    messages: [
      { role: 'system', content: SYSTEM },
      ...messages
    ]
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.message?.content || 'Lo siento, intenta de nuevo.';
        callback(null, text);
      } catch(e) {
        callback(e);
      }
    });
  });

  req.on('error', callback);
  req.write(body);
  req.end();
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { messages } = JSON.parse(body);
        callGroq(messages, (err, reply) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply }));
        });
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Aury Shop Bot API con Groq — OK');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Aury Shop Bot corriendo en puerto ${PORT}`));
