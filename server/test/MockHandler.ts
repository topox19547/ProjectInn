import { ClientHandler } from "../controller/ClientHandler.js";
import { ClientState } from "../controller/ClientState.js";
import { Message } from "../model/messages/Message.js";
import { Status } from "../model/messages/Status.js";

export class MockHandler extends ClientHandler{
    protected currentState: ClientState | undefined;
    private receivedMessages : Array<Message>;
    private closed : boolean;

    constructor(){
        super();
        this.receivedMessages = new Array();
        this.closed = false;
    }

    public close(): void {
        this.closed = true;
    }

    public receive(message: Message): void {
        this.currentState?.handleMessage(message);
    }

    public send(message: Message): void {
        this.receivedMessages.push(message);
    }

    public compareLastMessages(statuses : Array<Status>): boolean{
        if(statuses.length != this.receivedMessages.length) return false;
        for(let i = 0; i < statuses.length; i++){
            if(statuses[i] != this.receivedMessages[i].status){
                return false;
            }
        }
        this.receivedMessages = [];
        return true;
    }

    public isClosed(): boolean {
        return this.closed;
    }

    public ignoreLastMessages() : void{
        this.receivedMessages = [];
    }
}