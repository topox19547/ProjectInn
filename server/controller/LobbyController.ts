import { FormatError } from "../errors/FormatError.js";
import { ValueError } from "../errors/ValueError.js";
import { Game } from "../model/Game.js";
import { Color } from "../model/gameObjects/player/Color.js";
import { Permission } from "../model/gameObjects/player/Permission.js";
import { Player } from "../model/gameObjects/player/Player.js";
import { Scene } from "../model/gameObjects/scene/Scene.js";
import { Lobby } from "../model/Lobby.js";
import { Command } from "../model/messages/Command.js";
import { Message } from "../model/messages/Message.js";
import { Status } from "../model/messages/Status.js";
import { ensureObject, ensureString, weakEnsureOf, ensureNumber } from "../model/messages/Validators.js";
import { ClientHandler } from "./ClientHandler.js";
import { ClientState } from "./ClientState.js";
import { GameController } from "./GameController.js";



export class LobbyController implements ClientState{
    private readonly lobby : Lobby;
    private readonly clientHandler : ClientHandler;

    constructor(lobby : Lobby, clientHandler : ClientHandler){
        this.lobby = lobby;
        this.clientHandler = clientHandler;
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
                    const game = new Game(content.gameName, content.username, Scene.fromObject(content.scene));
                    const player = new Player(content.username, new Color(content.playerColor))
                    game.addPlayer(player);
                    if (content.password !== undefined){
                        if(!game.setPassword(content.password)){
                            throw new ValueError("Error when setting the game's password");
                        }
                    }
                    this.lobby.publishGame(game);
                    this.clientHandler.send({
                        status : Status.JOIN_GAME,
                        command : Command.CREATE,
                        content : Game.toObject(game)
                    })
                    this.clientHandler.changeState(new GameController(this.lobby, game, player, this.clientHandler));
                    console.log(`new game created by ${content.username}: ${content.gameName}`);
                    break;
                }
                case Status.JOIN_GAME:{
                    const content = ensureObject({
                        gameId : ensureNumber,
                        username : ensureString,
                        playerColor : ensureString,
                        password : weakEnsureOf(ensureString),
                    })(message.content);
                    const games = this.lobby.getRunningGames();
                    const game = games.get(content.gameId);
                    if(game === undefined){
                        throw new ValueError("The requested game doesn't exist");
                    }
                    if(!game.checkPassword(content.password)){
                        throw new ValueError("Wrong password")
                    }
                    let player : Player | undefined = game.getPlayer(content.username);
                    if(!player){
                        player = new Player(content.username, new Color(content.playerColor));
                        if(!game.addPlayer(player)){
                            throw new ValueError("an error occurred while creating the player");
                        }
                    }
                    if(player.isConnected()){
                        throw new ValueError("This player name is already taken");
                    }
                    game.joinGame(player,this.clientHandler);
                    const gameObject : ReturnType<typeof Game.validate> = Game.toObject(game);
                    //Hide certain elements from the player if they don't have the specific permissions
                    if(!player.hasPermission(Permission.MANAGE_SCENES)){
                        gameObject.scenes = gameObject.scenes.filter(
                            s => s.asset.assetID == gameObject.currentScene.asset.assetID)
                    } 
                    if(!player.hasPermission(Permission.MANAGE_TOKENS)){
                        gameObject.tokenAssets = gameObject.tokenAssets.filter(a =>
                            gameObject.tokens.find(t => t.assetID == a.assetID)
                        );
                    }
                    this.clientHandler.send({
                        status : Status.JOIN_GAME,
                        command : Command.CREATE,
                        content : gameObject
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
                        error : e.message
                    }
                });
            } else if (e instanceof FormatError || e instanceof SyntaxError){
                console.log(e);
                console.log(`Message parse error: message of type ${message.status} is malformed`)
            }   
        }
        
    }
}