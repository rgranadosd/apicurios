require('dotenv').config();
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const OPENAI_REALTIME_API_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Archivo de audio que se enviará a la API
const AUDIO_FILE_PATH = path.join(__dirname, '/sample/pregunta.pcm');

// Verificar que el archivo de audio exista
if (!fs.existsSync(AUDIO_FILE_PATH)) {
    console.error('Error: El archivo de audio no existe:', AUDIO_FILE_PATH);
    process.exit(1);
}

// Configuración del WebSocket para la API en tiempo real de OpenAI
const socket = new WebSocket(OPENAI_REALTIME_API_URL, {
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'openai-beta': 'realtime=v1'
    }
});

let accumulatedAudio = Buffer.alloc(0);

socket.on('open', () => {
    console.log('Conexión establecida con éxito a la API en tiempo real de OpenAI');

    // Leer el archivo de audio y enviarlo a la API
    const audioStream = fs.createReadStream(AUDIO_FILE_PATH, { highWaterMark: 1024 }); // Ajuste del tamaño del chunk para el formato pcm16
    audioStream.on('data', (chunk) => {
        accumulatedAudio = Buffer.concat([accumulatedAudio, chunk]);
        if (socket.readyState === WebSocket.OPEN && accumulatedAudio.length >= 1600) { // Aproximadamente 100 ms de audio a 16 kHz, 16 bits mono
            socket.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: accumulatedAudio.toString('base64') }));
            accumulatedAudio = Buffer.alloc(0);
        }
    });

    // Enviar un mensaje de finalización cuando se termine de enviar el audio
    audioStream.on('end', () => {
        if (socket.readyState === WebSocket.OPEN) {
            if (accumulatedAudio.length > 0) {
                socket.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: accumulatedAudio.toString('base64') }));
            }
            socket.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        }
        console.log('Envío del archivo de audio completo');
    });
});

socket.on('message', (data) => {
    console.log('Respuesta cruda de OpenAI:', data.toString());
    try {
        const response = JSON.parse(data.toString());
        if (response.error) {
            console.error('Error del servidor OpenAI:', response.error);
            return;
        }
        if (response.type === 'session.created') {
            console.log('Sesión creada con ID:', response.session.id);
        }
        if (response.type === 'text' && response.text) {
            console.log('Respuesta de OpenAI:', response.text);
        } else {
            console.log('Otro tipo de respuesta de OpenAI:', response);
        }
    } catch (error) {
        console.error('Error al procesar la respuesta de OpenAI:', error);
    }
});

socket.on('error', (error) => {
    console.error('Error en la conexión WebSocket con OpenAI:', error);
});

socket.on('close', () => {
    console.log('Conexión con OpenAI cerrada');
});
