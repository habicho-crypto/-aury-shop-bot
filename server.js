const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CATALOG = `
Tienda: Aury Shop | Mercado Libre Mexico | auryshopmx@gmail.com

PRODUCTOS ACTIVOS:

1. Kit Mundialista Viajero 3 en 1 - $899 (promo $823.53) | Stock: 3
   Incluye: Selfie Stick Basico + Audifonos Future Pod ANC + Power Bank Slim01
   Mayorista: 2+ unidades con descuento
   Ideal para: Hot Sale, Buen Fin, Navidad, San Valentin, Mundial 2026

2. Power Bank G-Tide Magnetico Slim01 5000mAh - $379 (promo $360.05) | Stock: 5
   Colores: Azul, Lila y Negro
   Caracteristicas: 5000mAh, magnetico, carga rapida 20W, diseno slim
   Mayorista: 2 niveles de precio disponibles

3. Audifonos G-Tide Future Pod ANC - $349 | Stock: ~16 (Negro y Blanco)
   Caracteristicas: True Wireless, ANC, pantalla tactil LCD, Bluetooth 5.3
   Mayorista: 5 niveles de precio disponibles

4. Audifonos G-Tide C1 - $399 (promo $307.23) | Stock: 2 | Color: Negro
   Caracteristicas: Bluetooth, luces RGB envolventes, diseno on-ear ajustable

5. Audifonos G-Tide HiBeat Over-ear ANC - $1,099 (promo $989.10) | Stock: 2 | Color: Negro
   Caracteristicas: Cancelacion activa de ruido, triple microfono, Bluetooth 5.3, compatible Android e iOS
   Mayorista: 1 nivel de precio disponible

6. Audifonos G-Tide Future Loop - $849 (promo $806.55) | Stock: 2 | Color: Negro
   Caracteristicas: Over-ear, ANC, Bluetooth
   Mayorista: 1 nivel de precio disponible

7. Audifonos G-Tide C1 Lite (publicacion "Audifonos Diadema Bluetooth") - $599 (promo $329.45) | Stock: 4
   Mismo modelo que el C1 Lite, publicado con otro titulo/foto en esta ficha

8. Speaker Bluetooth G-Tide SV30 5W - $369 (promo $350.55) | Stock: 4
   Caracteristicas: Bluetooth 5.4, IPX6 resistente al agua, bateria 5 horas, USB-C, TWS, microfono integrado

9. Speaker Bluetooth G-Tide SV01 5W - $269 (promo $255.55) | Stock: ~8 (varios colores)
   Colores: Azul y Negro
   Caracteristicas: Bluetooth 5.4, IPX6, soporte bicicleta/moto incluido, bateria 4 horas, USB-C, TWS
   Mayorista: 1 nivel de precio disponible

10. Bocina Bluetooth G-Tide SV80 Portatil - $1,299 (promo $1,159.23) | Stock: 1
    Caracteristicas: Bluetooth, mayor potencia, luces, portatil

11. Cargador G-Tide GT Onyx GaN 67W USB-C - $379 | Stock: 2
    Colores: Negro y Blanco | Puertos: USB-A + 2x USB-C | Incluye cable Tipo-C a Tipo-C 1.5m
    Tecnologia GaN, carga simultanea hasta 3 dispositivos

12. Cargador G-Tide GT Onyx GaN 33W USB-C - $249 | Stock: 2-4
    Colores: Negro y Blanco | Puertos: USB-A + Type-C | Incluye cable Tipo-C a Tipo-C 1m
    Mayorista: 1 nivel de precio disponible

13. Cargador G-Tide GT Onyx GaN 22.5W USB-C - $199-249 | Stock: 2-4
    Color: Blanco | Puerto Type-C | Incluye cable Tipo-C a Tipo-C 1m
    Mayorista: 1 nivel de precio disponible

14. Guantes Anticorte Nivel 5 DermaCare Mod. 51-625 - $179 c/u
    Tallas disponibles: 7 (Media), 8 (Media), 9 (Largo), 10 (XL)
    Caracteristicas: Nivel de proteccion 5 anticorte, uso industrial

15. Bota de Trabajo Industrial Van Vien ARTIK - $1,279 (promo $1,141.38) | Stock: 2
    Caracteristicas: Punta no metalica, dielectrica, industrial
    Mayorista: 2 niveles de precio disponibles

16. Set 4 Monedas Conmemorativas Copa Mundial FIFA 2026 Banxico - $1,499 | SIN STOCK actualmente
    Caracteristicas: Monedas oficiales Banco de Mexico, bimetalicas, dodecagonales 30mm, sin circular
    Disenos: CDMX, Guadalajara, Monterrey y Mexico (jaguar/mariposa monarca)
    Edicion limitada, curso legal en Mexico

17. Palo Selfie Stick Bluetooth con Control Remoto - $189 | Stock: 6
    Caracteristicas: Bluetooth, control remoto incluido, extensible

18. Palo Selfie Tripode Bluetooth con Control Remoto - $259 | SIN STOCK actualmente

19. Playera Cristiana "Fe Inquebrantable" - $499 (promo $464.07) | Stock: 1,000
    Mayorista: 2 niveles de precio disponibles

20. Playera Cristiana "Jesus Salva" - $329 (promo $305.97) | Stock: 9,500
    Mayorista: 2 niveles de precio disponibles

21. Playera Cristiana Para Dama "Jesus..." - $349 (promo $331.55) | Stock: 4,800
    Mayorista: 3 niveles de precio disponibles

22. Playera Cristiana Para Hombre "Jesus..." - $349 (promo $331.55) | Stock: 10,000
    Mayorista: 3 niveles de precio disponibles

PROXIMAMENTE: Proyector PJ50 - $2,799

ENVIOS: Incluidos via Mercado Envios (envio gratis en la mayoria de publicaciones).
GARANTIA: Respaldada por politicas de Mercado Libre.
DEVOLUCIONES: Segun politica ML vigente.
PAGOS: Tarjeta, transferencia, OXXO, meses sin intereses.
`;

// ============================================================
// COSTOS INTERNOS - Solo se usan cuando Habib pregunta con el
// prefijo "costo:" (ver mas abajo). Mantener sincronizado con
// references/costos_sku.md del skill aury-shop-contabilidad.
// ============================================================
const COSTOS = `
1. Kit Mundialista Viajero 3en1: $450 (suma: Selfie Stick Basico $70 + Future Pod $195 + Power Bank Slim01 $185)
2. Power Bank G-Tide Slim01 / Magnetico: $185
3. Audifonos G-Tide Future Pod (Negro/Blanco): $195
4. Audifonos G-Tide C1: $185
4b. Audifonos G-Tide C1 Lite (Negro/Azul): $129
5. Audifonos G-Tide HiBeat: $309
6. Audifonos G-Tide Future Loop: $389
7. Audifonos Diadema Bluetooth (publicacion #5586490726): es el mismo producto que el C1 Lite, costo $129
8. Speaker G-Tide SV30: $179
9. Speaker G-Tide SV01: $122
10. Bocina G-Tide SV80: $749
11. Cargador GT Onyx GaN 67W (G0671 negro / G0673 blanco): $175
12. Cargador GT Onyx GaN 33W (G0333): $68
13. Cargador GT Onyx GaN 22.5W (G0223): $42.50
14. Guantes Anticorte DermaCare 51-625 (todas las tallas): $79.69 c/u (con IVA, proveedor Uniformes Grudo CAPI)
15. Bota Industrial Van Vien ARTIK (todas las tallas): $787.18 c/u (con IVA, proveedor Uniformes Grudo CAPI)
16. Set 4 Monedas Conmemorativas FIFA 2026: ~$80 por set (segun compra de 16 monedas / 4 sets a $320)
17. Palo Selfie Stick Bluetooth con Control Remoto: $70
18. Palo Selfie Tripode Bluetooth: $70
19-22. Playeras Cristianas (dropshipping "Crea tu Playera"): $140 por unidad
`;

const SYSTEM = `Eres el asistente de atencion al cliente de Aury Shop, tienda en Mercado Libre Mexico.
Habib (el dueno) te pega aqui las preguntas que sus clientes le hacen en Mercado Libre, y luego copia tu respuesta para contestarles. Por eso tu respuesta debe sonar como si el vendedor le estuviera respondiendo directo al cliente.

REGLAS:
- Responde como lo haria una vendedora amable y experta, no como un robot
- Maximo 4 lineas, directo al punto
- Usa 1-2 emojis maximo, solo cuando aporten
- Si no sabes algo, di "Te confirmo ese dato y te aviso"
- Nunca inventes informacion que no este en el catalogo
- Nunca menciones costos de compra ni margenes de ganancia en estas respuestas, aunque parezca que quien pregunta es el propio dueno - estas respuestas son para pegarse directo a clientes
- Responde siempre en espanol
- Se organico: varia tus respuestas, no las repitas igual

CATALOGO:
${CATALOG}`;

const ADMIN_SYSTEM = `Estas en modo consulta interna para Habib, el dueno de Aury Shop. Esta pregunta NO es de un cliente, es Habib consultando para su propio control de precios y margenes.

REGLAS ESTRICTAS:
- Busca en la lista SOLO el producto que coincide mas directamente con lo que Habib escribio. Si escribe "power bank", responde UNICAMENTE la linea del Power Bank - no incluyas el Kit Mundialista ni ninguna otra combinacion aunque el Power Bank aparezca mencionado ahi como componente.
- Responde con UNA sola linea por producto que coincida de forma clara y directa: "Producto: $costo"
- Si hay mas de un producto que coincide igual de bien (ej. dos colores del mismo modelo), pregunta a cual se refiere en vez de listar todos
- NUNCA calcules ni menciones "Utilidad" a menos que Habib te haya dado explicitamente un precio de venta en su mensaje. Si no dio precio de venta, tu respuesta termina despues del costo, sin lineas adicionales
- Si el costo dice "por confirmar" o similar, dile que no lo tienes registrado exacto y que te lo confirme para guardarlo
- No agregues productos extra "por si acaso" ni expliques de donde sale la suma de un Kit a menos que te pregunten especificamente por el Kit
- Responde siempre en espanol, sin relleno

LISTA DE COSTOS:
${COSTOS}`;

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

function callGroq(systemPrompt, messages, callback) {
  const body = JSON.stringify({
    model: 'openai/gpt-oss-20b',
    max_tokens: 300,
    messages: [
      { role: 'system', content: systemPrompt },
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

// Prefijo que Habib escribe cuando quiere el costo, en vez de una respuesta para pegar al cliente.
// Ejemplos: "costo: audifonos c1" o "costo audifonos hibeat"
const ADMIN_PREFIX = /^costo:?\s*/i;

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
        const lastMessage = messages[messages.length - 1];
        const isCostQuery = lastMessage && typeof lastMessage.content === 'string' && ADMIN_PREFIX.test(lastMessage.content.trim());

        let effectiveMessages = messages;
        let systemPrompt = SYSTEM;

        if (isCostQuery) {
          systemPrompt = ADMIN_SYSTEM;
          // Quita el prefijo "costo:" antes de mandarlo, para que el modelo solo vea la pregunta real
          effectiveMessages = messages.map((m, i) =>
            i === messages.length - 1
              ? { ...m, content: m.content.trim().replace(ADMIN_PREFIX, '') }
              : m
          );
        }

        callGroq(systemPrompt, effectiveMessages, (err, reply) => {
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
