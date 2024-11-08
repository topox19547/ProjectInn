abstract class ControllerBase implements ClientState{
    protected abstract readonly clientHandler : ClientHandler
    protected readonly validateMessage : (object : unknown) => Message = ensureObject({
        status : ensureEnumLike(Object.values(Status).filter(v => typeof v === "number")),
        command : ensureEnumLike(Object.values(Command).filter(v => typeof v === "number")),
        content : ensureGenericObject
    })

    protected sendError(text : string) : void{
        this.clientHandler.send({
            status : Status.ERROR,
            command : Command.NONE,
            content : {
                error : text
            }
        });
    }

    public abstract handleMessage(message: string): void;
}