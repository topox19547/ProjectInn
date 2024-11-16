abstract class ClientHandler{
    protected currentState : ClientState;
    public abstract open():void
    public abstract close():void
    public abstract receive(event : any):void
    public abstract send(message : Message):void

    constructor(initialState : ClientState){
        this.currentState = initialState;
    }

    changeState(state : ClientState):void{
        this.currentState = state;
    }

    leaveCurrentState() : void{
        this.changeState(this.currentState.getNextDefaultState());
    }
}