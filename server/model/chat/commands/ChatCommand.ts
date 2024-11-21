import { ChatMessage } from "../ChatMessage.js"


export interface ChatCommand{
    execute(args : Array<string>, playerName : string) : ChatMessage
    getCommandName() : string
    getExplanation() : string
}