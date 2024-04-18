/**
 *Class that represents a single user playing the game
 */

export class Player{
    private readonly username:string;
    private readonly color:string;

    constructor(username:string, color:string){
        this.username = username;
        this.color = color;
    }
}