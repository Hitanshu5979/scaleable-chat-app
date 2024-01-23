import { Server } from "socket.io";
import Redis from "ioredis";

import { config } from "../config/config";
const { redisUri } = config;

if (!redisUri) {
  console.error(
    "REDIS_CONNECTION_STRING is not defined in the environment variables."
  );
  process.exit(1); // You may handle this error differently based on your application's requirements
}

const pub = new Redis(redisUri);
const sub = new Redis(redisUri);

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  /**
   * initListeners
   */
  public initListeners() {
    const io = this.io;
    console.log("Initialize Socket Listeners...");
    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Received", message);

        // Publish this message to Redis
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    // Receive messages from Subscribed Channel on Redis
    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
