/**
 * class that stores permissions for other classes, such as Token and TokenType
 */

import { Player } from "../player/Player";

export class PermissionStorage{
    private localPermissions:Map<Permission,Array<Player>>;

    constructor(){
        this.localPermissions = new Map<Permission,Array<Player>>();
    }

    /**
     * checks if the given player has a permission
     * @param player the player to check
     * @param permission the permission to check for
     * @returns whether the player has the given permission
     */
    public hasPermission(player:Player, permission:Permission):boolean{
        let players : Array<Player> | undefined = this.localPermissions.get(permission);
        if(players == undefined){
            return false;
        }
        return players.includes(player);
    }

    /**
     * gives a permission to a player
     * @param player the player to receive the permission
     * @param permission the permission to give
     */
    public addPermission(player:Player, permission:Permission):void{
        let players : Array<Player> | undefined = this.localPermissions.get(permission)
        if(players == undefined){
            players = new Array<Player>;
            this.localPermissions.set(permission,players);
        }
        players.push(player);
    }

    /**
     * removes a permission from a player
     * @param player the player to lose the permission
     * @param permission the permission to remove
     */
    public removePermission(player:Player, permission:Permission):void{
        const players : Array<Player> | undefined = this.localPermissions.get(permission);
        if(players == undefined){
            return;
        }
        const playerIndex:number = players.indexOf(player);
        if(playerIndex != -1){
            players.splice(playerIndex,playerIndex);
        }    
    }

    /**
     * create a clone of the PermissionStorage instance
     * @returns a clone of the PermissionStorage instance the method was called on
     */
    public clone():PermissionStorage{
        const newPermStorage = new PermissionStorage();
        newPermStorage.localPermissions = new Map<Permission,Array<Player>>();
        for(const [key, value] of this.localPermissions.entries()){
            newPermStorage.localPermissions.set(key, [...value]);
        }
        return newPermStorage;
    }
}