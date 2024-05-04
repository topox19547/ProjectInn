import { ProviderNode } from "./ProviderNode";
import { PermissionProvider } from "../deprecated/PermissionsProvider";
import { Player } from "../actors/Player";
import { StatTypesProvider } from "../deprecated/StatTypesProvider";

export class Game extends ProviderNode{

    /**
     * gets the higher scope in the Provider Tree
     * @returns undefined, since Game is the Provider Tree's root
     */
    public getHigherScope(): undefined {
        return undefined;
    }
}