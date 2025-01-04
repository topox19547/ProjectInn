import { ClientHandler } from "../controller/ClientHandler.js";
import { Chat } from "./chat/Chat.js";
import { Dice } from "./chat/commands/Dice.js";
import { Help } from "./chat/commands/Help.js";
import { Whisper } from "./chat/commands/Whisper.js";
import { ClientNotifier } from "./ClientNotifier.js";
import { Asset } from "./gameObjects/asset/Asset.js";
import { Identifiable } from "./gameObjects/Identifiable.js";
import { Permission } from "./gameObjects/player/Permission.js";
import { Player } from "./gameObjects/player/Player.js";
import { Scene } from "./gameObjects/scene/Scene.js";
import { Token } from "./gameObjects/token/Token.js";
import { Vector2 } from "./gameObjects/Vector2.js";
import { Command } from "./messages/Command.js";
import { Status } from "./messages/Status.js";
import { ensureObject, ensureString, ensureArrayOf, weakEnsureOf, ensureGenericObject, ensureNumber } from "./messages/Validators.js";
import { NotificationSource } from "./NotificationSource.js";



export class Game implements NotificationSource{
    private readonly name : string;
    private readonly ownerName : string;
    private readonly players : Array<Player>;
    private readonly tokenAssets : Array<Asset>;
    private readonly scenes : Array<Scene>;
    private readonly tokens : Array<Token>;
    private readonly chat : Chat;
    private readonly maxPasswordLength : number;
    private readonly maxTokens : number;
    private readonly maxTokenAssets : number;
    private readonly maxScenes : number;
    private notifier : ClientNotifier | undefined;
    private currentScene : Scene;
    private password : string | undefined;
    private endCallback : () => void;
    private endTimeout : NodeJS.Timeout | undefined;
    private static maxNameLength : number = 24;
    public static validate = ensureObject({
        name : ensureString,
        ownerName : ensureString,
        players : ensureArrayOf(Player.validate),
        scenes : ensureArrayOf(Scene.validate),
        tokenAssets : ensureArrayOf(Asset.validate),
        tokens : ensureArrayOf(Token.validate),
        currentScene : ensureNumber,
        password : weakEnsureOf(ensureString),
        chat : ensureArrayOf(ensureGenericObject) //The chat doesn't get restored whenever a save is loaded
    });
    
    constructor(name : string, ownerName : string, startingScene : Scene){
        this.name = name;
        this.ownerName = ownerName;
        this.players = new Array();
        this.tokenAssets = new Array<Asset>;
        this.scenes = new Array<Scene>;
        this.tokens = new Array<Token>;
        this.password = undefined;
        this.currentScene = startingScene;
        this.maxPasswordLength = 24;
        this.endTimeout = undefined;
        this.chat = new Chat();
        this.chat.addCommand(new Dice()).addCommand(new Help(this.chat)).addCommand(new Whisper(this));
        this.maxTokens = Number.MAX_SAFE_INTEGER;
        this.maxTokenAssets = Number.MAX_SAFE_INTEGER;
        this.maxScenes = Number.MAX_SAFE_INTEGER;
        this.scenes.push(this.currentScene);
        this.endCallback = () => {};
    }

    public static fromObject(object : ReturnType<typeof this.validate>, notifier : ClientNotifier) : Game | undefined{
        const currentSceneIndex : number = 
            object.scenes.findIndex(s => s.asset.assetID == object.currentScene);
        if(currentSceneIndex == -1){
            return undefined;
        }
        const startingScene : Scene = Scene.fromObject(object.scenes[currentSceneIndex]);
        startingScene.setNotifier(notifier);
        const game : Game = new Game(
            object.name.slice(0,Game.maxNameLength),
            object.ownerName,
            startingScene
        );
        object.scenes.splice(currentSceneIndex, 1); //prevent the current scene from being added in twice
        const sortById = (t1 : Identifiable,t2 : Identifiable) => {
            return t1.getID() < t2.getID() ? -1 : t1.getID() == t2.getID() ? 0 : 1
        };
        const restoreEntityArray = <T extends NotificationSource & Identifiable,K>(
            source : Array<K>,
            dest : Array<Identifiable & NotificationSource>,
            restoreMethod : (object : K) => T | undefined,
            maxEntities : number) : boolean => {
                if(source.length > maxEntities){
                    return false;
                }
                for(const obj of source){
                    const restored : T | undefined = restoreMethod(obj);
                    restored?.setNotifier(notifier);
                    if(restored === undefined){
                        return false;
                    }
                    dest.push(restored)
                }
                dest.sort(sortById);
                if(dest.some(e1 => dest.some(e2 => e1.getID() == e2.getID() && e1 != e2))){
                    return false;
                }
                return true;
        }
        for(const player of object.players){
            if(!Player.isNameValid(player.name)){
                return undefined;
            }
            const newPlayer = Player.fromObject(player);
            newPlayer.setConnected (false);
            newPlayer.setNotifier(notifier);
            if(!game.addPlayer(newPlayer)){
                return undefined;
            }
        }
        if(object.scenes.length >= game.maxScenes){
            return undefined;
        }
        if(!restoreEntityArray(object.scenes, game.scenes, Scene.fromObject, game.maxScenes)){
            return undefined;
        }
        if(!restoreEntityArray(object.tokenAssets, game.tokenAssets, Asset.fromObject, game.maxTokenAssets)){
            return undefined;
        }
        if(!restoreEntityArray(object.tokens, game.tokens, (t) => Token.fromObject(t,game), game.maxTokens)){
            return undefined;
        }
        if(object.password !== undefined && !game.setPassword(object.password)){
            return undefined;
        }
        game.setNotifier(notifier);
        return game;
    }

    public static toObject(game : Game) : ReturnType<typeof Game.validate>{
        return {
            name : game.name,
            ownerName : game.ownerName,
            players : game.players.map(p => Player.toObject(p)),
            tokenAssets : game.tokenAssets.map(a => Asset.toObject(a)),
            scenes : game.scenes.map(s => Scene.toObject(s)),
            tokens : game.tokens.map(t => Token.toObject(t)),
            password : game.password,
            currentScene : game.currentScene.getID(),
            chat : game.getChatInstance().getChatHistory()
        };
    }

    public static getMaxNameLength(){
        return this.maxNameLength;
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
        this.chat.setNotifier(notifier);
    }

    public setEndCallback(callback : () => void) : void{
        this.endCallback = callback;
    }

    public getName() : string{
        return this.name;
    }

    public getOwnerName() : string{
        return this.ownerName;
    }

    public addPlayer(player : Player) : boolean{
        if(this.players.find(p => p.getName() == player.getName()) !== undefined){
            return false;
        }
        this.players.push(player);
        if(this.notifier !== undefined){
            player.setNotifier(this.notifier);
        }
        this.notifier?.notify({
            status : Status.PLAYER,
            command : Command.CREATE,
            content : Player.toObject(player)})
        return true;
    }

    public joinGame(player : Player, handler : ClientHandler) : boolean{
        if(!this.getPlayer(player.getName())){
            return false;
        }
        player.setConnected(true);
        this.chat.handleMessage({
            sender: "ProjectInn",
            isSystem: true,
            text: `${player.getName()} has joined the game`
        })
        if(player.isGameOwner() && this.endTimeout !== undefined){
            clearTimeout(this.endTimeout);
        }
        this.notifier?.subscribe(handler, player);
        return true
    }

    public leaveGame(player : Player, handler : ClientHandler) : boolean{
        if(!this.getPlayer(player.getName())){
            return false;
        }
        player.setConnected(false)
        this.chat.handleMessage({
            sender: "ProjectInn",
            isSystem: true,
            text: `${player.getName()} has left the game`
        })
        if(player.isGameOwner()){
            const endTimeout = 300000;
            this.chat.handleMessage({
                sender: "ProjectInn",
                isSystem: true,
                text: `the owner of the game has left:
                unless they reconnect within ${endTimeout / 60000} 
                minutes, the game will end.`
            });
            this.endTimeout = setTimeout(() => {
                this.endGame()
            }, endTimeout);
        }
        this.notifier?.removeClientsIf(p => p.getName() == player.getName());
        if(this.players.every(p => !p.isConnected())){
            this.endGame();
        }
        return true;
    }

    public removePlayer(player : Player) : boolean{
        const playerIndex : number = this.players.indexOf(player);
        if(playerIndex == -1){
            return false;
        }
        this.players.splice(playerIndex, 1);
        this.tokens.forEach(t => t.removeOwner(player.getName())); //clear token ownerships
        let messageText : string = `${player.getName()} has been kicked`;
        if(this.password !== undefined){
            messageText += " and the game's password has been randomized";
            this.setPassword(this.generateRandomPassword(8));
        }
        this.chat.handleMessage({
            sender: "ProjectInn",
            isSystem: true,
            text: messageText
        })
        this.notifier?.notify({
            status : Status.PLAYER,
            command : Command.DELETE,
            content : {
                name : player.getName()
            }
        })
        this.notifier?.removeClientsIf(p => p.getName() == player.getName())
        return true;
    }

    public getPlayer(playerName : string) : Player | undefined{
        return this.players.find(p => p.getName() == playerName);
    }

    public addTokenAsset(asset : Asset) : boolean{
        if(this.tokenAssets.findIndex(a => a.getName() == asset.getName()) != -1){
            return false;
        }
        this.addToEntityArray(this.tokenAssets,asset);
        if(this.notifier !== undefined){
            asset.setNotifier(this.notifier);
        }
        this.notifier?.notifyIf({
            status : Status.TOKEN_ASSET,
            command : Command.CREATE,
            content : Asset.toObject(asset)}, (p) => p.hasPermission(Permission.MANAGE_TOKENS))
        return true;
    }

    public removeTokenAsset(id : number) : boolean{
        const assetIndex : number = this.tokenAssets.findIndex(a => a.getID() == id);
        if(!(this.tokenAssets.splice(assetIndex, 1).length >= 1)){
            return false
        }
        for(let i =  this.tokens.length - 1; i >= 0; i--){
            const token = this.tokens[i];
            if(token.getAsset().getID() == id){
                this.removeToken(token.getID());
            }
        }
        this.notifier?.notify({
            status : Status.TOKEN_ASSET,
            command : Command.DELETE,
            content : {id : id}})
        return true;
    }

    public getTokenAsset(id : number) : Asset | undefined{
        return this.tokenAssets.find(a => a.getID() == id);
    }

    public isTokenAssetInUse(id : number) : boolean{
        return this.tokens.find(t => t.getAsset().getID() == id) !== undefined;
    }

    public getTokenInPosition(position : Vector2) : Token | undefined{
        return this.tokens.find(t => t.getPosition().equals(position));
    }

    public updateClientTokenAssets(player : Player) : void{
        this.tokenAssets.forEach(a => {
            this.notifier?.notifyIf({
                status : Status.TOKEN_ASSET,
                command : Command.CREATE,
                content : Asset.toObject(a)
            }, p => p.getName() == player.getName());
        });
    }

    public addToken(token : Token) : boolean{
        if(this.tokens.length >= this.maxTokens){
            return false;
        }
        if(this.tokens.find(t => t.getAsset() == token.getAsset()) == undefined){
            this.notifier?.notify({
                status : Status.TOKEN_ASSET,
                command : Command.CREATE,
                content : Asset.toObject(token.getAsset())
            });
        }
        this.addToEntityArray(this.tokens, token);
        if(this.notifier !== undefined){
            token.setNotifier(this.notifier);
        }
        this.notifier?.notify({
            status : Status.TOKEN,
            command : Command.CREATE,
            content : Token.toObject(token)
        });
        //this.tokens.sort();
        return true;
    }

    public removeToken(id : number) : boolean{
        const tokenIndex : number = this.tokens.findIndex(t => t.getID() == id);
        if(tokenIndex == -1){
            return false;
        }
        this.tokens.splice(tokenIndex, 1);
        this.notifier?.notify({
            status : Status.TOKEN,
            command : Command.DELETE,
            content : {
                id : id
            }
        });
        return true;
    }

    public getToken(tokenId : number) : Token | undefined{
        return this.tokens.find(t => t.getID() == tokenId);
    }

    public addScene(scene : Scene) : boolean{
        if(this.scenes.find(s => s.getName() == scene.getName())){
            return false;
        }
        this.addToEntityArray(this.scenes,scene);
        if(this.notifier !== undefined){
            scene.setNotifier(this.notifier);
        }
        this.notifier?.notifyIf({
            status : Status.SCENE,
            command : Command.CREATE,
            content : Scene.toObject(scene)
        }, p => p.hasPermission(Permission.MANAGE_SCENES));
        return true;
    }

    public removeScene(id : number) : boolean{
        const sceneIndex : number = this.scenes.findIndex(s => s.getID() == id);
        if(sceneIndex == -1){
            return false;
        }
        if(this.scenes.length <= 1){
            return false;
        }
        this.scenes.splice(sceneIndex, 1);
        this.notifier?.notify({
            status : Status.SCENE,
            command : Command.DELETE,
            content : {
                id : id
            }
        });
        return true;
    }

    public getScene(id : number) : Scene | undefined{
        return this.scenes.find(s => s.getID() == id);
    }

    public getCurrentScene() : Scene{
        return this.currentScene;
    }

    public changeScene(id : number) : boolean{
        const scene : Scene | undefined = this.getScene(id);
        if(scene === undefined){
            return false;
        }
        this.currentScene = scene;
        this.notifier?.notify({
            status : Status.SCENE_CHANGE,
            command : Command.MODIFY,
            content : Scene.toObject(scene)
        });
        this.adjustTokenPositions(true);
        return true;
    }

    public adjustTokenPositions(hardReset : boolean){
        //reset token positions by putting all of them next to
        //each other starting from the top left corner
        const newPosition : Vector2 = new Vector2(0,0);
        if(hardReset){
            this.tokens.forEach(t => t.setPosition(new Vector2(-1,-1)))
        }
        for(const token of this.tokens){
            if(!hardReset && this.currentScene.isValidPosition(token.getPosition())){
                continue;
            }
            let tokenInPosition : Token | undefined = this.getTokenInPosition(newPosition);
            while(tokenInPosition !== undefined && tokenInPosition != token){
                newPosition.translateX(1); //try moving along the x axis
                if(!this.currentScene.isValidPosition(newPosition)){
                    newPosition.setX(0);
                    newPosition.translateY(1); //try moving along the y axis
                }
                if(!this.currentScene.isValidPosition(newPosition)){
                    newPosition.translateY(-1); //if no tiles are available, stack on the last tile
                    break;
                }
                tokenInPosition = this.getTokenInPosition(newPosition);
            }
            token.setPosition(newPosition);
        }
    }

    public updateClientScenes(player : Player) : void{
        this.scenes.forEach(s => {
            this.notifier?.notifyIf({
                status : Status.SCENE,
                command : Command.CREATE,
                content : Scene.toObject(s)
            }, p => p.getName() == player.getName());
        });
    }

    public checkPassword(attempt : string | undefined) : boolean{
        return this.password === undefined || attempt === this.password;
    }

    public setPassword(password : string | undefined) : boolean{
        if( password !== undefined && password.length > this.maxPasswordLength){
            return false;
        }
        this.password = password;
        this.notifier?.notifyIf({
            status : Status.PASSWORD_CHANGE,
            command : Command.MODIFY,
            content : {
                password : password
            }
        }, p => p.hasPermission(Permission.MASTER));
        return true;
    }

    public endGame() : void{
        this.players.forEach(p => p.setConnected(false));
        this.notifier?.notifyIf(
            {
                status : Status.GAME_END,
                command : Command.DELETE,
                content : {}
            },
            p => !p.isGameOwner()
        );
        this.notifier?.removeAllClients();
        this.endCallback();
    }

    public getChatInstance() : Chat{
        return this.chat;
    }

    public pingMap(position : Vector2, playerName : string) : void{
        this.notifier?.notify({
            status : Status.SCENE_PING,
            command : Command.CREATE,
            content : {
                position : position,
                player : playerName
            }
        })
    }

    private addToEntityArray(array : Array<Identifiable>, object : Identifiable){
        let prev : number = -1;
        let prevId : number = -1;
        for(const [index, t] of array.entries()){
            if(t.getID() - prevId > 1){
                array.splice(prev + 1, 0, object);
                object.setID(prevId + 1)
                return;
            }
            prev = index;
            prevId = t.getID();
        }
        array.push(object);
        object.setID(prevId + 1)
    }

    private generateRandomPassword(length : number){
        const characters : string = "abcdefghijklmnopqrstuvwxyz0123456789";
        let password : string = "";
        for(let i = 0; i < length; i++){
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }

    //TODO:ID MUST BE PRESERVED ACROSS SESSIONS, SO ADDTOKEN CAN'T ASSIGN IDs INDEPENDENTLY
}