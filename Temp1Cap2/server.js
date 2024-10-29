require('dotenv').config();
const { WebSocketServer } = require('ws');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Configuración del servidor HTTP y WebSocket
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Ruta para verificar si el servidor está en ejecución
app.get('/', (req, res) => {
  res.send('Servidor WebSocket funcionando');
});

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  // Conectar con la API en tiempo real de OpenAI
  let openAiWs;
  try {
    openAiWs = new WebSocket('wss://api.openai.com/v1/realtime', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
  } catch (error) {
    console.error('Error al intentar conectar con OpenAI:', error);
    ws.send('Error al intentar conectar con OpenAI.');
    return;
  }

  // Manejar la conexión abierta con OpenAI
  openAiWs.on('open', () => {
    console.log('Conexión con OpenAI establecida');
  });

  // Enviar los datos del cliente a la API de OpenAI
  ws.on('message', (message) => {
    console.log(`Mensaje recibido del cliente: ${message}`);
    if (openAiWs.readyState === WebSocket.OPEN) {
      openAiWs.send(message);
    } else {
      console.error('Conexión con OpenAI no está abierta');
      ws.send('Error: conexión con OpenAI no está abierta.');
    }
  });

  // Enviar la respuesta de OpenAI de vuelta al cliente
  openAiWs.on('message', (data) => {
    try {
      const response = JSON.parse(data);
      if (response.error) {
        console.error("Error del servidor OpenAI:", response.error);
        ws.send('Error al procesar la solicitud.');
        return;
      }
      ws.send(response.text);
    } catch (error) {
      console.error('Error al procesar la respuesta de OpenAI:', error);
      ws.send('Error al procesar la respuesta de OpenAI.');
    }
  });

  // Manejo de cierre de conexión del cliente
  ws.on('close', () => {
    console.log('Cliente desconectado');
    if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
      openAiWs.close();
    }
  });

  // Manejo de errores en la conexión con el cliente
  ws.on('error', (error) => {
    console.error('Error en la conexión con el cliente:', error);
  });

  // Manejo de errores en la conexión con OpenAI
  openAiWs.on('error', (error) => {
    console.error('Error en la conexión con OpenAI:', error);
    ws.send('Error en la conexión con OpenAI.');
  });

  // Manejo de cierre de conexión con OpenAI
  openAiWs.on('close', () => {
    console.log('Conexión con OpenAI cerrada');
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8081; // Cambié el puerto a 8081 para evitar conflictos
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

