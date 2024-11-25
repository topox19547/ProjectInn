import type { Game } from "../model/Game.js";
import type { GamePreview } from "../model/gamePreview.js";

export class SaveManager{
    private readonly gamesKey : string;

    constructor(){
        this.gamesKey = "innGames";
        if(localStorage.getItem(this.gamesKey) === null){
            this.clearSaves();
        }
    }

    public SaveGame(game : Game) : void{
        const games : string | null = localStorage.getItem(this.gamesKey)
        try{
            const parsedGames : Array<{game : Game, info : string}> = JSON.parse(games!);
            const index = parsedGames.findIndex(g => g.game.name == game.name);
            if(index != -1){
                parsedGames.splice(index,1);
            }
            parsedGames.unshift({
                game : game,
                info : `Last played at: ${new Date().toString()}`
            });
            localStorage.setItem(this.gamesKey, JSON.stringify(parsedGames));
        } catch (e){
            this.handleSaveError(e);
        }
    }

    public DeleteGame(id : number) : void{
        const games : string | null = localStorage.getItem(this.gamesKey)
        try{
            const parsedGames : Array<{game : Game, info : string}> = JSON.parse(games!);
            parsedGames.splice(id)
            localStorage.setItem(this.gamesKey, JSON.stringify(parsedGames));
        } catch (e){
            this.handleSaveError(e);
        }
    }

    public LoadGame(id : number) : Game | undefined{
        const games : string | null = localStorage.getItem(this.gamesKey)
        try{
            const parsedGames : Array<{game : Game, info : string}> = JSON.parse(games!);
            return parsedGames.length > id && id > 0 ? parsedGames[id].game : undefined;
        } catch (e){
            this.handleSaveError(e);
        }
    }

    public getGameList() : Array<GamePreview>{
        const gamesPreview : Array<GamePreview> = new Array();
        const games : string | null = localStorage.getItem(this.gamesKey);
        try{    
            const parsedGames : Array<{game : Game, info : string}> = JSON.parse(games!);
            let currentId : number = 0;
            for(const entry of parsedGames){
                gamesPreview.push({name : entry.game.name, info : entry.info, id: currentId});
                currentId++;
            }
        } catch(e){
            this.handleSaveError(e)
        }
        return gamesPreview;
    }
    
    public clearSaves() : void{
        localStorage.setItem(this.gamesKey, JSON.stringify([]));
    }

    private handleSaveError(e : unknown){
        if(e instanceof SyntaxError){
            throw Error("Malformed saved games file. please try clearing the local data for this website.");
        } else if (e instanceof DOMException){
            throw Error(
                "Couldn't modify the save files because of a quota error. try deleting a few games or using a different browser.");
        }
    }
}