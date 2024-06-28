import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as mqtt from 'mqtt';
import { AppModule } from './app.module';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.init();

  const httpServer = http.createServer(server);
  const wss = new WebSocket.WebSocketServer({ server: httpServer });
  const client = mqtt.connect('mqtt://mosquitto');
  client.on('connect', () => {
    console.log('connected mqtt...')
    client.subscribe('low_voltage_topic', (err) => {
      if (err) throw err;
    });
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log("connection with wss established")

    client.on('message', (topic, message) => {
      ws.send(message.toString());
      console.log(message.toString());
    });
  });

  httpServer.listen(3000);
}
bootstrap();
