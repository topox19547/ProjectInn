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
                    const token : Token | undefined = this.getTokenIfAuthorized(content.id, false);
                    if(token === undefined) return;
                    const position : Vector2 = new Vector2(content.position.x, content.position.y)
                    if(!this.currentGame.getCurrentScene().isValidPosition(position)){
                        this.sendError("Invalid position sent by client");
                        return;
                    }
                    if(parsedMessage.status == MessageType.TOKEN_MOVING){
                        token.drag(position, this.clientPlayer.getName());
                    }else{
                        token.endDrag(position, this.clientPlayer.getName());
                    }
                }
                case MessageType.TOKEN_STAT:{
                    
                }
                case MessageType.TOKEN_NAME:{
                    const content = ensureObject({
                        name : ensureString,
                        id : ensureNumber,
                    })(parsedMessage.content);
                    const token : Token | undefined = this.getTokenIfAuthorized(content.id, false);
                    if(token === undefined) return;
                    if(!token.setName(content.name)){
                        this.sendError("Invalid name!");
                        return;
                    }
                }
                case MessageType.TOKEN:{
                    if(!this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS)){
                        this.sendError("You don't have the permission to create/delete Tokens");
                        return;
                    }
                    if(parsedMessage.command == Command.CREATE){
                        const content = Token.validate(parsedMessage.content);
                        const token : Token | undefined = Token.fromObject(content, this.currentGame);
                        if(token === undefined){
                            this.sendError("Invalid token parameters detected");
                            return;
                        }
                        this.currentGame.addToken(token);
                    }else if(parsedMessage.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber
                        })(parsedMessage.content);
                        if(!this.currentGame.removeToken(content.id)){
                            this.sendError(`The token with id ${content.id} doesn't exist`);
                            return;
                        }
                    }
                }
                case MessageType.TOKEN_OWNERSHIP:{
                    const content = ensureObject({
                        name : ensureString,
                        id : ensureNumber,
                    })(parsedMessage.content);
                    const token : Token | undefined = this.getTokenIfAuthorized(content.id, true);
                    if(token === undefined) return;
                    if(!this.currentGame.getPlayer(content.name)){
                        this.sendError("This player doesn't exist");
                        return;
                    }
                    if(parsedMessage.command == Command.CREATE){
                        if(!token.addOwner(content.name)){
                            this.sendError("This player has already been added");
                            return;
                        }
                    }else if(parsedMessage.command == Command.DELETE){
                        if(!token.removeOwner(content.name)){
                            this.sendError("This player isn't an owner");
                            return;
                        }
                    }
                }
            }
        }
        catch (e){
            console.log(`Message parse error: message of type ${parsedMessage.status} is malformed`)
        }
    }


    private getTokenIfAuthorized(id : number, ignoreOwnership : boolean) : Token | undefined{
        const token : Token | undefined = this.currentGame.getToken(id);
        if(token === undefined){
            this.sendError("Invalid token ID");
            return;
        }
        if(!ignoreOwnership && token.isOwner(this.clientPlayer)){
            return token;
        }
        if(this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS)){
            return token;
        }
        this.sendError("You don't have the permission to modify this Token");
        return;
    }

    


}