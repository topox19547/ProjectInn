import { Command } from "./Command.js"
import { Status } from "./Status.js"


export interface Message{
    status : Status,
    command : Command,
    content : object
}