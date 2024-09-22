import { ProviderNode } from "./ProviderNode";
import { Game } from "./Game";
import { PermissionProvider } from "../PermissionsProvider";
import { Provider } from "../Provider";
import { StatTypesProvider } from "../StatTypesProvider";

/**
 * class that synchronizes the the default name, the attribute types,
 * and the asset path that represents the token between the token instances that share the type.
 */

export class TokenType extends ProviderNode{
    private name:string;
    private assetPath:string;
    private game:Game;

    constructor(name:string, assetPath:string, game:Game){
        super();
        this.name = name;
        this.assetPath = assetPath;
        this.game = game;
    }

    public getHigherScope(): ProviderNode {
        return this.game;
    }

    public setName(name:string){
        this.name = name;
    }

    public getName():string{
        return this.name;
    }
}
