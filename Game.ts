import { PermissionProvider } from "./PermissionsProvider";
import { Player } from "./Player/Player";
import { StatProvider } from "./StatProvider";

export class Game implements PermissionProvider, StatProvider{
    hasPermission(player: Player, permission: Permission): boolean {
        throw new Error("Method not implemented.");
    }
    getHigherScope(): PermissionProvider {
        throw new Error("Method not implemented.");
    }
    addPermission(player: Player, permission: Permission): void {
        throw new Error("Method not implemented.");
    }
    removePermission(player: Player, permission: Permission): void {
        throw new Error("Method not implemented.");
    }
    private: any;

}