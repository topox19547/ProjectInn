import { ChatMessage } from "../ChatMessage.js"
import { CommandResponse } from "./CommandResponse.js"

/**
 * Defines an interface to create chat commands.
 * Every command needs to have an execute method that returns a response, a command name used to register it,
 * and a string that explains its functionality
 */
export interface ChatCommand{
    execute(args : string, playerName : string) : CommandResponse
    getCommandName() : string
    getExplanation() : string
}