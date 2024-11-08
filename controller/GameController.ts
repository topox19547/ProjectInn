class GameController extends ControllerBase{
    private readonly currentGame : Game;
    private readonly clientPlayer : Player;
    private readonly clientHandler : ClientHandler;

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
                case Status.TOKEN_MOVED:
                case Status.TOKEN_MOVING:{
                    const content = ensureObject({
                        position : Vector2.validate,
                        id : ensureNumber,
                    })(parsedMessage.content);
                    const token : Token = this.getTokenIfAuthorized(content.id, false);
                    const position : Vector2 = new Vector2(content.position.x, content.position.y)
                    if(!this.currentGame.getCurrentScene().isValidPosition(position)){
                        throw new ValueError("Invalid position sent by client");
                    }
                    if(parsedMessage.status == Status.TOKEN_MOVING){
                        token.drag(position, this.clientPlayer.getName());
                    }else{
                        token.endDrag(position, this.clientPlayer.getName());
                    }
                }
                case Status.TOKEN_STAT:{
                    if(parsedMessage.command == Command.SAFE_MODIFY){
                        const content = ensureObject({
                            id : ensureNumber,
                            name : ensureString,
                            stat : Stat.validate
                        })(parsedMessage.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.setStat(content.name, new Stat(content.stat.value, content.stat.min, content.stat.max))){
                            throw new ValueError("The name you've chosen is too long");
                        }
                    }else if(parsedMessage.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber,
                            name : ensureString,
                        })(parsedMessage.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.removeStat(content.name)){
                            throw new ValueError(`Stat ${content.name} doesn't exist`);
                        }
                    }
                }
                case Status.TOKEN_NAME:{
                    const content = ensureObject({
                        name : ensureString,
                        id : ensureNumber,
                    })(parsedMessage.content);
                    const token : Token = this.getTokenIfAuthorized(content.id, false);
                    if(!token.setName(content.name)){
                        throw new ValueError("Invalid name");
                    }
                }
                case Status.TOKEN:{
                    if(!this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS)){
                        new PermissionError();
                    }
                    if(parsedMessage.command == Command.CREATE){
                        const content = Token.validate(parsedMessage.content);
                        const token : Token | undefined = Token.fromObject(content, this.currentGame);
                        if(token === undefined){
                            throw new ValueError("Invalid token parameters detected");
                        }
                        if(!this.currentGame.addToken(token)){
                            throw new ValueError("Unable to add any more tokens");
                        }
                    }else if(parsedMessage.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber
                        })(parsedMessage.content);
                        if(!this.currentGame.removeToken(content.id)){
                            throw new ValueError(`The token with id ${content.id} doesn't exist`);
                        }
                    }
                }
                case Status.TOKEN_OWNERSHIP:{
                    const content = ensureObject({
                        name : ensureString,
                        id : ensureNumber,
                    })(parsedMessage.content);
                    const token : Token = this.getTokenIfAuthorized(content.id, true);
                    if(!this.currentGame.getPlayer(content.name)){
                        throw new ValueError("This player doesn't exist");
                    }
                    if(parsedMessage.command == Command.CREATE){
                        if(!token.addOwner(content.name)){
                            throw new ValueError("This player has already been added");
                        }
                    }else if(parsedMessage.command == Command.DELETE){
                        if(!token.removeOwner(content.name)){
                            throw new ValueError("This player isn't an owner");
                        }
                    }
                }
                case Status.TOKEN_NOTE : {
                    if(parsedMessage.command == Command.SAFE_MODIFY){
                        const content = ensureObject({
                            id : ensureNumber,
                            title : ensureString,
                            note : ensureString
                        })(parsedMessage.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.setNote(content.title, content.note)){
                            throw new ValueError("The note title you've chosen is too long");
                        }
                    }else if(parsedMessage.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber,
                            title : ensureString,
                        })(parsedMessage.content);
                        const token : Token = this.getTokenIfAuthorized(content.id, false);
                        if(!token.removeStat(content.title )){
                            throw new ValueError(`Note ${content.title} doesn't exist`);
                        }
                    }
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
            } else if (e instanceof FormatError || e instanceof SyntaxError){
                console.log(`Message parse error: message of type ${parsedMessage.status} is malformed`)
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

}


