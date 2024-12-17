import { permission } from "process";
import { PermissionError } from "../errors/PermissionError.js";
import { ValueError } from "../errors/ValueError.js";
import { Chat } from "../model/chat/Chat.js";
import { Game } from "../model/Game.js";
import { Asset } from "../model/gameObjects/asset/Asset.js";
import { AssetType } from "../model/gameObjects/asset/AssetType.js";
import { Permission } from "../model/gameObjects/player/Permission.js";
import { Player } from "../model/gameObjects/player/Player.js";
import { GridType } from "../model/gameObjects/scene/GridType.js";
import { Scene } from "../model/gameObjects/scene/Scene.js";
import { Stat } from "../model/gameObjects/token/Stat.js";
import { Token } from "../model/gameObjects/token/Token.js";
import { Vector2 } from "../model/gameObjects/Vector2.js";
import { Lobby } from "../model/Lobby.js";
import { Command } from "../model/messages/Command.js";
import { Message } from "../model/messages/Message.js";
import { Status } from "../model/messages/Status.js";
import { ensureObject, ensureNumber, ensureString, ensureEnumLike, ensureBoolean, ensureStringEnumLike, ensureType, weakEnsureOf } from "../model/messages/Validators.js";
import { ClientHandler } from "./ClientHandler.js";
import { ClientState } from "./ClientState.js";
import { LobbyController } from "./LobbyController.js";


export class GameController implements ClientState{
    private readonly lobby : Lobby
    private readonly currentGame : Game;
    private readonly clientPlayer : Player;
    private readonly clientHandler : ClientHandler;

    constructor(lobby : Lobby, currentGame : Game, clientPlayer : Player, clientHandler : ClientHandler){
        this.currentGame = currentGame;
        this.clientPlayer = clientPlayer;
        this.clientHandler = clientHandler;
        this.lobby = lobby
    }
    
    public getNextDefaultState(): ClientState {
        return new LobbyController(this.lobby, this.clientHandler)
    }

    public handleMessage(message : Message): void {
        try{
            switch(message.status){
                case Status.TOKEN_MOVED:
                case Status.TOKEN_MOVING:{
                    const content = ensureObject({
                        position : Vector2.validate,
                        id : ensureNumber,
                    })(message.content);
                    const token : Token = this.getTokenIfAuthorized(content.id, false);
                    const position : Vector2 = new Vector2(content.position.x, content.position.y)
                    if(!this.currentGame.getCurrentScene().isValidPosition(position)){
                        throw new ValueError("Invalid position sent by client");
                    }
                    if(message.status == Status.TOKEN_MOVING){
                        token.drag(position, this.clientPlayer.getName());
                    }else{
                        token.endDrag(position, this.clientPlayer.getName());
                    }
                    break;
                }
                case Status.TOKEN_STAT:{
                    if(message.command == Command.SAFE_MODIFY){
                        const content = ensureObject({
                            id : ensureNumber,
                            name : ensureString,
                            stat : Stat.validate
                        })(message.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.setStat(content.name, new Stat(content.stat.value, content.stat.min, content.stat.max))){
                            throw new ValueError("The name you've chosen is too long");
                        }
                    }else if(message.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber,
                            name : ensureString,
                        })(message.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.removeStat(content.name)){
                            throw new ValueError(`Stat ${content.name} doesn't exist`);
                        }
                    }
                    break;
                }
                case Status.TOKEN_NAME:{
                    const content = ensureObject({
                        name : ensureString,
                        id : ensureNumber,
                    })(message.content);
                    const token : Token = this.getTokenIfAuthorized(content.id, false);
                    if(!token.setName(content.name)){
                        throw new ValueError("Invalid name");
                    }
                    break;
                }
                case Status.TOKEN:{
                    if(!this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS)){
                        new PermissionError();
                    }
                    if(message.command == Command.CREATE){
                        const content = Token.validate(message.content);
                        const token : Token | undefined = Token.fromObject(content, this.currentGame);
                        if(token === undefined){
                            throw new ValueError("Invalid token parameters detected");
                        }
                        if(!this.currentGame.addToken(token)){
                            throw new ValueError("Unable to add any more tokens");
                        }
                    }else if(message.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber
                        })(message.content);
                        if(!this.currentGame.removeToken(content.id)){
                            throw new ValueError(`The token with id ${content.id} doesn't exist`);
                        }
                    }
                    break;
                }
                case Status.TOKEN_OWNERSHIP:{
                    const content = ensureObject({
                        name : ensureString,
                        id : ensureNumber,
                    })(message.content);
                    const token : Token = this.getTokenIfAuthorized(content.id, true);
                    if(!this.currentGame.getPlayer(content.name)){
                        throw new ValueError("This player doesn't exist");
                    }
                    if(message.command == Command.CREATE){
                        if(!token.addOwner(content.name)){
                            throw new ValueError("This player has already been added");
                        }
                    }else if(message.command == Command.DELETE){
                        if(!token.removeOwner(content.name)){
                            throw new ValueError("This player isn't an owner");
                        }
                    }
                    break;
                }
                case Status.TOKEN_NOTE : {
                    if(message.command == Command.SAFE_MODIFY){
                        const content = ensureObject({
                            id : ensureNumber,
                            title : ensureString,
                            note : ensureString
                        })(message.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.setNote(content.title, content.note)){
                            throw new ValueError("The note title you've chosen is too long");
                        }
                    }else if(message.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber,
                            title : ensureString,
                        })(message.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.removeStat(content.title )){
                            throw new ValueError(`Note ${content.title} doesn't exist`);
                        }
                    }
                    break;
                }
                case Status.CHAT : {
                    const content = ensureObject({
                        text : ensureString
                    })(message.content);
                    const chat : Chat = this.currentGame.getChatInstance();
                    chat.handleMessage({
                        text : content.text,
                        sender : this.clientPlayer.getName(),
                        isSystem : false
                    });
                    break;
                }
                case Status.SCENE_PING : {
                    const content = ensureObject({
                        position : Vector2.validate
                    })(message.content)
                    this.currentGame.pingMap(new Vector2(content.position.x, content.position.y))
                    break;
                }
                case Status.PASSWORD_CHANGE : {
                    const content = ensureObject({
                        password : weakEnsureOf(ensureString)
                    })(message.content);
                    if(!this.clientPlayer.hasPermission(Permission.MASTER)){
                        throw new PermissionError();
                    }
                    if(!this.currentGame.setPassword(content.password)){
                        throw new ValueError("The password you've chosen is too long");
                    }
                    break;
                }
                case Status.PERMISSIONS : {
                    const content = ensureObject({
                        name : ensureString,
                        permission : ensureStringEnumLike(Object.values(Permission).filter(v => typeof v == "string")),
                        value : ensureBoolean
                    })(message.content);
                    const permission = Permission[content.permission as keyof typeof Permission]
                    if(!this.clientPlayer.hasPermission(Permission.MASTER) && !this.clientPlayer.isGameOwner()){
                        throw new PermissionError();
                    }
                    const playerToChange : Player | undefined = this.currentGame.getPlayer(content.name);
                    if(playerToChange === undefined){
                        throw new ValueError("This player doesn't exist")
                    }
                    if(this.currentGame.getPlayer(content.name)?.isGameOwner()){
                        throw new PermissionError();
                    }
                    if(!playerToChange.hasPermission(Permission.MASTER)){
                        playerToChange.setPermission(permission, content.value);
                    } else if (this.clientPlayer.isGameOwner()){
                        playerToChange.setPermission(permission, content.value);
                    } else {
                        throw new PermissionError();
                    }
                    if(!content.value == true){
                        return;
                    }
                    if(permission == Permission.MANAGE_SCENES){
                        this.currentGame.updateClientScenes(playerToChange);
                    } else if (permission == Permission.MANAGE_TOKENS){
                        this.currentGame.updateClientTokenAssets(playerToChange);
                    }
                    break;
                }
                case Status.SCENE : {
                    if(!this.clientPlayer.hasPermission(Permission.MANAGE_SCENES)){
                        throw new PermissionError();
                    }
                    if(message.command == Command.CREATE){
                        const content = Scene.validate(message.content);
                        const scene : Scene = Scene.fromObject(content);
                        if(!this.currentGame.addScene(scene)){
                            throw new ValueError("There already is a scene with the same name");
                        }
                    }
                    else if(message.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber
                        })(message.content);
                        if(!this.currentGame.removeScene(content.id)){
                            throw new ValueError("Could not remove scene");
                        }
                    } else if(message.command == Command.MODIFY){
                        const content = Scene.validate(message.content);
                        const scene : Scene = this.getSceneIfAuthorized(content.asset.assetID);
                        scene.setGridType(content.gridType);
                        scene.setOffset(new Vector2(content.offset.x,content.offset.y));
                        scene.setTileSize(content.tileSize);
                        const asset : Asset = scene.getAsset();
                        const assetSize : Vector2 = new Vector2(
                            content.asset.assetSize.x,
                            content.asset.assetSize.y);
                        asset.setName(content.asset.name);
                        asset.setURL(content.asset.assetURL, assetSize);
                    }
                    break;
                }
                case Status.SCENE_CHANGE : {
                    const content = ensureObject({
                        id : ensureNumber
                    })(message.content);
                    if(!this.clientPlayer.hasPermission(Permission.MASTER)){
                        throw new PermissionError();
                    }
                    if(!this.currentGame.changeScene(content.id)){
                        throw new ValueError("No scene exists with this ID");
                    }
                    break;
                }
                case Status.TOKEN_ASSET : {
                    if(!this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS)){
                        throw new PermissionError();
                    }
                    if(message.command == Command.CREATE){
                        const content = Asset.validate(message.content);
                        if(content.name.length > Asset.getMaxNameLength()){
                            throw new ValueError("Asset name is too long");
                        }
                        if(content.assetType != AssetType.TOKEN){
                            throw new ValueError("Wrong asset type passed");
                        }
                        if(!this.currentGame.addTokenAsset(Asset.fromObject(content))){
                            throw new ValueError("There already is a token asset with the same name");
                        }
                    } else if (message.command == Command.DELETE){
                        const content = ensureObject({id : ensureNumber})(message.content);
                        if(!this.currentGame.removeTokenAsset(content.id)){
                            throw new ValueError("No token asset exists with this ID")
                        }
                    } else if (message.command == Command.MODIFY){
                        const content = Asset.validate(message.content);
                        const asset : Asset = this.getAssetIfAuthorized(content.assetID, AssetType.TOKEN);
                        if(!asset.setName(content.name)){
                            throw new ValueError("The supplied name is too long");
                        }
                        if(!asset.setURL(content.assetURL, new Vector2(content.assetSize.x, content.assetSize.y))){
                            throw new ValueError("The given url is too long")
                        }
                    }
                    break;
                }
                case Status.PLAYER : {
                    if(message.command == Command.DELETE){
                        const content = ensureObject({
                            name : ensureString,
                        })(message.content);
                        const playerToKick = this.currentGame.getPlayer(content.name);
                        if(playerToKick === undefined || playerToKick == this.clientPlayer){
                            throw new ValueError("invalid player");
                        }
                        if(!this.clientPlayer.isGameOwner() && !this.clientPlayer.hasPermission(Permission.MASTER)){
                            throw new PermissionError();
                        }
                        if(!playerToKick.hasPermission(Permission.MASTER) && !this.clientPlayer.isGameOwner()){
                            throw new PermissionError();
                        }
                        this.currentGame.removePlayer(playerToKick);
                    }
                    break;
                }
                case Status.GAME_END : {
                    if(this.clientPlayer.isGameOwner()){
                        this.currentGame.endGame();
                    }
                    break;
                }
                case Status.SAVE_GAME : {
                    if(this.clientPlayer.isGameOwner()){
                        const game = Game.toObject(this.currentGame);
                        game.chat = [];
                        this.clientHandler.send({
                            status : Status.SAVE_GAME,
                            command : Command.NONE,
                            content : game
                        });
                    }
                }
                case Status.CLIENT_STATUS : {
                    if(message.command == Command.DELETE){
                        this.currentGame.leaveGame(this.clientPlayer, this.clientHandler);
                    }
                    break;
                }
            }
        }
        catch (e){
            if(e instanceof PermissionError || e instanceof ValueError){
                this.clientHandler.send({
                    status : Status.ERROR,
                    command : Command.NONE,
                    content : {
                        error : e.message
                    }
                });
            }
        }
    }


    private getTokenIfAuthorized(id : number, ignoreOwnership : boolean) : Token{
        const token : Token | undefined = this.currentGame.getToken(id);
        if(token === undefined){
            throw new ValueError(`token with id ${id} doesn't exist`);
        }
        if(!ignoreOwnership && token.isOwner(this.clientPlayer)){
            return token;
        }
        if(this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS)){
            return token;
        }
        throw new PermissionError();
    }

    private getSceneIfAuthorized(id : number) : Scene{
        if(!this.clientPlayer.hasPermission(Permission.MANAGE_SCENES)){
            throw new PermissionError();
        }
        const scene : Scene | undefined = this.currentGame.getScene(id);
        if(scene === undefined){
            throw new ValueError("No scene exists with this ID");
        }
        return scene;
    }

    private getAssetIfAuthorized(id : number, type : AssetType) : Asset{
        let asset : Asset | undefined;
        let requiredPermission : Permission
        if(type == AssetType.TOKEN){
            requiredPermission = Permission.MANAGE_TOKENS;
            asset = this.currentGame.getTokenAsset(id);
        }else if(type == AssetType.SCENE){
            requiredPermission = Permission.MANAGE_SCENES;
            asset = this.currentGame.getScene(id)?.getAsset();
        }else{
            throw new ValueError("Undefined content type");
        }
        if(!this.clientPlayer.hasPermission(requiredPermission)){
            throw new PermissionError();
        }
        if(asset == undefined){
            throw new ValueError("There is no asset with the supplied type and ID");
        }
        return asset;
    }

}


