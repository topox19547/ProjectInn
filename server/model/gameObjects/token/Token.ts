import { ClientNotifier } from "../../ClientNotifier.js";
import { Game } from "../../Game.js";
import { Command } from "../../messages/Command.js";
import { Status } from "../../messages/Status.js";
import { ensureObject, ensureString, ensureNumber, ensureArrayOf, ensureMapObject } from "../../messages/Validators.js";
import { NotificationSource } from "../../NotificationSource.js";
import { Asset } from "../asset/Asset.js";
import { Identifiable } from "../Identifiable.js";
import { Player } from "../player/Player.js";
import { Vector2 } from "../Vector2.js";
import { Stat } from "./Stat.js";

type TokenInt = typeof Game.validate



export class Token implements Identifiable, NotificationSource{
    private name : string;
    private notifier : ClientNotifier | undefined;
    private dragLockTimer : NodeJS.Timeout | undefined;
    private dragLockOwner : string | undefined;
    private id : number;
    private readonly asset : Asset;
    private readonly owners : Array<string>;
    private readonly notes : Map<string, string>;
    private readonly stats : Map<string, Stat>;
    private readonly position : Vector2;
    private readonly maxNameLength: number;
    private readonly maxNoteLength : number;
    public static readonly validate = ensureObject({
        name : ensureString,
        id : ensureNumber,
        assetID : ensureNumber,
        owners : ensureArrayOf(ensureString),
        notes : ensureMapObject(ensureString),
        stats : ensureMapObject(Stat.validate),
        position : Vector2.validate
    });


    constructor(asset : Asset, id : number){
        this.asset = asset;
        this.id = id;
        this.name = asset.getName();
        this.owners = new Array<string>;
        this.notes = new Map<string,string>;
        this.stats = new Map<string,Stat>;
        this.position = new Vector2(0,0);
        this.maxNoteLength = 128;
        this.maxNameLength = 24;
    }

    public static fromObject(object: ReturnType<typeof this.validate>, gameContext : Game): Token | undefined {
        const asset : Asset | undefined = gameContext.getTokenAsset(object.assetID);
        if(asset == undefined){
            return undefined
        }
        const token : Token = new Token(asset, object.id);
        if (!token.setName(object.name)){
            return undefined
        }
        for (const owner in object.owners){
            if(!token.addOwner(owner) || gameContext.getPlayer(owner) === undefined){
                return undefined
            }
        }
        for (const key in object.notes){
            const value = object.notes.key
            if(!token.setNote(key,value)){
                return undefined
            }
        }
        for (const key in object.stats){
            const value = object.stats.key
            if(!token.setStat(key,new Stat(value.value, value.min, value.max))){
                return undefined
            }
        }
        const position = new Vector2(object.position.x, object.position.y);
        if(!gameContext.getCurrentScene().isValidPosition(position)){
            position.setX(0);
            position.setY(0);
        }
        token.setPosition(position);
        return token;
    }

    public static toObject(token : Token) : ReturnType<typeof this.validate>{
        return {
            name : token.name,
            id : token.id,
            assetID : token.asset.getID(),
            owners : [...token.owners],
            notes : Token.MapToStringRecord(token.notes, s => s),
            stats : Token.MapToStringRecord(token.stats, Stat.toObject),
            position : Vector2.toObject(token.position)
        }
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
    }

    public getAsset() : Asset{
        return this.asset;
    }

    public getID() : number{
        return this.id;
    }

    public setID(id : number) : void{
        this.id = id;
    }

    public getName() : string{
        return this.name;
    }

    public setName(name : string) : boolean{
        if (name.length > this.maxNameLength){
            return false
        }
        this.name = name;
        this.notifier?.notify({
            status : Status.TOKEN_NAME,
            command : Command.MODIFY,
            content : { 
                id : this.getID(),
                name : name
            }
        });
        return true;
    }

    public isOwner(user : Player) : boolean{
        return this.owners.indexOf(user.getName()) != -1;
    }

    public addOwner(name : string) : boolean{
        if(this.owners.indexOf(name) != -1){
            return false;
        }
        this.owners.concat(name);
        this.notifier?.notify({
            status : Status.TOKEN_OWNERSHIP,
            command : Command.MODIFY,
            content : { 
                id : this.getID(),
                owners : [...this.owners]
            }
        });
        return true;
    }

    public removeOwner(name : string) : boolean{
        const indexToRemove : number = this.owners.indexOf(name); 
        if(indexToRemove != -1){
            return false;
        }
        this.owners.splice(indexToRemove, 1);
        this.notifier?.notify({
            status : Status.TOKEN_OWNERSHIP,
            command : Command.MODIFY,
            content : { 
                id : this.getID(), 
                owners : [...this.owners]
            }
        });
        return true;
    }

    public getNotes() : Map<string,string>{
        return new Map(this.notes);
    }

    public setNote(title : string, note : string) : boolean{
        if (title.length > this.maxNameLength || note.length > this.maxNoteLength){
            return false;
        }
        this.notes.set(title, note);
        this.notifier?.notify({
            status : Status.TOKEN_NOTE,
            command : Command.MODIFY,
            content : { 
                id : this.getID(),
                notes : Token.MapToStringRecord(this.notes, s => s)
            }
        });
        return true;
    }

    public removeNote(title : string) : boolean{
        const notesObject : Record<string,string> = {};
        this.notes.forEach((v,k) => notesObject[k] = v);
        if(!this.notes.delete(title)){
            return false;
        }
        this.notifier?.notify({
            status : Status.TOKEN_NOTE,
            command : Command.MODIFY,
            content : { 
                id : this.getID(),
                notes : Token.MapToStringRecord(this.notes, s => s)
            }
        });
        return true;
    }

    public getStats() : Map<string, Stat>{
        return new Map(this.stats);
    }

    public setStat(name : string, stat : Stat) : boolean{
        if(name.length > this.maxNameLength){
            return false;
        }
        this.stats.set(name, stat);
        this.notifier?.notify({
            status : Status.TOKEN_STAT,
            command : Command.MODIFY,
            content : { 
                id : this.getID(),
                stats : Token.MapToStringRecord(this.stats, Stat.toObject)
            }
        });
        return true;
    }

    public removeStat(name : string) : boolean{
        if(!this.stats.delete(name)){
            return false;
        }
        this.notifier?.notify({
            status : Status.TOKEN_STAT,
            command : Command.DELETE,
            content : { 
                id : this.getID(),
                stats : Token.MapToStringRecord(this.stats, Stat.toObject)
            }
        });
        return true;
    }

    public acquireDragLock(username : string) : boolean{
        if(this.dragLockOwner == username){
            return true;
        }
        if(this.dragLockOwner !== undefined){
            return false;
        }
        this.dragLockOwner = username;
        this.dragLockTimer = setTimeout(() => this.timeoutDrag(), 30000)
        return true;
    }
    
    private timeoutDrag() : void {
        this.dragLockTimer = undefined;
        this.dragLockOwner = undefined;
        this.setPosition(this.position);
    }

    //TODO: Debug drag interaction: dragging could theoretically cause a few bugs
    //if a client enters the game while something is being dragged
    public drag(position : Vector2, user : string) : void{
        if(user != this.dragLockOwner){
            return;
        }
        this.notifier?.notify({
            status : Status.TOKEN_MOVING,
            command : Command.MODIFY,
            content : { 
                id : this.getID(),
                position : position,
                inDrag : true,
                byUser : user
            }
        });
        this.position.setTo(position);
        clearTimeout(this.dragLockTimer); //refresh the time limit
        this.dragLockTimer = setTimeout(() => this.timeoutDrag(), 30000);
    }

    public endDrag(position : Vector2, user : string) : void{
        if(user != this.dragLockOwner){
            return;
        }
        clearTimeout(this.dragLockTimer);
        this.dragLockTimer = undefined;
        this.dragLockOwner = undefined;
        this.setPosition(position)
    }

    public setPosition(position : Vector2) : void{
        this.position.setTo(position);
        this.notifier?.notify({
            status : Status.TOKEN_MOVED,
            command : Command.MODIFY,
            content : { 
                id : this.getID(),
                position : position,
                inDrag : false,
                byUser : undefined
            }
        });
    }

    public getPosition() : Vector2{
        return this.position;
    }

    private static MapToStringRecord<T,V>(map :Map<string,V>, toObject : (val : V) => T) : Record<string,T>{
        const record : Record<string,T> = {};
        map.forEach((v,k) => record[k] = toObject(v));
        return record;
    }
}