import type { Game, LocalSettings } from "./Game.js";

export interface SavedGame{
    game : Game
    info : string
    localSettings : LocalSettings
}