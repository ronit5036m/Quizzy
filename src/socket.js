import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL); // Connect to backend via .env variable

export default socket;
