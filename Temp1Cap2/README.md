# OpenAI Real-Time API Voice Interaction Example

## Description
This project demonstrates how to use the OpenAI Real-Time API to send audio data from a client to OpenAI's servers and receive text responses. The example is built using Node.js and shows how to establish a WebSocket connection to interact with the API in real-time. It is particularly useful for applications that require real-time voice interaction, such as voice assistants or chatbots.

## Features
- Real-time voice interaction with OpenAI using WebSocket.
- Send audio data in PCM format for voice-to-text processing.
- Handle session creation, audio streaming, and response processing.

## Project Structure
- `client.js`: The main script that handles WebSocket communication, audio streaming, and OpenAI response management.
- `pregunta.pcm`: Example audio file used for sending to OpenAI.
- `.env`: File containing environment variables like the OpenAI API key.

## Prerequisites
- **Node.js** installed (version 14 or later).
- **OpenAI API Key**: Access to OpenAI's API and permission for real-time capabilities.
- **Audio File in PCM Format**: The API expects audio in PCM format, sampled at 16 kHz.

## Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd openai-voice-assistant
   ```
2. Install the required dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage
1. Convert your audio file to PCM format if it is not already in that format. For example, you can use FFmpeg:
   ```sh
   ffmpeg -i pregunta.wav -f s16le -ar 16000 -ac 1 pregunta.pcm
   ```
2. Run the client script to start the interaction:
   ```sh
   node client.js
   ```
3. The script will connect to OpenAI's API, send the audio, and display the response.

## Workflow Overview
1. **Initialization**: The client script (`client.js`) establishes a WebSocket connection with OpenAI.
2. **Audio Streaming**: The PCM audio file is streamed in chunks to OpenAI.
3. **Response Handling**: The client handles different types of responses from OpenAI, including errors and text outputs.

## Troubleshooting
- **API Access Issues**: Make sure your API key is valid and you have access to the real-time API feature.
- **File Not Found**: Ensure that the audio file (`pregunta.pcm`) exists in the correct path.
- **Audio Format**: Use PCM format audio files sampled at 16 kHz. The API requires a minimum of 100ms of audio data per transmission.

## Dependencies
- `dotenv`: For managing environment variables.
- `ws`: WebSocket library for establishing a connection with OpenAI.
- `fs`: File system module to read audio files.
- `path`: For managing file paths.

## License
This project is licensed under the MIT License. Feel free to use, modify, and distribute it as needed.

## Contributing
If you want to contribute to this project, please open an issue or submit a pull request. Contributions are welcome!

## Acknowledgments
- Special thanks to OpenAI for providing the API capabilities used in this example.

## Contact
For further questions, feel free to contact the repository maintainer or leave a comment.


