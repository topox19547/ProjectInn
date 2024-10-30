class LobbyController extends ControllerBase{
    private readonly lobby : Lobby;
    protected readonly clientHandler : ClientHandler;

    constructor(lobby : Lobby, clientHandler : ClientHandler){
        super();
        this.lobby = lobby;
        this.clientHandler = clientHandler;
    }

    public handleMessage(message : string): void {
        let parsedMessage : Message;
        const validateMessage : (object : unknown) => Message = ensureObject({
            status : ensureNumber,
            command : ensureNumber,
            content : ignore
        })
        try{
            parsedMessage = validateMessage(JSON.parse(message));
        }catch(e){
            console.log("JSON parse error or malformed shape on inbound message: " + e);
            return;
        }
        try{
            switch(parsedMessage.status){
                case MessageType.CREATE_GAME:{
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
                            this.sendError("Error when setting the game's password");
                            return;
                        }
                    }
                    this.lobby.publishGame(game);
                    this.clientHandler.changeState(new GameController(game, player, this.clientHandler));
                }
                case MessageType.JOIN_GAME:{
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
                        this.sendError("The requested game doesn't exist");
                        return;
                    }
                    if(!game.checkPassword(content.password)){
                        this.sendError("wrong password!")
                        return;
                    }
                    if(!game.addPlayer(player)){
                        this.sendError("the name you chose has already been taken");
                        return;
                    }
                    this.clientHandler.changeState(new GameController(game, player, this.clientHandler));         
                }   
            }
        }catch(e){
            console.log("Message parse error: message of type " + parsedMessage.status + " is malformed")
        }
        
    }
}