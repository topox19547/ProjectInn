interface Message{
    status : Status,
    command : Command,
    content : object
}

const validateMessage : (object : unknown) => Message = ensureObject({
    status : ensureEnumLike(Object.values(Status).filter(v => typeof v === "number")),
    command : ensureEnumLike(Object.values(Command).filter(v => typeof v === "number")),
    content : ensureGenericObject
})