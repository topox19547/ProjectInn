import { Player } from "./Player/Player";
import { Provider } from "./Provider";

/**
 * interface for classes that are part of the permission tree.
 * the methods using this interface will traverse the tree upwards
 * by calling getHigherScope repeatedly until it returns undefined
 */

export interface PermissionProvider extends Provider{
    /**
     * checks if the given player has a permission
     * @param player the player to check
     * @param permission the permission to check for
     * @returns whether the player has the given permission
     */
    hasPermission(player:Player, permission:Permission):boolean;
    /**
     * gives a permission to a player
     * @param player the player to receive the permission
     * @param permission the permission to give
     */
    addPermission(player:Player, permission:Permission):void;
    /**
     * removes a permission from a player
     * @param player the player to lose the permission
     * @param permission the permission to remove
     */
    removePermission(player:Player, permission:Permission):void;
}