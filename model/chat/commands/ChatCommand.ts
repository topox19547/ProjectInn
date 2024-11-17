import { ChatMessage } from "../ChatMessage"

export interface ChatCommand{
    execute(args : Array<string>, playerName : string) : ChatMessage
    getCommandName() : string
    getExplanation() : string
}