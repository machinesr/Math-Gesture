import { io } from "socket.io-client";

const currentHost = window.location.hostname; 


const SOCKET_URL = `http://${currentHost}:8000`; 

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});