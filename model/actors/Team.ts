import { Color } from "../../Color";
import { GameActor } from "./GameActor";

export class Team extends GameActor{
    private readonly players:Array<GameActor>;

    constructor(color:Color, name:string){
        super(color, name)
        this.players = new Array<GameActor>();
    }

    public addPlayer(player:GameActor):void{
        this.players.push(player);
    }

    public getPlayers():Array<GameActor>{
        return [...this.players];
    }

    public removePlayer(player:GameActor):void{
        const index:number = this.players.indexOf(player)
        if(index != -1){
            this.players.splice(index,index)
        }
    }
}