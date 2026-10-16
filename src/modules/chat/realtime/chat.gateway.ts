import { Server, Socket } from "socket.io";
import chatEvent from "./chat.event";

class ChatGateway {
    private chatEvent;
    constructor() {
        this.chatEvent = chatEvent;
    }

    registerEvents(socket: Socket,io:Server) {
        this.chatEvent.sayHi(socket);
        this.chatEvent.sendMessage(socket,io);
    }
}

const chatGateway = new ChatGateway();
export default chatGateway;