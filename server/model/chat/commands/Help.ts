import { Chat } from "../Chat.js";
import { ChatMessage } from "../ChatMessage.js";
import { ChatCommand } from "./ChatCommand.js";


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

    execute(args: Array<string>, playerName : string): ChatMessage {
        let text : string = "Available commands: <br>";
        this.chat.getAvailableCommands().forEach(c => text += c.getExplanation() + "<br>");
        return {
            text : text,
            sender : this.readableName,
            isSystem : true
        };
    }

    getCommandName(): string {
        return this.commandName;
    }
}