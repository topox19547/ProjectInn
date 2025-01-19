import { Chat } from "../Chat.js";
import { ChatCommand } from "./ChatCommand.js";
import { CommandResponse } from "./CommandResponse.js";

/**
 * implements a way to get the information about all the commands available in a chat
 */
export class Help implements ChatCommand{
    private readonly readableName;
    private readonly commandName;
    private readonly chat : Chat;

    constructor(chat : Chat){
        this.chat = chat;
        this.readableName = "Help";
        this.commandName = "h";
    }

    getExplanation(): string {
        return "!h    shows a list of all the available commands"
    }

    execute(args: string, playerName : string): CommandResponse {
        let text : string = `${playerName}, these are the available commands: <br><br>`;
        this.chat.getAvailableCommands().forEach(c => text += c.getExplanation() + "<br><br>");
        return {
            response : {
                text : text,
                sender : this.readableName,
                isSystem : true
            },
            sendTo : [playerName]
        };
    }

    getCommandName(): string {
        return this.commandName;
    }
}