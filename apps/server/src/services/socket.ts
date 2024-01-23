import { Server } from "socket.io";
import Redis from "ioredis";

const redisUri =
  "rediss://default:AVNS_nYterha9KJOO4Ukwtp_@redis-c5f4648-hitanshusamantaray-e017.a.aivencloud.com:25230";

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
