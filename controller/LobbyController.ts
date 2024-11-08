class LobbyController extends ControllerBase{
    private readonly lobby : Lobby;
    private readonly clientHandler : ClientHandler;

    constructor(lobby : Lobby, clientHandler : ClientHandler){
        super();
        this.lobby = lobby;
        this.clientHandler = clientHandler;
    }

    public handleMessage(message : string): void {
        let parsedMessage : Message;
        try{
            parsedMessage = this.validateMessage(JSON.parse(message));
        }catch(e){
            console.log("JSON parse error or malformed shape on inbound message: " + e);
            return;
        }
        try{
            switch(parsedMessage.status){
                case Status.CREATE_GAME:{
                    const content = ensureObject({
                        username : ensureString,
                        playerColor : ensureString,
                        gameName : ensureString,
                        password : weakEnsureOf(ensureString),
                        scene : Scene.validate
                    })(parsedMessage.content);
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
                    this.clientHandler.changeState(new GameController(game, player, this.clientHandler));
                }
                case Status.JOIN_GAME:{
                    const content = ensureObject({
                        gameId : ensureNumber,
                        username : ensureString,
                        playerColor : ensureString,
                        password : weakEnsureOf(ensureString),
                    })(parsedMessage.content);
                    const games = this.lobby.getRunningGames();
                    const game = games.get(content.gameId);
                    const player = new Player(content.username, new Color(content.playerColor));
                    if(game === undefined){
                        throw new ValueError("The requested game doesn't exist");
                    }
                    if(!game.checkPassword(content.password)){
                        throw new ValueError("Wrong password")
                        return;
                    }
                    if(!game.addPlayer(player)){
                        throw new ValueError("the name you chose has already been taken");
                        return;
                    }
                    this.clientHandler.send({
                        status : Status.JOIN_GAME,
                        command : Command.CREATE,
                        content : Game.toObject(game)
                    });
                    this.clientHandler.changeState(new GameController(game, player, this.clientHandler));      
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
                console.log(`Message parse error: message of type ${parsedMessage.status} is malformed`)
            }   
        }
        
    }
}