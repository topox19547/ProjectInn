import { Color } from "./Color";

/**
 * a class used for every entity that takes part in a game
 * the name should be unique, and the same goes for the color,
 * so they have to be verified before constructing a GameActor.
 * if instantiated, it represents a single player taking part in the game.
 */
export class GameActor{
    private color:Color;
    private name:string;

    /**
     * constructor for GameActor
     * @param color the color applied to certain parts of the interface related to this GameActor (e.g. its name on the chat)
     * @param name the unique name that identifies it
     */
    constructor(color:Color, name:string){
        this.name = name;
        this.color = color;
    }

    /**
     * 
     * @param color the color to set
     */
    public setColor(color:Color):void{
        this.color = color;
    }
    /**
     * 
     * @param name the name to set
     */
    public setName(name:string):void{
        this.name = name;
    }

    /**
     * 
     * @returns the GameActor's color
     */
    public getColor():Color{
        return this.color;
    }
    
    /**
     * 
     * @returns the GameActor's name
     */
    public getName():string{
        return this.name;
    }
}