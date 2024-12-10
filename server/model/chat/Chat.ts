import { ClientNotifier } from "../ClientNotifier.js";
import { Command } from "../messages/Command.js";
import { Status } from "../messages/Status.js";
import { NotificationSource } from "../NotificationSource.js";
import { ChatMessage } from "./ChatMessage.js";
import { ChatCommand } from "./commands/ChatCommand.js";


export class Chat implements NotificationSource{
    private readonly commandMap : Map<string,ChatCommand>;
    private readonly chatHistory : Array<ChatMessage>;
    private readonly commandPrefix : string;
    private readonly maxMessageLength : number;
    private notifier : ClientNotifier | undefined;


    constructor(){
        const welcomeMessage : ChatMessage = {
            text : "Welcome to ProjectInn...",
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

    public setNotifier(notifier: ClientNotifier): void {
        this.notifier = notifier
    }

    public handleMessage(message : ChatMessage) : void{
        if(message.text.length > this.maxMessageLength){
            return;
        }
        this.notifier?.notify({
            status : Status.CHAT,
            command : Command.CREATE,
            content : message
        })
        this.chatHistory.push(message);
        if(!message.text.startsWith("!")){
            return;
        }
        const splitQuery : Array<string> = message.text.slice(1).split(" ");
        const command : ChatCommand | undefined = this.commandMap.get(splitQuery[0]);
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
        splitQuery.splice(0,1)
        const response : ChatMessage = command.execute(splitQuery,message.sender);
        this.notifier?.notify({
            status : Status.CHAT,
            command : Command.CREATE,
            content : response
        });
        this.chatHistory.push(response);
    }

    public getChatHistory() : Array<ChatMessage>{
        return [...this.chatHistory];
    }

    public getAvailableCommands() : Array<ChatCommand>{
        return [...this.commandMap.values()]
    }
}