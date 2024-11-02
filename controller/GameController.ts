class GameController extends ControllerBase{
    private readonly currentGame : Game;
    private readonly clientPlayer : Player;
    protected readonly clientHandler : ClientHandler;

    constructor(currentGame : Game, clientPlayer : Player, clientHandler : ClientHandler){
        super();
        this.currentGame = currentGame;
        this.clientPlayer = clientPlayer;
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
                case MessageType.TOKEN_MOVED:
                case MessageType.TOKEN_MOVING:{
                    const content = ensureObject({
                        position : Vector2.validate,
                        id : ensureNumber,
                    })(parsedMessage.content);
                    const token : Token | undefined = this.currentGame.getTokens().find(t => t.getID() == content.id);
                    if(token === undefined){
                        this.sendError("Invalid token ID");
                        return;
                    }
                    const hasPermission : boolean = (
                        this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS) ||
                        token.isOwner(this.clientPlayer.getName())
                    );
                    if(!hasPermission){
                        this.sendError("You don't have the permission to move this token");
                        return;
                    }
                    const position : Vector2 = new Vector2(content.position.x, content.position.y)
                    if(!this.currentGame.getCurrentScene().isValidPosition(position)){
                        this.sendError("Invalid position sent by client");
                        return;
                    }
                    if(parsedMessage.status == MessageType.TOKEN_MOVING){
                        token.drag(position, this.clientPlayer.getName());
                    }
                    else{
                        token.endDrag(position, this.clientPlayer.getName());
                    }
                }
                case MessageType.TOKEN:{
                    const hasPermission : boolean = this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS);
                    if(!hasPermission){
                        this.sendError("You don't have the permission to create/delete Tokens");
                        return;
                    }
                    switch (parsedMessage.command){
                        case Command.CREATE:{
                            const content = Token.validate(parsedMessage.content);
                            const token : Token | undefined = Token.fromObject(content, this.currentGame);
                            if(token === undefined){
                                this.sendError("Invalid token parameters detected");
                                return;
                            }
                            this.currentGame.addToken(token);
                        }
                        case Command.DELETE:{
                            const content = ensureObject({
                                id : ensureNumber
                            })(parsedMessage.content);
                            if(!this.currentGame.removeToken(content.id)){
                                this.sendError(`The token with id ${content.id} doesn't exist`);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }

    


}