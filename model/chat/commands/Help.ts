class Help implements ChatCommand{
    private readonly visualName;
    private readonly commandName;
    private readonly chat : Chat;

    constructor(chat : Chat){
        this.chat = chat;
        this.visualName = "Help";
        this.commandName = "h";
    }

    getExplanation(): string {
        return "h    shows a list of all the available commands"
    }

    execute(args: Array<string>, playerName : string): ChatMessage {
        const text : string = "Available commands: \n";
        this.chat.getAvailableCommands().forEach(c => text.concat(c.getExplanation() + "\n"))
        return {
            text : text,
            sender : this.visualName,
            isSystem : true
        }
    }

    getCommandName(): string {
        return this.commandName;
    }
}