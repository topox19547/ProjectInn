import { ClientNotifier } from "../../ClientNotifier.js";
import { Command } from "../../messages/Command.js";
import { Status } from "../../messages/Status.js";
import { ensureObject, ensureString, ensureMapObject, ensureBoolean } from "../../messages/Validators.js";
import { Notifier } from "../../Notifier.js";
import { NotificationSource } from "../NotificationSource.js";
import { Color } from "./Color.js";
import { Permission } from "./Permission.js";

export class Player implements NotificationSource{
    private readonly name : string;
    private readonly color : Color;
    private readonly permissions : Map<Permission, boolean>;
    private readonly isOwner : boolean
    private connected : boolean;
    private notifier : Notifier<Player> | undefined;
    private static readonly maxNameLength : number = 24;
    private static readonly allowedCharacters : string = 
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"
    public static readonly validate = ensureObject({
        name : ensureString,
        color : ensureString,
        permissions : ensureMapObject(ensureBoolean),
        isOwner : ensureBoolean,
        connected : ensureBoolean
    })

    constructor(name : string, color : Color, isOwner : boolean){
        this.name = name;
        this.color = color;
        this.permissions = new Map<Permission, boolean>;
        this.isOwner = isOwner;
        this.connected = false;
        let i : number = 0;
        for(const entry of Object.values(Permission)){
            if(typeof entry == "number"){
                this.permissions.set(i,isOwner);
                i++;
            }
        }
    }

    public static fromObject(object : ReturnType<typeof this.validate>) : Player{
        const player : Player = new Player(
            object.name.slice(0,Player.maxNameLength),
            new Color(object.color),
            object.isOwner
        );
        if(!object.isOwner){
            let i : number = 0;
            for(const key of Object.values(Permission)){
                if(typeof key !== "string"){
                    continue;
                }
                player.setPermission(i, object.permissions[key] != undefined ? object.permissions[key] : false);
                i++;
            }
        }
        return player;
    }

    public static toObject(player : Player) : ReturnType<typeof this.validate>{
        const permissions : Record<string,boolean> = {}
        for(const [key,value] of player.permissions){
            permissions[Permission[key]] = value
        }
        return {
            name : player.name,
            color : player.color.getColor(),
            permissions : permissions,
            isOwner : player.isOwner,
            connected : player.connected
        }
    }

    public static isNameValid(name : string) : boolean{
        return name.length <= Player.maxNameLength && 
        [...name].every(c => Player.allowedCharacters.includes(c))
    }

    public setNotifier(notifier : Notifier<Player>) : void{
        this.notifier = notifier;
    }

    public getName() : string{
        return this.name;
    }

    public getColor() : Color{
        return this.color;
    }

    public isConnected() : boolean{
        return this.connected;
    }

    public isGameOwner() : boolean{
        return this.isOwner;
    }

    public setConnected(connected : boolean) : void{
        this.connected = connected;
        this.notifier?.notify({
            status : Status.CLIENT_STATUS,
            command : Command.NONE,
            content : {
                name : this.name,
                connected : connected
            }
        })
    }

    public hasPermission(permission : Permission) : boolean{
        const hasPermission : boolean | undefined = this.permissions.get(permission);
        return hasPermission != undefined && hasPermission;
    }

    public setPermission(permission : Permission, value : boolean) : void{
        if(permission != Permission.MASTER && this.permissions.get(Permission.MASTER) == true){
            return; // you can't modify the other permissions when master is active
        }
        this.permissions.set(permission, value);
        if(permission == Permission.MASTER){ //MASTER automatically grants all the other permissions
            this.permissions.forEach((_,k) => {
                if (k != Permission.MASTER) this.permissions.set(k, value);
        });
        }
        const permissions : Record<string,boolean> = {}
        for(const [key,value] of this.permissions){
            permissions[Permission[key]] = value
        }
        this.notifier?.notify({
            status : Status.PERMISSIONS,
            command : Command.MODIFY,
            content : {
                name : this.name,
                permissions : permissions
            }
        });
    }
}