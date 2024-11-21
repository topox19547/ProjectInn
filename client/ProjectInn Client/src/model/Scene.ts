import type { WeakVector2 } from "../types/Vector2.js";
import type { Asset } from "./Asset.js";
import type { GridType } from "./GridType.js";

export interface Scene{
    asset : Asset
    gridType : GridType
    offset : WeakVector2
    tileSize : WeakVector2
}