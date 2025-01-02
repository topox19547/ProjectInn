import { ChatMessage } from "../ChatMessage.js"
import { CommandResponse } from "./CommandResponse.js"


export interface ChatCommand{
    execute(args : string, playerName : string) : CommandResponse
    getCommandName() : string
    getExplanation() : string
}