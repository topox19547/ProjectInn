import { FormatError } from "../errors/FormatError.js";
import { ValueError } from "../errors/ValueError.js";
import { ClientNotifier } from "../model/ClientNotifier.js";
import { Game } from "../model/Game.js";
import { Color } from "../model/gameObjects/player/Color.js";
import { Permission } from "../model/gameObjects/player/Permission.js";
import { Player } from "../model/gameObjects/player/Player.js";
import { Scene } from "../model/gameObjects/scene/Scene.js";
import { Lobby } from "../model/Lobby.js";
import { Command } from "../model/messages/Command.js";
import { Message } from "../model/messages/Message.js";
import { Status } from "../model/messages/Status.js";
import { ensureObject, ensureString, weakEnsureOf, ensureNumber, ensureBoolean } from "../model/messages/Validators.js";
import { ClientHandler } from "./ClientHandler.js";
import { ClientState } from "./ClientState.js";
import { GameController } from "./GameController.js";



export class LobbyController implements ClientState{
    private readonly lobby : Lobby;
    private readonly clientHandler : ClientHandler;

    constructor(lobby : Lobby, clientHandler : ClientHandler){
        this.lobby = lobby;
        this.clientHandler = clientHandler;
        this.lobby.addToLobby(clientHandler);
    }

    getNextDefaultState(): ClientState {
        return this
    }

    public handleMessage(message : Message): void {
        try{
            switch(message.status){
                case Status.CREATE_GAME:{
                    const content = ensureObject({
                        username : ensureString,
                        playerColor : ensureString,
                        gameName : ensureString,
                        password : weakEnsureOf(ensureString),
                        scene : Scene.validate
                    })(message.content);
                    const notifier : ClientNotifier = new ClientNotifier()
                    const startingScene : Scene = Scene.fromObject(content.scene);
                    startingScene.setNotifier(notifier);
                    const game : Game = new Game(content.gameName, content.username, startingScene);
                    game.setNotifier(notifier);
                    if(content.username.length > Player.getMaxNameLength()){
                        throw new ValueError("The player's name is too long");
                    }
                    const player : Player = new Player(content.username, new Color(content.playerColor), true)
                    game.addPlayer(player);
                    if (content.password !== undefined){
                        if(!game.setPassword(content.password)){
                            throw new ValueError("Error when setting the game's password");
                        }
                    }
                    game.joinGame(player, this.clientHandler);
                    const id : number = this.lobby.publishGame(game);
                    game.setEndCallback(() => this.lobby.removeGame(game))
                    this.clientHandler.send({
                        status : Status.JOIN_GAME,
                        command : Command.CREATE,
                        content : {
                            game : Game.toObject(game),
                            player : player.getName(),
                            id : id
                        }
                    })
                    this.clientHandler.changeState(new GameController(this.lobby, game, player, this.clientHandler));
                    console.log(`new game created by ${content.username}: ${content.gameName}`);
                    break;
                }
                case Status.LOAD_GAME:{
                    const content = Game.validate(message.content);
                    const notifier : ClientNotifier = new ClientNotifier();
                    const game : Game | undefined = Game.fromObject(content, notifier);
                    if(game === undefined){
                        throw new ValueError("Not a valid game file!")
                    }
                    const player : Player | undefined = game.getPlayer(game.getOwnerName());
                    if(player === undefined){
                        throw new ValueError("Not a valid game file: owner is missing from the players")
                    }
                    game.joinGame(player, this.clientHandler);
                    const id : number = this.lobby.publishGame(game);
                    game.setEndCallback(() => this.lobby.removeGame(game))
                    this.clientHandler.send({
                        status : Status.JOIN_GAME,
                        command : Command.CREATE,
                        content : {
                            game : Game.toObject(game),
                            player : player.getName(),
                            id : id
                        }
                    })
                    this.clientHandler.changeState(new GameController(this.lobby, game, player, this.clientHandler));
                    console.log(`new game loaded by ${content.ownerName}: ${content.name}`);
                    break;
                }
                case Status.JOIN_GAME:{
                    const content = ensureObject({
                        gameId : ensureNumber,
                        username : ensureString,
                        playerColor : ensureString,
                        password : weakEnsureOf(ensureString),
                        newPlayer : ensureBoolean
                    })(message.content);
                    const games = this.lobby.getRunningGames();
                    const game = games.get(content.gameId);
                    if(game === undefined){
                        throw new ValueError("The requested game doesn't exist");
                    }
                    if(!game.checkPassword(content.password)){
                        throw new ValueError("Wrong password")
                    }
                    if(content.username.length > Player.getMaxNameLength()){
                        throw new ValueError("The player's name is too long");
                    }
                    let player : Player | undefined = game.getPlayer(content.username);
                    if(content.newPlayer == false && player === undefined){
                        throw new ValueError(`No player already exists with the name "${content.username}", please create a new one`);
                    }
                    if(content.newPlayer == true && player !== undefined){
                        throw new ValueError(`The player name "${content.username}" is already taken`);
                    }
                    if(player === undefined){
                        player = new Player(content.username, new Color(content.playerColor), false);
                        if(!game.addPlayer(player)){
                            throw new ValueError("an error occurred while creating the player");
                        }
                    }
                    if(player.isConnected()){
                        throw new ValueError(`A player with the name "${content.username}" is already connected to the game`);
                    }
                    game.joinGame(player,this.clientHandler);
                    const gameObject : ReturnType<typeof Game.validate> = Game.toObject(game);
                    //Hide certain elements from the player if they don't have the specific permissions
                    if(!player.hasPermission(Permission.MANAGE_SCENES)){
                        gameObject.scenes = gameObject.scenes.filter(
                            s => s.asset.assetID == gameObject.currentScene)
                    } 
                    if(!player.hasPermission(Permission.MANAGE_TOKENS)){
                        gameObject.tokenAssets = gameObject.tokenAssets.filter(a =>
                            gameObject.tokens.find(t => t.assetID == a.assetID)
                        );
                    }
                    this.clientHandler.send({
                        status : Status.JOIN_GAME,
                        command : Command.CREATE,
                        content : {
                            game : Game.toObject(game),
                            player : player.getName(),
                            id : content.gameId
                        }
                    });
                    this.clientHandler.changeState(new GameController(this.lobby, game, player, this.clientHandler));      
                    break;
                }   
                case Status.LOBBY_UPDATE: {
                    this.clientHandler.send(this.lobby.buildMatchListMessage());
                    break;
                }
                case Status.CLIENT_STATUS:{
                    if(message.command == Command.DELETE){
                        this.lobby.leaveLobby(this.clientHandler);
                    }
                    break;
                }
            }
        }catch(e){
            if(e instanceof ValueError){
                console.log(e);
                this.clientHandler.send({
                    status : Status.ERROR,
                    command : Command.NONE,
                    content : {
                        text : e.message
                    }
                });
            } else if (e instanceof SyntaxError || e instanceof FormatError){
                console.log(e);
                console.log(`Message parse error: message of type ${message.status} is malformed`);
                this.clientHandler.send({
                    status : Status.ERROR,
                    command : Command.NONE,
                    content : {
                        text : "wrong message format."
                    }
                });
            }   
        }
        
    }
}