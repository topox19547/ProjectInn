import type { WeakVector2 } from "../types/Vector2.js"
import type { Stat } from "./Stat.js"

export interface Token{
    name : string
    id : number
    assetID : number
    owners : Array<string>
    notes : Record<string, string>
    stats : Record<string, Stat>
    position : { coordinates : WeakVector2, inDrag : boolean, byUser : string}
}