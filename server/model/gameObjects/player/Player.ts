import { ClientNotifier } from "../../ClientNotifier.js";
import { Command } from "../../messages/Command.js";
import { Status } from "../../messages/Status.js";
import { ensureObject, ensureString, ensureMapObject, ensureBoolean } from "../../messages/Validators.js";
import { NotificationSource } from "../../NotificationSource.js";
import { Color } from "./Color.js";
import { Permission } from "./Permission.js";

export class Player implements NotificationSource{
    private readonly name : string;
    private readonly color : Color;
    private readonly permissions : Map<Permission, boolean>;
    private connected : boolean;
    private notifier : ClientNotifier | undefined;
    private static readonly maxNameLength : number = 24;
    public static readonly validate = ensureObject({
        name : ensureString,
        color : ensureString,
        permissions : ensureMapObject(ensureBoolean),
        connected : ensureBoolean
    })

    constructor(name : string, color : Color){
        this.name = name;
        this.color = color;
        this.permissions = new Map<Permission, boolean>;
        this.connected = false
        let i : number = 0;
        for(const entry in Permission){
            if(typeof entry == "number"){
                this.permissions.set(i,false);
                i++;
            }
        }
    }

    public static fromObject(object : ReturnType<typeof this.validate>) : Player{
        const player : Player = new Player(
            object.name.slice(0,Player.maxNameLength),
            new Color(object.color)
        );
        let i : number = 0;
        for(const key in Permission){
            player.setPermission(i, object.permissions[key] != undefined ? object.permissions[key] : false);
            i++;
        }
        return player;
    }

    public static toObject(player : Player) : ReturnType<typeof this.validate>{
        const permissions : Record<string,boolean> = {}
        for(const [key,value] of player.permissions){
            permissions[key] = value
        }
        return {
            name : player.name,
            color : player.color.getColor(),
            permissions : permissions,
            connected : player.connected
        }
    }

    public static getMaxNameLength() : number{
        return this.maxNameLength;
    }

    public setNotifier(notifier : ClientNotifier) : void{
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

    public setPermission(permission : Permission, value : boolean){
        this.permissions.set(permission, value);
        if(permission == Permission.MASTER){ //MASTER automatically grants all the other permissions
            this.permissions.forEach((_,k) => {
                if (k != Permission.MASTER) this.permissions.set(k, value);
        });
        }
        const permissions : Record<string,boolean> = {}
        for(const [key,value] of this.permissions){
            permissions[key] = value
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