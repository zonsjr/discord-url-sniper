import tls from 'tls';
import WebSocket from 'ws';
import extractJsonFromString from 'extract-json-from-string';
import axios from 'axios';
import https from 'https';
import http from 'http';
const token = 'zons-duck-rush'; // sılın token gırın amk.
const serverId = ''; // server ıd gır
const gatewayURL = 'wss://gateway-us-east1-b.discord.gg';
const webhookURL = ''; // webhook gir
const guilds = {};
let vanity;
let currentMfaToken = '';
const sessionCache = new Map();
async function connectTLS() {
    const tlsSocket = tls.connect({
      host: 'canary.discord.com',
      port: 8443,
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.2',
      handshakeTimeout: 0,
      rejectUnauthorized: false,
      zeroRtt: true,
      servername: 'canary.discord.com',
      keepAlive: true,
      session: sessionCache.get('canary.discord.com'),
    });
  tlsSocket.on('data', handleData);
  tlsSocket.on('end', reconnect);
  tlsSocket.on('secureConnect', () => (connectWebSocket(), tlsSocket.setNoDelay(true)));
  tlsSocket.on('session', (session) => sessionCache.set('canary.discord.com', session));
  tlsSocket.on('error', reconnect);
  function handleData(data) {
    const ext = extractJsonFromString(data.toString());
    const find = ext.find((e) => e.code || e.message);
    if (find) {
      notifyWebhook(find);
    }
  }
  async function notifyWebhook(find) {
    const requestBody = {
        content: `*${vanity}* @everyone`,
        username: ':)',
        avatar_url: 'https://cdn.discordapp.com/attachments/1341539987770048573/1342120905366700134/image.png?ex=67b87aff&is=67b7297f&hm=839c82ddc4f559155ba3a7f33b98ef62ca0587fadf0dd60fc8d418b2de328e50&',
        embeds: [
            {
                title: 'duckevils x zons x rush x ',
                description: `\`\`\`${JSON.stringify(find)}\`\`\``,
                color: 0x00ff00, 
                image: {
                    url: 'https://tenor.com/view/happy-monkey-dance-funny-gif-18218386',
                },
                fields: [
                    {
                        name: 'Vanity URL',
                        value: `\`${vanity}\``,
                        inline: true
                    },
                    {
                        name: 'Guild ID',
                        value: `\`${serverId}\``,
                        inline: false
                    },
                ],
                footer: {
                    text: `zons </> 1988 | ${new Date().toLocaleString('tr-TR', { hour12: false })}`,
                    icon_url: 'https://tenor.com/view/happy-monkey-dance-funny-gif-18218386'
                },
                timestamp: new Date().toISOString()
            }
        ]
    };
    try {
        await axios.post(webhookURL, requestBody);
    } catch (error) {
        console.error('Failed to notify webhook:', error);
    }
}
  const agent = new https.Agent({
    keepAlive: true,
    secureProtocol: 'TLSv1_2_method',
    rejectUnauthorized: false,
    session: sessionCache.get("canary.discord.com")
  });
  async function performPatchRequest(vanityCode) {
  const requestBody = { code: vanityCode };
  vanity = vanityCode;
  const headers = {
    Authorization: token,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9164 Chrome/124.0.6367.243 Electron/30.2.0 Safari/537.36',
    'X-Super-Properties': 'eyJvcyI6IkFuZHJvaWQiLCJicm93c2VyIjoiQW5kcm9pZCBDaHJvbWUiLCJkZXZpY2UiOiJBbmRyb2lkIiwic3lzdGVtX2xvY2FsZSI6InRyLVRSIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMDsgTmV4dXMgNSBCdWlsZC9NUkE1OE4pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMzEuMC4wLjAgTW9iaWxlIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIxMzEuMC4wLjAiLCJvc192ZXJzaW9uIjoiNi4wIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tL2NoYW5uZWxzL0BtZS8xMzAzMDQ1MDIyNjQzNTIzNjU1IiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyaW5nX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjozNTU2MjQsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGwsImhhc19jbGllbnRfbW9kcyI6ZmFsc2V9=',
    'X-Discord-MFA-Authorization': currentMfaToken,
    Cookie: `__Secure-recent_mfa=${currentMfaToken}`,
  };
  const config = {
    headers,
    httpsAgent: agent,
    maxRedirects: 0,
  };
try {
    await Promise.all([tlsRequest(requestBody), axios.patch(`https://canary.discord.com/api/v7/guilds/${serverId}/vanity-url`, requestBody, config)]);
  } catch (error) {
    console.error('Failed to send PATCH request:', error);
  }
}
  function tlsRequest(requestBody) {
    tlsSocket.write(
      `PATCH /api/v9/guilds/${serverId}/vanity-url HTTP/1.1\r\n` +
      `Host: canary.discord.com\r\n` +
      `Authorization: ${token}\r\n` +
      `Content-Type: application/json\r\n` +
      `Content-Length: ${JSON.stringify(requestBody).length}\r\n` +
      `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.1130 Chrome/128.0.6613.186 Electron/32.2.7 Safari/537.36\r\n` +
      `X-Super-Properties: eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJwdGIiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC4xMTMwIiwib3NfdmVyc2lvbiI6IjEwLjAuMTkwNDUiLCJvc19hcmNoIjoieDY0IiwiYXBwX2FyY2giOiJ4NjQiLCJzeXN0ZW1fbG9jYWxlIjoidHIiLCJoYXNfY2xpZW50X21vZHMiOmZhbHNlLCJicm93c2VyX3VzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBkaXNjb3JkLzEuMC4xMTMwIENocm9tZS8xMjguMC42NjEzLjE4NiBFbGVjdHJvbi8zMi4yLjcgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6IjMyLjIuNyIsIm9zX3Nka192ZXJzaW9uIjoiMTkwNDUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjozNjY5NTUsIm5hdGl2ZV9idWlsZF9udW1iZXIiOjU4NDYzLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==\r\n` +
      `X-Discord-MFA-Authorization: ${currentMfaToken}\r\n` +
      `Cookie: __Secure-recent_mfa=${currentMfaToken}\r\n` +
      `\r\n` +
      JSON.stringify(requestBody),
      'utf-8'
    );
  }  
  function connectWebSocket() {
    const websocket = new WebSocket(gatewayURL);
    websocket.onclose = reconnect;
    websocket.onmessage = handleWebSocketMessage;
    websocket.onopen = () => {
      websocket.send(
        JSON.stringify({
          op: 2,
          d: {
            token: token,
            intents: 1,
            properties: {
              os: 'zons',
              browser: 'rush',
              device: 'duckevils',
            },
            zero_rtt: true,
            guild_subscriptions: false,
          },
        })
      );
      setInterval(() => websocket.send(JSON.stringify({ op: 1, d: {} })), 41250);
    };
  }
  function handleWebSocketMessage(message) {
    const { d, op, t } = JSON.parse(message.data);
    switch (t) {
      case 'GUILD_UPDATE': {
        const find = guilds[d.guild_id];
        if (find && find !== d.vanity_url_code) {
            performPatchRequest(find);  
        }
        break;
      }
      case 'READY': {
        d.guilds.forEach((guild) => {
          if (guild.vanity_url_code) {
            guilds[guild.id] = guild.vanity_url_code;
            console.log(` 1988xVanitySniper|| GUİLDS => ${guild.id} || VANITY => ${guild.vanity_url_code}`);
          }
        });
        break;
      }
      default: {
        if (op === 7) {
          reconnect();
        }
        break;
      }
    }
  }
  function reconnect() {
    setTimeout(connectTLS, 1000);
  }
  setInterval(() => {
    tlsSocket.write('GET / HTTP/1.1\r\nHost: canary.discord.com\r\n\r\n');
  }, 7500);
}
connectTLS();
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/duckevilsontop') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { mfaToken: receivedToken } = JSON.parse(body);
        if (receivedToken) {
          currentMfaToken = receivedToken;
          console.log(`[${new Date().toLocaleTimeString()}] > MFA Token AlÄ±ndÄ±: ${receivedToken}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'MFA token received and set.' }));
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing mfaToken in the request.');
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON format.');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
server.listen(6931, () => {
});
// bizim yegenlerimize attıgımız kodu maın dıye publayan çıraklarımıza for hesabıııııııı xd
