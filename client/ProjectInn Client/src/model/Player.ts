import type { Permission } from "./Permission.js"

export interface Player{
    name : string
    color : string
    isOwner : boolean
    permissions : Record<string, boolean>
    connected : boolean
}