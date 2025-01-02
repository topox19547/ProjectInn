import { ChatMessage } from "../ChatMessage.js";
import { ChatCommand } from "./ChatCommand.js";
import { CommandResponse } from "./CommandResponse.js";

export class Dice implements ChatCommand{
    private readonly visualName;
    private readonly commandName;

    constructor(){
        this.visualName = "Dice";
        this.commandName = "d";
    }

    getExplanation(): string {
        return "!d ndf ndf...    rolls one or more dice with the specified amount of faces, where n is the number of dice and f is the number of faces"
    }

    public execute(args: string, playerName : string): CommandResponse {
        const splitArgs : Array<string> = args.split(" ").filter(s => s != "");
        const maxArg: number = 1000;
        const errorResponse : CommandResponse = {
            response : {
                text : `${playerName}, some of the arguments are not valid`,
                sender : this.visualName,
                isSystem : true
            },
            sendTo : [playerName]
        }
       
        if(splitArgs.length == 0){
            return errorResponse
        }
        let messageText : string = `${playerName} rolled `;
        let total : number = 0;
        for(const [i, arg] of splitArgs.entries()){
            const splitArg : Array<string> = arg.trim().split("d");
            if(splitArg.length != 2){
                return errorResponse;
            }
            const quantity : number = parseInt(splitArg[0]);
            const faces : number = parseInt(splitArg[1]);
            if(Number.isNaN(faces) || faces < 1 || Number.isNaN(quantity) || quantity < 1){
                return errorResponse
            }
            if(quantity > maxArg || faces > maxArg){
                return {
                    response:{
                        text : `${playerName}, one or more arguments are above the maximum limit (${maxArg})`,
                        sender : this.visualName,
                        isSystem : true
                    },
                    sendTo : [playerName]
                }
            }
            for(let i=1; i <= quantity; i++){
                const roll : number = Math.floor(Math.random() * faces) + 1;
                messageText += roll;
                if(i != quantity){
                    messageText += " + ";
                }
                total += roll;
            }
            if(i != splitArgs.length - 1){
                messageText += " + ";
            }
        }
        messageText += ` = ${total}`
        return {
            response:{
                text : messageText,
                sender : this.visualName,
                isSystem : true
            }
        }
    }

    public getCommandName(): string {
        return this.commandName;
    }
}