const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CATALOG = `
Tienda: Aury Shop | Mercado Libre Mexico | auryshopmx@gmail.com

PRODUCTOS ACTIVOS:

1. Kit Mundialista 3 en 1 - $859 publico / $749 mayorista 2+ unidades
   Incluye: Selfie Stick Basico + Audifonos Future Pod ANC + Power Bank Slim01
   Ideal para: Hot Sale, Buen Fin, Navidad, San Valentin

2. Power Bank G-Tide Slim01 5000mAh - $429 publico
   Colores: Azul, Lila y Negro | Stock: ~5 unidades individuales
   Caracteristicas: 5000mAh, magnetico, carga rapida 20W, diseno slim
   Mayorista: 2+ pzas $399 c/u | 4+ pzas $349 c/u

3. Audifonos G-Tide Future Pod ANC - $449 publico
   Colores: Blanco y Negro | Stock: disponible
   Caracteristicas: True Wireless, ANC, pantalla tactil LCD, Bluetooth 5.3
   Mayorista: 2+ pzas $399 c/u

4. Selfie Stick Pro JC-35 - $259 publico
   Stock: 3 unidades | Bluetooth, extensible, tripode integrado
   Nota: Selfie Stick Basico SOLO en Kit Mundialista, no venta individual

5. Speaker Bluetooth G-Tide SV30 5W - $429 publico
   Colores: Negro x1 (Gris agotado)
   Caracteristicas: Bluetooth 5.4, IPX6 resistente al agua, bateria 5 horas, USB-C, TWS, microfono integrado

6. Speaker Bluetooth G-Tide SV01 5W - $329 publico
   Color: Azul x1
   Caracteristicas: Bluetooth 5.4, IPX6, soporte bicicleta/moto incluido, bateria 4 horas, USB-C, TWS

7. Set 4 Monedas Conmemorativas Copa Mundial FIFA 2026 Banxico - $1,199
   Stock: 2 sets completos
   Caracteristicas: Monedas oficiales Banco de Mexico, bimetalicas, dodecagonales 30mm, sin circular
   Disenos: CDMX, Guadalajara, Monterrey y Mexico (jaguar/mariposa monarca)
   Edicion limitada, dificil de conseguir, curso legal en Mexico

PROXIMAMENTE: Proyector PJ50 - $2,799

ENVIOS: Incluidos via Mercado Envios.
GARANTIA: Respaldada por politicas de Mercado Libre.
DEVOLUCIONES: Segun politica ML vigente.
PAGOS: Tarjeta, transferencia, OXXO, meses sin intereses.
`;

const SYSTEM = `Eres el asistente de atencion al cliente de Aury Shop, tienda en Mercado Libre Mexico.
Tu trabajo es responder preguntas de clientes de forma NATURAL, AMABLE y CONVERSACIONAL.

REGLAS:
- Responde como lo haria una vendedora amable y experta, no como un robot
- Maximo 4 lineas, directo al punto
- Usa 1-2 emojis maximo, solo cuando aporten
- Si no sabes algo, di "Te confirmo ese dato y te aviso"
- Nunca inventes informacion que no este en el catalogo
- Responde siempre en espanol
- Se organico: varia tus respuestas, no las repitas igual

CATALOGO:
${CATALOG}`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'text/plain';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
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

  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  serveFile(res, filePath);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Aury Shop Bot corriendo en puerto ${PORT}`));
