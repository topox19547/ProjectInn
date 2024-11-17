import { Command } from "../../controller/Command";
import { ClientNotifier } from "../ClientNotifier";
import { Status } from "../messages/Status";
import { NotificationSource } from "../NotificationSource";
import { ChatMessage } from "./ChatMessage";
import { ChatCommand } from "./commands/ChatCommand";

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
        this.chatHistory.concat(message);
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
        const response : ChatMessage = command.execute(splitQuery.splice(0,1),message.sender);
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