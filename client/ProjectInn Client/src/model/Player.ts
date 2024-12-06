import type { Permission } from "./Permission.js"

export interface Player{
    name : string
    color : string
    permissions : Record<string, boolean>
    connected : boolean
}