import http from "http";
import { app } from "./app.js";
import { initSocket } from "./socket/index.js";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

initSocket(server);  

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});