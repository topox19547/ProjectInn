import { FormatError } from "../errors/FormatError";
import { ValueError } from "../errors/ValueError";
import { Game } from "../model/Game";
import { Color } from "../model/gameObjects/player/Color";
import { Player } from "../model/gameObjects/player/Player";
import { Scene } from "../model/gameObjects/scene/Scene";
import { Lobby } from "../model/Lobby";
import { Message } from "../model/messages/Message";
import { Status } from "../model/messages/Status";
import { ensureObject, ensureString, weakEnsureOf, ensureNumber } from "../model/messages/Validators";
import { ClientHandler } from "./ClientHandler";
import { ClientState } from "./ClientState";
import { Command } from "./Command";
import { GameController } from "./GameController";

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
                    const player = new Player(content.username, new Color(content.playerColor));
                    if(game === undefined){
                        throw new ValueError("The requested game doesn't exist");
                    }
                    if(!game.checkPassword(content.password)){
                        throw new ValueError("Wrong password")
                    }
                    if(!game.addPlayer(player)){
                        throw new ValueError("the name you chose has already been taken");
                    }
                    this.clientHandler.send({
                        status : Status.JOIN_GAME,
                        command : Command.CREATE,
                        content : Game.toObject(game)
                    });
                    this.clientHandler.changeState(new GameController(this.lobby, game, player, this.clientHandler));      
                }   
                case Status.LOBBY_UPDATE: {
                    this.clientHandler.send(this.lobby.buildMatchListMessage());
                }
            }
        }catch(e){
            if(e instanceof ValueError){
                this.clientHandler.send({
                    status : Status.ERROR,
                    command : Command.NONE,
                    content : {
                        error : e.message
                    }
                });
            } else if (e instanceof FormatError || e instanceof SyntaxError){
                console.log(`Message parse error: message of type ${message.status} is malformed`)
            }   
        }
        
    }
}