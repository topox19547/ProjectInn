import { ChatMessage } from "../ChatMessage.js";
import { ChatCommand } from "./ChatCommand.js";

export class Dice implements ChatCommand{
    private readonly visualName;
    private readonly commandName;

    constructor(){
        this.visualName = "Dice";
        this.commandName = "d";
    }

    getExplanation(): string {
        return "!d faces faces...    rolls one or more dice with the specified amount of faces (separated by spaces)"
    }

    public execute(args: Array<string>, playerName : string): ChatMessage {
        const errorMessage = {
            text : "invalid arguments",
            sender : this.visualName,
            isSystem : true
        };
        if(args.length == 0){
            return errorMessage
        }
        let messageText = "you rolled";
        for(const [i, arg] of args.entries()){
            const faces : number = parseInt(arg);
            if(Number.isNaN(faces) || faces < 1){
                return errorMessage
            }
            const roll : number = Math.floor(Math.random() * faces) + 1;
            messageText += " " + roll;
            if(i != args.length - 1){
                messageText += ","
            }
        }
        return {
            text : messageText,
            sender : this.visualName,
            isSystem : true
        }
    }

    public getCommandName(): string {
        return this.commandName;
    }
}