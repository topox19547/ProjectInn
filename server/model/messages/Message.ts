import { Command } from "./Command.js"
import { Status } from "./Status.js"
import { ensureObject, ensureEnumLike, ensureGenericObject } from "./Validators.js"


export interface Message{
    status : Status,
    command : Command,
    content : object
}

export const validateMessage : (object : unknown) => Message = ensureObject({
    status : ensureEnumLike(Object.values(Status).filter(v => typeof v === "number")),
    command : ensureEnumLike(Object.values(Command).filter(v => typeof v === "number")),
    content : ensureGenericObject
})