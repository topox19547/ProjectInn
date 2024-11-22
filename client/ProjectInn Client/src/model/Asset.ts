import { Vector2, type WeakVector2 } from "../types/Vector2.js"
import { AssetType } from "./AssetType.js"

export interface Asset{
    assetID : number
    assetURL : string | undefined
    assetType : AssetType
    assetSize : WeakVector2 | undefined
    name : string
}