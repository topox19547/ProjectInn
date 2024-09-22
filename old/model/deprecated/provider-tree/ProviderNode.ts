/**abstract class extended by any object part of the ProviderTree, which has:
 * a PermissionStorage instance, which stores the permissions
 * users have towards the object itself (or to all of the objects below it if it's on an higher level)
 * a StatTypeStorage instance, which store all of the properties 
 * applied to the object itself (or to all of the objects below it if it's on an higher level)
 * a getHigherScope() method for traversing upwards through the "tree"
 */

import { Permission } from "../../player/Permission";

export abstract class ProviderNode{
    private localPermissions:Map<Permission,Array<String>>;
    private textStatTypes:Array<TextStatType>
    private numericStatTypes:Array<NumericStatType>

    constructor(){
        this.textStatTypes = new Array<TextStatType>;
        this.numericStatTypes = new Array<NumericStatType>;
        this.localPermissions = new Map<Permission,Array<String>>;
    }

    /**
     * checks if the given player has a permission
     * @param player the player to check
     * @param permission the permission to check for
     * @returns whether the player has the given permission
     */
    public hasPermission(player:String, permission:Permission):boolean{
        let players : Array<String> | undefined = this.localPermissions.get(permission);
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
    public addPermission(player:String, permission:Permission):void{
        let players : Array<String> | undefined = this.localPermissions.get(permission)
        if(players == undefined){
            players = new Array<String>;
            this.localPermissions.set(permission,players);
        }
        players.push(player);
    }

    /**
     * removes a permission from a player
     * @param player the player to lose the permission
     * @param permission the permission to remove
     */
    public removePermission(player:String, permission:Permission):void{
        const players : Array<String> | undefined = this.localPermissions.get(permission);
        if(players == undefined){
            return;
        }
        const playerIndex:number = players.indexOf(player);
        if(playerIndex != -1){
            players.splice(playerIndex,playerIndex);
        }    
    }

    public getTextStatTypes():Array<TextStatType>{
        return [...this.textStatTypes];
    }

    public addStatType(statType:TextStatType):void{
        this.textStatTypes.push(statType);
    }

    public removeTextStatType(statType:TextStatType):void{
        const index:number = this.textStatTypes.indexOf(statType)
        if(index != -1){
            this.textStatTypes.splice(index,index)
        }
    }

    public getNumericStatTypes():Array<NumericStatType>{
        return [...this.numericStatTypes];
    }

    public addNumericStatType(statType:NumericStatType):void{
        this.numericStatTypes.push(statType);
    }

    public removeNumericStatType(statType:NumericStatType):void{
        const index:number = this.numericStatTypes.indexOf(statType)
        if(index != -1){
            this.numericStatTypes.splice(index,index)
        }
    }

    public abstract getHigherScope(): ProviderNode | undefined;
}