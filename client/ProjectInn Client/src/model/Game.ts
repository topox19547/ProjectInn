import type { Token } from "./Token.js"
import type { Player } from "./Player.js"
import type { Scene } from "./Scene.js"
import type { Asset } from "./Asset.js"
import type { ChatMessage } from "./ChatMessage.js"

export interface Game{
    name : string
    ownerName : string
    players : Array<Player>
    localPlayer : Player
    scenes : Array<Scene>
    tokenAssets : Array<Asset>
    tokens : Array<Token>
    currentScene : Scene 
    password : string | undefined
    chat : Array<ChatMessage>
    localSettings : LocalSettings
}

export interface LocalSettings{
    autoSaveEnabled : boolean
}

export function getDefaultLocalSettings(game : Game){
    return {
        autoSaveEnabled : game.localPlayer.isOwner
    }
}