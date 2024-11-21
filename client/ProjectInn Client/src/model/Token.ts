import type { WeakVector2 } from "../types/Vector2.js"

export interface Token{
    name : string
    id : number
    assetID : number
    owners : Array<string>
    notes : Array<string>
    stats : Array<{min? : number, max? : number, value : number}>
    position : Array<WeakVector2>
}