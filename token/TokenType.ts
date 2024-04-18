import { Game } from "../Game";
import { PermissionProvider } from "../PermissionsProvider";
import { Player } from "../Player/Player"
import { Provider } from "../Provider";
import { StatProvider } from "../StatProvider";

/**
 * class that synchronizes the the default name, the attribute types,
 * and the asset path that represents the token between the token instances that share the type.
 */

export class TokenType implements PermissionProvider, StatProvider{
    private name:string;
    private assetPath:string;
    private localPermissions:Map<Permission,Array<Player>>;
    private textStatTypes:Array<TextStatType>;
    private game:Game;

    constructor(name:string, assetPath:string, game:Game){
        this.name = name;
        this.assetPath = assetPath;
        this.localPermissions = new Map<Permission,Array<Player>>;
        this.textStatTypes = new Array<TextStatType>;
        this.game = game;
    }

    public hasPermission(player: Player, permission: Permission): boolean {
        let players : Array<Player> | undefined = this.localPermissions.get(permission);
        if(players == undefined){
            return false;
        }
        return players.includes(player);
    }

    public addPermission(player: Player, permission: Permission): void {
        let players : Array<Player> | undefined = this.localPermissions.get(permission)
        if(players == undefined){
            players = new Array<Player>;
            this.localPermissions.set(permission,players);
        }
        players.push(player);
    }

    public removePermission(player: Player, permission: Permission): void {
        const players : Array<Player> | undefined = this.localPermissions.get(permission);
        if(players == undefined){
            return;
        }
        const playerIndex:number = players.indexOf(player);
        if(playerIndex != -1){
            players.splice(playerIndex,playerIndex);
        }    
    }

    public getHigherScope(): Game{
        return this.game;
    }
}
