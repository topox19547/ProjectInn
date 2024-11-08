abstract class ControllerBase implements ClientState{
    protected readonly validateMessage : (object : unknown) => Message = ensureObject({
        status : ensureEnumLike(Object.values(Status).filter(v => typeof v === "number")),
        command : ensureEnumLike(Object.values(Command).filter(v => typeof v === "number")),
        content : ensureGenericObject
    })

    public abstract handleMessage(message: string): void;
}