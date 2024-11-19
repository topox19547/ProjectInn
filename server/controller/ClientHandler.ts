import { Message } from "../model/messages/Message.js";
import { ClientState } from "./ClientState.js";


export abstract class ClientHandler{
    protected currentState : ClientState | undefined;
    public abstract open():void
    public abstract close():void
    public abstract receive(event : any):void
    public abstract send(message : Message):void

    constructor(){
        this.currentState = undefined;
    }

    changeState(state : ClientState):void{
        this.currentState = state;
    }

    leaveCurrentState() : void{
        if(this.currentState === undefined){
            return;
        }
        this.changeState(this.currentState.getNextDefaultState());
    }
}