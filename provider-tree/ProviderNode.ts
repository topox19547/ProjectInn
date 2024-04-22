/**abstract class extended by any object part of the ProviderTree, which has:
 * a PermissionStorage instance, which stores the permissions
 * users have towards the object itself (or to all of the objects below it if it's on an higher level)
 * a StatTypeStorage instance, which store all of the properties 
 * applied to the object itself (or to all of the objects below it if it's on an higher level)
 * a getHigherScope() method for traversing upwards through the "tree"
 */

import { PermissionStorage } from "../permissions/PermissionsStorage";
import { StatTypesStorage } from "../stats/StatTypesStorage";

export abstract class ProviderNode{
    private localPermissions:PermissionStorage;
    private localStatTypes:StatTypesStorage;

    constructor(){
        this.localPermissions = new PermissionStorage();
        this.localStatTypes = new StatTypesStorage();
    }

    /**
     * gets a clone of the local permissions storage object
     * @returns the local permissions storage object
     */
    public getLocalPermissions(): PermissionStorage {
        return this.localPermissions.clone();
    }

    public setLocalPermissions(permissionStorage:PermissionStorage): void{
        this.localPermissions = permissionStorage.clone();
    }

    /**
     * gets a clone of the local permissions storage object
     * @returns the local stat type storage object
     */
    public getLocalStatTypes(): StatTypesStorage {
        return this.localStatTypes.clone()
    }

    public setLocalStatTypes(statTypeStorage: StatTypesStorage): void {
        this.localStatTypes = statTypeStorage.clone();
    }

    public abstract getHigherScope(): ProviderNode | undefined;
}