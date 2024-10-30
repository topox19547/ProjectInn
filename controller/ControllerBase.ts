abstract class ControllerBase implements ClientState{
    protected abstract readonly clientHandler : ClientHandler

    protected sendError(text : string) : void{
        this.clientHandler.send({
            status : MessageType.ERROR,
            command : Command.NONE,
            content : text
        });
    }

    public abstract handleMessage(message: string): void;
}