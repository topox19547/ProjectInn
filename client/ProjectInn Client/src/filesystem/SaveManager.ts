import type { Game, LocalSettings } from "../model/Game.js";
import type { GamePreview } from "../model/gamePreview.js";
import { getDefaultGlobalSettings, type GlobalSettings } from "../model/GlobalSettings.js";
import type { SavedGame } from "../model/SavedGame.js";

/**
 * manages the local game saves and the saved settings.
 */
export class SaveManager{
    private readonly gamesKey : string;
    private readonly settingsKey : string;

    constructor(){
        this.gamesKey = "innGames";
        this.settingsKey = "globalSettings";
        if(localStorage.getItem(this.gamesKey) === null){
            this.clearGameSaves();
        }
        if(localStorage.getItem(this.settingsKey) === null){
            this.clearSettings();
        }
    }

    public SaveGame(game : Game, localSettings : LocalSettings) : void{
        const games : string | null = localStorage.getItem(this.gamesKey)
        try{
            const parsedGames : Array<SavedGame> = JSON.parse(games!);
            const index = parsedGames.findIndex(g => g.game.name == game.name);
            if(index != -1){
                parsedGames.splice(index,1);
            }
            parsedGames.unshift({
                game : game,
                info : `Last played at: ${new Date().toLocaleString()}`,
                localSettings : localSettings
            });
            localStorage.setItem(this.gamesKey, JSON.stringify(parsedGames));
        } catch (e){
            this.handleSaveError(e);
        }
    }

    public DeleteGame(id : number) : void{
        const games : string | null = localStorage.getItem(this.gamesKey)
        try{
            const parsedGames : Array<SavedGame> = JSON.parse(games!);
            parsedGames.splice(id,1)
            localStorage.setItem(this.gamesKey, JSON.stringify(parsedGames));
        } catch (e){
            this.handleSaveError(e);
        }
    }

    public LoadGame(id : number) : SavedGame | undefined{
        const games : string | null = localStorage.getItem(this.gamesKey)
        try{
            const parsedGames : Array<SavedGame> = JSON.parse(games!);
            return parsedGames.length > id && id >= 0 ? parsedGames[id] : undefined;
        } catch (e){
            this.handleSaveError(e);
        }
    }

    public getGameList() : Array<GamePreview>{
        const gamesPreview : Array<GamePreview> = new Array();
        const games : string | null = localStorage.getItem(this.gamesKey);
        try{    
            const parsedGames : Array<SavedGame> = JSON.parse(games!);
            let currentId : number = 0;
            for(const entry of parsedGames){
                gamesPreview.push({
                    name: entry.game.name, info: entry.info, id: currentId,
                    private: false
                });
                currentId++;
            }
        } catch(e){
            this.handleSaveError(e)
        }
        return gamesPreview;
    }
    
    public clearGameSaves() : void{
        localStorage.setItem(this.gamesKey, JSON.stringify([]));
    }

    public clearSettings() : void{
        localStorage.setItem(this.settingsKey,JSON.stringify(getDefaultGlobalSettings()));
    }

    public saveSettings(settings : GlobalSettings) : void{
        try{
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch(e){
            this.handleSaveError(e);
        }
    }

    public loadSettings() : GlobalSettings | undefined{
        try{
            return JSON.parse(localStorage.getItem(this.settingsKey)!);
        } catch(e){
            this.handleSaveError(e);
        }
        return undefined
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