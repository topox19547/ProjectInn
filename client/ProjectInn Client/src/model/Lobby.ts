import type { GamePreview } from "./gamePreview.js"

export interface Lobby{
    activeGames : Array<GamePreview>
    localGames : Array<GamePreview>
}