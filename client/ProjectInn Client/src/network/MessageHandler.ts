import type { Ref } from "vue";
import type { Game } from "../model/Game.js";
import type { Message } from "./message/Message.js";
import { Status } from "./message/Status.js";
import { Command } from "./message/Command.js";
import type { Token } from "../model/Token.js";
import type { Stat } from "../model/Stat.js";
import { AssetType } from "../model/AssetType.js";



export class MessageHandler{
    private lobby : Ref<Lobby>;
    private game : Ref<Game>;

    constructor(lobby : Ref<Lobby>, game : Ref<Game>){
        this.lobby = lobby;
        this.game = game;
    }

    handleMessage(message : Message){
        const content = message.content;
        switch(message.status){
            case Status.TOKEN:{
                if(message.command == Command.CREATE){
                    this.game.value.tokens.push(content);
                } else if (message.command == Command.DELETE){
                    const index : number = this.game.value.tokens.findIndex(t => t.id == content.id);
                    this.game.value.tokens.splice(index,1);
                }
            }
            case Status.TOKEN_ASSET:
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
            }
            case Status.SCENE:{
                if(message.command == Command.CREATE){
                    this.game.value.scenes.push(content);
                } else if (message.command == Command.DELETE){
                    const index : number = this.game.value.scenes.findIndex(s => s.asset.assetID == content.id);
                    this.game.value.scenes.splice(index,1);
                }
            }
            case Status.SCENE_GRIDTYPE:
            case Status.SCENE_OFFSET:
            case Status.SCENE_TILESIZE:{
                const scene : any = this.game.value.scenes.find(s => s.asset.assetID == content.id)
                if (scene === undefined){
                    throw Error("Message refers to a scene that doesn't exist");
                }
                Object.keys(content).forEach(k => scene[k] = content[k])
            }
            case Status.ASSET_NAME:
            case Status.ASSET_URL:
            case Status.ASSET_SIZE:{
                let asset : any;
                if(content.assetType == AssetType.SCENE){
                    const scene = this.game.value.scenes.find(s => s.asset.assetID == content.id);
                    if (scene === undefined){
                        throw Error("Message refers to a scene asset that doesn't exist");
                    }
                    asset = scene.asset;
                } else if (content.assetType == AssetType.TOKEN){
                    asset = this.game.value.tokenAssets.find(a => a.assetID == content.id);
                    if(asset == undefined){
                        throw Error("Message refers to a token asset that doesn't exist");
                    }
                }
                Object.keys(content).forEach(k => asset[k] = content[k]);
            }
            case Status.PLAYER:{
                if(message.command == Command.CREATE){
                    this.game.value.players.push(content);
                } else if (message.command == Command.DELETE){
                    const index : number = this.game.value.players.findIndex(p => p.name == content.name);
                    this.game.value.players.splice(index,1);
                }
                
            }
            case Status.PERMISSIONS:{
                const player : any = this.game.value.players.find(p => p.name == content.name);
                if(player == undefined){
                    throw Error("Message refers to a token asset that doesn't exist");
                }
                player.permissions = content.permissions;
            }
            case Status.CHAT:{
                this.game.value.chat.push(content);
            }
            case Status.LOBBY_UPDATE:{
                this.lobby.value.activeGames = content;
            }
            //TODO: ADD THE REST OF THE STATUSES
                
        }
    }
}