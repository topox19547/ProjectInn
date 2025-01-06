import { ClientNotifier } from "../ClientNotifier.js";
import { Player } from "../gameObjects/player/Player.js";
import { Command } from "../messages/Command.js";
import { Status } from "../messages/Status.js";
import { NotificationSource } from "../gameObjects/NotificationSource.js";
import { ChatMessage } from "./ChatMessage.js";
import { ChatCommand } from "./commands/ChatCommand.js";
import { CommandResponse } from "./commands/CommandResponse.js";
import { Notifier } from "../Notifier.js";


export class Chat implements NotificationSource{
    private readonly commandMap : Map<string,ChatCommand>;
    private readonly chatHistory : Array<ChatMessage>;
    private readonly commandPrefix : string;
    private readonly maxMessageLength : number;
    private notifier : Notifier<Player> | undefined;


    constructor(){
        const welcomeMessage : ChatMessage = {
            text : "Welcome to ProjectInn, type !h to see a list of all the available commands...",
            sender : "ProjectInn",
            isSystem : true
        }
        this.commandMap = new Map();
        this.chatHistory = new Array(welcomeMessage);
        this.commandPrefix = "!";
        this.maxMessageLength = 512;
    }

    public addCommand(command : ChatCommand) : Chat{
        this.commandMap.set(command.getCommandName(), command);
        return this;
    }

    public setNotifier(notifier: Notifier<Player>): void {
        this.notifier = notifier
    }

    public handleMessage(message : ChatMessage) : void{
        if(message.text.length > this.maxMessageLength){
            return;
        }
        if(!message.text.startsWith(this.commandPrefix)){
            this.notifier?.notify({
                status : Status.CHAT,
                command : Command.CREATE,
                content : message
            })
            this.chatHistory.push(message);
            return;
        }
        const trimmedMessage : string = message.text.slice(1).trim();
        const separatorIndex : number = message.text.indexOf(" ");
        const commandString : string = separatorIndex === -1 ? 
            trimmedMessage : trimmedMessage.substring(0, separatorIndex - 1);
        const argsString = trimmedMessage.substring(separatorIndex);
        const command : ChatCommand | undefined = this.commandMap.get(commandString);
        if (command === undefined){
            this.notifier?.notifyIf({
                status : Status.CHAT,
                command : Command.CREATE,
                content : {
                    text : "Invalid command",
                    sender : "ProjectInn",
                    isSystem : true
                }
            }, p => p.getName() == message.sender)
            return;
        }
        const commandResponse : CommandResponse = command.execute(argsString, message.sender);
        const sendTo : Array<String> | undefined = commandResponse.sendTo;
        if(sendTo !== undefined){
            this.notifier?.notifyIf({
                status : Status.CHAT,
                command : Command.CREATE,
                content : commandResponse.response
            }, p => sendTo.includes(p.getName()));
            //Private messages aren't saved to the global chat history
        } else {
            this.notifier?.notify({
                status : Status.CHAT,
                command : Command.CREATE,
                content : commandResponse.response
            });
            this.chatHistory.push(commandResponse.response);
        }
    }

    public getChatHistory() : Array<ChatMessage>{
        return [...this.chatHistory];
    }

    public getAvailableCommands() : Array<ChatCommand>{
        return [...this.commandMap.values()]
    }
}