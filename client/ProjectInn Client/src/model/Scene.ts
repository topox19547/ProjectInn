import type { WeakVector2 } from "../types/Vector2.js";
import type { Asset } from "./Asset.js";
import { AssetType } from "./AssetType.js";
import { GridType } from "./GridType.js";

export interface Scene{
    asset : Asset
    gridType : GridType
    offset : WeakVector2
    tileSize : number
}

export function getStartingSceneData() : Scene{
    return {
        asset : {
            name : "starting scene",
            assetID : 0,
            assetType : AssetType.SCENE,
            assetSize : {x : 0, y : 0},
            assetURL : undefined
        },
        tileSize : 100,
        gridType : GridType.SQUARE,
        offset : {x : 0, y : 0}
    };
}