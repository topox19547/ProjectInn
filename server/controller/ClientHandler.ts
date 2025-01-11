import { Message } from "../model/messages/Message.js";
import { ClientState } from "./ClientState.js";

/**
 * represents a client on the server side
 */
export abstract class ClientHandler{
    protected currentState : ClientState | undefined;
    public abstract close():void
    public abstract isClosed(): boolean
    public abstract send(message : Message):void

    constructor(){
        this.currentState = undefined;
    }

    changeState(state : ClientState):void{
        this.currentState = state;
    }

    leaveCurrentState() : void{
        if(this.currentState === undefined || this.isClosed()){
            return;
        }
        this.changeState(this.currentState.getNextDefaultState());
    }
}