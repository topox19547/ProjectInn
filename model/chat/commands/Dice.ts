import { ChatMessage } from "../ChatMessage";
import { ChatCommand } from "./ChatCommand";

export class Dice implements ChatCommand{
    private readonly visualName;
    private readonly commandName;

    constructor(){
        this.visualName = "Dice";
        this.commandName = "d";
    }

    getExplanation(): string {
        return "!d <number of faces>    rolls a dice with the specified amount of faces"
    }

    public execute(args: Array<string>, playerName : string): ChatMessage {
        const faces : number = Number(args[0]);
        if(faces > 1){
            const roll : number = Math.round(Math.random() * faces) + 1;
            return {
                text : `you rolled ${roll}`,
                sender : this.visualName,
                isSystem : true
            }
        }
        return {
            text : "invalid arguments",
            sender : this.visualName,
            isSystem : true
        }
    }

    public getCommandName(): string {
        return this.commandName;
    }
}