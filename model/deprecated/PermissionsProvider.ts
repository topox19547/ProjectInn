import { PermissionStorage } from "../permissions/PermissionsStorage";
import { Player } from "../actors/Player";
import { Provider } from "./Provider";

/**
 * interface for classes that are part of the permission tree.
 * the methods using this interface will traverse the tree upwards
 * by calling getHigherScope repeatedly until it returns undefined
 */

export interface PermissionProvider extends Provider{
    /**
     * gets a copy of the local Permissions for an object
     */
    getLocalPermissions():PermissionStorage;
    /**
     * sets the new PermissionStorage instance for the object
     */
    setLocalPermissions(PermissionStorage:PermissionStorage):void;
}