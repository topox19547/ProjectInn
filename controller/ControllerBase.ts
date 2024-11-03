abstract class ControllerBase implements ClientState{
    protected abstract readonly clientHandler : ClientHandler
    protected readonly validateMessage : (object : unknown) => Message = ensureObject({
        status : ensureEnumLike(Object.values(MessageType).filter(v => typeof v === "number")),
        command : ensureEnumLike(Object.values(Command).filter(v => typeof v === "number")),
        content : ensureGenericObject
    })

    protected sendError(text : string) : void{
        this.clientHandler.send({
            status : MessageType.ERROR,
            command : Command.NONE,
            content : text
        });
    }

    public abstract handleMessage(message: string): void;
}