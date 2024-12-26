import type { Token } from "./Token.js"
import type { Player } from "./Player.js"
import type { Scene } from "./Scene.js"
import type { Asset } from "./Asset.js"
import type { ChatMessage } from "./ChatMessage.js"
import { Vector2, type WeakVector2 } from "../types/Vector2.js"

export interface Game{
    id : number
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
    viewData : ViewData
}

export interface LocalSettings{
    autoSaveEnabled : boolean
}

export interface ViewData{
    selectedToken : Token | undefined
    viewCenterPosition : Vector2
    errorBuffer : Array<string>
    pingBuffer : Array<{position : WeakVector2, player : string}>
}


export function getInitializedViewData(): ViewData{ 
    return{
        selectedToken : undefined,
        viewCenterPosition : new Vector2(0,0),
        errorBuffer : [],
        pingBuffer : []
    }
}

export function getDefaultLocalSettings(game : Game){
    return {
        autoSaveEnabled : game.localPlayer.isOwner
    }
}