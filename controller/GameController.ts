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
                case Status.CHAT : {
                    const content = ensureObject({
                        text : ensureString
                    })(parsedMessage.content);
                    const chat : Chat = this.currentGame.getChatInstance();
                    chat.handleMessage({
                        text : content.text,
                        sender : this.clientPlayer.getName(),
                        isSystem : false
                    });
                }
                case Status.SCENE_PING : {
                    const content = ensureObject({
                        position : Vector2.validate
                    })(parsedMessage.content)
                    this.currentGame.pingMap(new Vector2(content.position.x, content.position.y))
                }
                case Status.PASSWORD_CHANGE : {
                    const content = ensureObject({
                        password : ensureString
                    })(parsedMessage.content);
                    if(!this.clientPlayer.hasPermission(Permission.MASTER)){
                        throw new PermissionError();
                    }
                    if(!this.currentGame.setPassword(content.password)){
                        throw new ValueError("The password you've chosen is too long");
                    }
                }
                case Status.PERMISSIONS : {
                    const content = ensureObject({
                        name : ensureString,
                        permission : ensureEnumLike(Object.values(Permission).filter(v => typeof v == "number")),
                        value : ensureBoolean
                    })(parsedMessage.content);
                    if(!this.clientPlayer.hasPermission(Permission.MASTER)){
                        throw new PermissionError();
                    }
                    const playerToChange : Player | undefined = this.currentGame.getPlayer(content.name);
                    if(playerToChange === undefined){
                        throw new ValueError("This player doesn't exist")
                    }
                    if(content.name == this.currentGame.getOwnerName()){
                        throw new PermissionError();
                    }
                    if(!playerToChange.hasPermission(Permission.MASTER)){
                        playerToChange.setPermission(content.permission, content.value);
                    } else if (this.clientPlayer.getName() == this.currentGame.getOwnerName()){
                        playerToChange.setPermission(content.permission, content.value);
                    } else {
                        throw new PermissionError();
                    }
                }
                case Status.SCENE : {
                    if(!this.clientPlayer.hasPermission(Permission.MANAGE_SCENES)){
                        throw new PermissionError();
                    }
                    if(parsedMessage.command == Command.CREATE){
                        const content = Scene.validate(parsedMessage.content);
                        const scene : Scene = Scene.fromObject(content);
                        if(!this.currentGame.addScene(scene)){
                            throw new ValueError("There already is a scene with the same name");
                        }
                    }
                    else if(parsedMessage.command == Command.DELETE){
                        const content = ensureObject({
                            id : ensureNumber
                        })(parsedMessage.content);
                        if(!this.currentGame.removeScene(content.id)){
                            throw new ValueError("Could not remove scene");
                        }
                    }
                }
                case Status.SCENE_CHANGE : {
                    const content = ensureObject({
                        id : ensureNumber
                    })(parsedMessage.content);
                    if(!this.clientPlayer.hasPermission(Permission.MASTER)){
                        throw new PermissionError();
                    }
                    if(!this.currentGame.changeScene(content.id)){
                        throw new ValueError("No scene exists with this ID");
                    }
                }
                case Status.SCENE_GRIDTYPE : {
                    const content = ensureObject({
                        gridType : ensureEnumLike(Object.values(GridType).filter(v => typeof v == "number")),
                        id : ensureNumber
                    })(parsedMessage.content);
                    const scene : Scene = this.getSceneIfAuthorized(content.id);
                    scene.setGridType(content.gridType);
                }
                case Status.SCENE_OFFSET : {
                    const content = ensureObject({
                        offset : Vector2.validate,
                        id : ensureNumber
                    })(parsedMessage.content);
                    const scene : Scene = this.getSceneIfAuthorized(content.id);
                    scene.setOffset(new Vector2(content.offset.x, content.offset.y));
                }
                case Status.SCENE_TILESIZE : {
                    const content = ensureObject({
                        tileSize : ensureNumber,
                        id : ensureNumber
                    })(parsedMessage.content);
                    const scene : Scene = this.getSceneIfAuthorized(content.id);
                    scene.setTileSize(content.tileSize);
                }
                case Status.TOKEN_ASSET : {
                    if(!this.clientPlayer.hasPermission(Permission.MANAGE_TOKENS)){
                        throw new PermissionError();
                    }
                    if(parsedMessage.command == Command.CREATE){
                        const content = Asset.validate(parsedMessage.content);
                        if(content.assetType != AssetType.TOKEN){
                            throw new ValueError("Wrong asset type passed");
                        }
                        if(!this.currentGame.addTokenAsset(Asset.fromObject(content))){
                            throw new ValueError("There already is a token asset with the same name");
                        }
                    } else if (parsedMessage.command == Command.DELETE){
                        const content = ensureObject({id : ensureNumber})(parsedMessage.content);
                        if(!this.currentGame.removeTokenAsset(content.id)){
                            throw new ValueError("No token asset exists with this ID")
                        }
                    }
                }
                case Status.ASSET_NAME : {
                    const content = ensureObject({
                        name : ensureString,
                        id : ensureNumber,
                        type : ensureEnumLike(Object.values(AssetType).filter(v => typeof v == "number"))
                    })(parsedMessage.content);
                    const asset : Asset = this.getAssetIfAuthorized(content.id, content.type);
                    if(!asset.setName(content.name)){
                        throw new ValueError("The supplied name is too long")
                    }
                }
                case Status.ASSET_URL : {
                    const content = ensureObject({
                        url : ensureString,
                        id : ensureNumber,
                        type : ensureEnumLike(Object.values(AssetType).filter(v => typeof v == "number"))
                    })(parsedMessage.content);
                    const asset : Asset = this.getAssetIfAuthorized(content.id, content.type);
                    if(!asset.setURL(content.url)){
                        throw new ValueError("The given url is too long")
                    }
                }
                case Status.GAME_END : {
                    if(this.currentGame.getOwnerName() == this.clientPlayer.getName()){
                        this.currentGame.endGame();
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
                console.log(`Message parse error: message is malformed`)
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


