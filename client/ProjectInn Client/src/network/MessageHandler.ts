import type { Ref } from "vue";
import { getDefaultLocalSettings, type Game, type LocalSettings } from "../model/Game.js";
import type { Message } from "./message/Message.js";
import { Status } from "./message/Status.js";
import { Command } from "./message/Command.js";
import type { Token } from "../model/Token.js";
import type { Stat } from "../model/Stat.js";
import { AssetType } from "../model/AssetType.js";
import type { Lobby } from "../model/Lobby.js";
import type { Scene } from "../model/Scene.js";
import type { Player } from "../model/Player.js";
import { SaveManager } from "../filesystem/SaveManager.js";
import { tokenToString } from "typescript";



export class MessageHandler{
    private lobby : Ref<Lobby>;
    private game : Ref<Game | undefined>;
    private localSettings : Ref<LocalSettings | undefined>
    private saveManager : SaveManager;

    constructor(lobby : Ref<Lobby>, game : Ref<Game | undefined>, localSettings : Ref<LocalSettings | undefined>){
        this.lobby = lobby;
        this.game = game;
        this.localSettings = localSettings;
        this.saveManager = new SaveManager();
    }

    handleMessage(message : Message){
        console.log(message);
        const content = message.content;

        if(this.game.value === undefined){ //Handle lobby messages
            switch(message.status){
                case Status.LOBBY_UPDATE:{
                    this.lobby.value.activeGames = content.activeGames;
                    break;
                }
                case Status.JOIN_GAME:{
                    this.game.value = content.game as Game;
                    this.game.value.id = content.id
                    this.game.value.currentScene = content.game.scenes.find(
                        (s : Scene) => s.asset.assetID == content.game.currentScene);
                    this.game.value.localPlayer = content.game.players.find(
                        (p : Player) => content.player == p.name);
                    if(this.localSettings.value !== undefined){
                        this.game.value.localSettings = this.localSettings.value
                    } else {
                        this.game.value.localSettings = getDefaultLocalSettings(this.game.value);
                    }
                }
            }
            return;
        }

        switch(message.status){
            case Status.TOKEN:{
                if(message.command == Command.CREATE){
                    const index : number = this.game.value.tokens.findIndex(t => t.id == content.id);
                    this.game.value.tokens.push(content);
                } else if (message.command == Command.DELETE){
                    const index : number = this.game.value.tokens.findIndex(t => t.id == content.id);
                    this.game.value.tokens.splice(index,1);
                }
                break;
            }
            case Status.TOKEN_ASSET:{
                if(message.command == Command.CREATE){
                    const assetIndex = this.game.value.tokenAssets.findIndex(t => t.assetID == content.assetID);
                    if(assetIndex == -1){
                        this.game.value.tokenAssets.push(content);
                    }else{
                        this.game.value.tokenAssets[assetIndex] = content;
                    }
                } else if (message.command == Command.DELETE){
                    const index : number = this.game.value.tokenAssets.findIndex(t => t.assetID == content.id);
                    this.game.value.tokenAssets.splice(index,1);
                }
                break;
            }
            case Status.TOKEN_MOVED:
            case Status.TOKEN_MOVING:
            case Status.TOKEN_NAME:
            case Status.TOKEN_STAT:
            case Status.TOKEN_NOTE:
            case Status.TOKEN_OWNERSHIP:{
                const token : any = this.game.value.tokens.find(t => t.id == content.id)
                if (token === undefined){
                    throw Error("Message refers to a token that doesn't exist");
                }
                Object.keys(content).forEach(k  => token[k] = content[k])
                break;
            }
            case Status.SCENE_CHANGE:{
                let scene : Scene | undefined = 
                    this.game.value.scenes.find(s => s.asset.assetID == content.asset.assetID);
                if(scene === undefined){
                    this.game.value.scenes.push(content);
                    scene = content as Scene;
                }
                this.game.value.currentScene = scene;
                break;
            }
            case Status.SCENE:{
                if(message.command == Command.CREATE){
                    const sceneIndex = this.game.value.scenes.findIndex(s => s.asset.assetID == content.asset.assetID);
                    if(sceneIndex == -1){
                        this.game.value.scenes.push(content);
                    }else{
                        this.game.value.scenes[sceneIndex] = content;
                    }
                } else if (message.command == Command.DELETE){
                    const index : number = this.game.value.scenes.findIndex(s => s.asset.assetID == content.asset.assetID);
                    this.game.value.scenes.splice(index,1);
                }
                break;
            }
            case Status.SCENE_GRIDTYPE:
            case Status.SCENE_OFFSET:
            case Status.SCENE_TILESIZE:{
                const scene : any = this.game.value.scenes.find(s => s.asset.assetID == content.asset.assetID)
                if (scene === undefined){
                    throw Error("Message refers to a scene that doesn't exist");
                }
                Object.keys(content).forEach(k => scene[k] = content[k] );
                break;
            }
            case Status.ASSET_NAME:
            case Status.ASSET_URL:
            case Status.ASSET_SIZE:{
                let asset : any;
                if(content.assetType == AssetType.SCENE){
                    const scene = this.game.value.scenes.find(s => s.asset.assetID == content.assetID);
                    if (scene === undefined){
                        throw Error("Message refers to a scene asset that doesn't exist");
                    }
                    asset = scene.asset;
                } else if (content.assetType == AssetType.TOKEN){
                    asset = this.game.value.tokenAssets.find(a => a.assetID == content.assetID);
                    if(asset == undefined){
                        throw Error("Message refers to a token asset that doesn't exist");
                    }
                }
                Object.keys(content).forEach(k => asset[k] = content[k]);
                break;
            }
            case Status.PLAYER:{
                if(message.command == Command.CREATE){
                    this.game.value.players.push(content);
                } else if (message.command == Command.DELETE){
                    const index : number = this.game.value.players.findIndex(p => p.name == content.name);
                    this.game.value.players.splice(index,1);
                }
                break;
            }
            case Status.PERMISSIONS:{
                const player : any = this.game.value.players.find(p => p.name == content.name);
                if(player == undefined){
                    throw Error("Message refers to a token asset that doesn't exist");
                }
                player.permissions = content.permissions;
                break;
            }
            case Status.CHAT:{
                content.receivedAt = new Date()
                this.game.value.chat.push(content);
                break;
            }
            case Status.PASSWORD_CHANGE:{
                this.game.value.password = content.password;
            }
            case Status.CLIENT_STATUS:{
                if(content.name == this.game.value.localPlayer.name){
                    this.game.value = undefined;
                    this.localSettings.value = undefined;
                    return;
                }
                const index : number = this.game.value.players.findIndex(p => p.name == content.name);
                this.game.value.players[index].connected = content.connected;
                break;
            }
            case Status.SAVE_GAME:{
                this.saveManager.SaveGame(content, this.game.value.localSettings);
            }
            //TODO: ADD THE REST OF THE STATUSES
                
        }
    }
}