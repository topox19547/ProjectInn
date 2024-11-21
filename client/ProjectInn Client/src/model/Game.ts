import type { Token } from "./Token.js"
import type { Player } from "./Player.js"
import type { Scene } from "./Scene.js"
import type { Asset } from "./Asset.js"

interface Game{
    name : string
    ownerName : string
    players : Array<Player>
    scenes : Array<Scene>
    tokenAssets : Array<Asset>
    tokens : Array<Token>
    currentScene : Scene 
    password : string
}