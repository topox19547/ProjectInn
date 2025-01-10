import { Game } from "../../Game.js";
import { ChatMessage } from "../ChatMessage.js";
import { ChatCommand } from "./ChatCommand.js";
import { CommandResponse } from "./CommandResponse.js";

/**
 * Implements a command for sending messages to a limited set of users
 */
export class Whisper implements ChatCommand{
    private gameContext : Game;
    private readonly visualName;
    private readonly commandName;

    constructor(gameContext : Game){
        this.gameContext = gameContext;
        this.visualName = "Whisper";
        this.commandName = "w";
    }

    public execute(args: string, playerName : string): CommandResponse {
        const playerListStartChar : string = "/";
        const separator : string = ` ${playerListStartChar}`
        const separatorIndex : number = args.indexOf(separator);
        const errorResponse : CommandResponse = {
            response : {
                text : `${playerName}, some of the arguments are not valid`,
                sender : this.visualName,
                isSystem : true
            },
            sendTo : [playerName]
        }
        if(separatorIndex == -1){
            return errorResponse;
        }
        console.log(separator);
        const message : string = args.substring(0, separatorIndex);
        const users : Array<string> = args.substring(separatorIndex + separator.length).split(",");
        if(users.every(p => this.gameContext.getPlayer(p) !== undefined && p != playerName)){
            return {
                response : {
                        text : `${playerName} whispered to ${users.toString()}: ${message}`,
                        sender : this.visualName,
                        isSystem : true
                    },
                sendTo : users.concat(playerName)
                }
        } else {
            return {
                response : {
                    text : `${playerName}, one or more of the specified users don't exist`,
                    sender : this.visualName,
                    isSystem : true
                },
                sendTo : [playerName]
            }
        }
    }

    public getCommandName(): string {
        return this.commandName;
    }
    public getExplanation(): string {
        return "!w messagetext /user1,user2...    send a private message to one or more users ";
    }
    
}