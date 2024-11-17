import { Command } from "../../controller/Command"
import { Status } from "./Status"
import { ensureObject, ensureEnumLike, ensureGenericObject } from "./Validators"

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