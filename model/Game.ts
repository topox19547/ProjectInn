class Game{
    private readonly name : string;
    private readonly ownerName : string;
    private readonly players : Array<Player>;
    private readonly tokenAssets : Array<Asset>;
    private readonly scenes : Array<Scene>;
    private readonly tokens : Array<Token>;
    private readonly maxPasswordLength;
    private readonly clientNotifier : ClientNotifier | undefined;
    private currentScene : Scene;
    private password : string | undefined;
    private static maxNameLength : number = 24;
    public static validate = ensureObject({
        name : ensureString,
        owner : ensureString,
        players : ensureArrayOf(Player.validate),
        scenes : ensureArrayOf(Scene.validate),
        tokenAssets : ensureArrayOf(Asset.validate),
        tokens : ensureArrayOf(Token.validate),
        currentScene : Scene.validate,
        password : weakEnsureOf(ensureString)
    });
    
    constructor(name : string, ownerName : string, startingScene : Scene, clientNotifier? : ClientNotifier){
        this.name = name;
        this.ownerName = ownerName;
        this.players = new Array().concat(ownerName);
        this.tokenAssets = new Array<Asset>;
        this.scenes = new Array<Scene>;
        this.tokens = new Array<Token>;
        this.password = undefined;
        this.currentScene = startingScene;
        this.maxPasswordLength = 64;
        this.clientNotifier = clientNotifier;
        this.scenes.concat(this.currentScene)
    }

    public static fromObject(object : ReturnType<typeof this.validate>){
        const game : Game = new Game(
            object.name.slice(0,Game.maxNameLength),
            object.owner,
            Scene.fromObject(object.currentScene));
        for(const player of object.players){
            if(!game.addPlayer(Player.fromObject(player))){
                return undefined;
            }
        }
        for(const scene of object.scenes){
            if(!game.addScene(Scene.fromObject(scene))){
                return undefined;
            }
        }
        for(const asset of object.tokenAssets){
            if(!game.addTokenAsset(Asset.fromObject(asset))){
                return undefined;
            }
        }
        for(const token of object.tokens){
            const restoredToken : Token | undefined = Token.fromObject(token, game);
            if(restoredToken === undefined){
                return undefined;
            }
            if(!game.addToken(restoredToken)){
                return undefined;
            }
        }
        if(object.password !== undefined && !game.setPassword(object.password)){
            return undefined;
        }
        return game;
    }

    public static toObject(game : Game){
        return {
            name : game.name,
            ownerName : game.ownerName,
            players : game.players.map(p => Player.toObject(p)),
            tokenAssets : game.tokenAssets.map(a => Asset.toObject(a)),
            scenes : game.scenes.map(s => Scene.toObject(s)),
            tokens : game.tokens.map(t => Token.toObject(t)),
            password : game.password,
            currentScene : Scene.toObject(game.currentScene)
        };
    }

    public static getMaxNameLength(){
        return this.maxNameLength;
    }

    public getName() : string{
        return this.name;
    }

    public getOwnerName() : string{
        return this.ownerName;
    }

    public addPlayer(player : Player) : boolean{
        if(this.players.indexOf(player) != -1 || this.players.find(p => p.getName() == player.getName())){
            return false;
        }
        this.players.push(player);
        this.clientNotifier?.notify({
            status : MessageType.PLAYER,
            command : Command.CREATE,
            content : Player.toObject(player)})
        return true;
    }

    public removePlayer(player : Player) : boolean{
        const playerIndex : number = this.players.indexOf(player);
        if(playerIndex == -1){
            return false;
        }
        this.players.splice(playerIndex, 1);
        this.clientNotifier?.notify({
            status : MessageType.PLAYER,
            command : Command.DELETE,
            content : Player.toObject(player)})
        return true;
    }

    public getPlayers() : Array<Player>{
        return [...this.players];
    }

    public addTokenAsset(asset : Asset) : boolean{
        if(this.tokenAssets.indexOf(asset) != -1 || this.tokenAssets.find(a => a.getName() == asset.getName())){
            return false;
        }
        this.tokenAssets.push(asset);
        this.clientNotifier?.notifyIf({
            status : MessageType.TOKEN_ASSET,
            command : Command.CREATE,
            content : Asset.toObject(asset)}, (p) => p.hasPermission(Permission.MANAGE_TOKENS))
        return true;
    }

    public removeTokenAsset(asset : Asset) : boolean{
        const assetIndex : number = this.tokenAssets.indexOf(asset);
        for(let i = this.tokens.length - 1; i >= 0; i--){
            if (this.tokens[i].getAsset() == asset){
                this.tokens.splice(i,1);
            }
        }
        if(!(this.tokenAssets.splice(assetIndex, 1).length >= 1)){
            return false
        }
        this.clientNotifier?.notify({
            status : MessageType.TOKEN_ASSET,
            command : Command.CREATE,
            content : Asset.toObject(asset)})
        return true;
    }

    public getTokenAssets() : Array<Asset>{
        return [...this.tokenAssets];
    }

    public addToken(token : Token) : boolean{
        if(this.tokens.indexOf(token) != -1){
            return false;
        }
        this.tokens.push(token)
        return true;
    }

    public removeToken(token : Token) : boolean{
        const tokenIndex : number = this.tokens.indexOf(token);
        if(tokenIndex == -1){
            return false;
        }
        this.tokens.splice(tokenIndex, 1);
        return true;
    }

    public getTokens() : Array<Token>{
        return [... this.tokens]
    }

    public addScene(scene : Scene) : boolean{
        if(this.scenes.indexOf(scene) != -1 || 
        this.scenes.find(s => s.getAsset().getName() == scene.getAsset().getName())){
            return false;
        }
        this.scenes.push(scene);
        return true;
    }

    public removeScene(scene : Scene) : boolean{
        const sceneIndex : number = this.scenes.indexOf(scene);
        if(sceneIndex == -1){
            return false;
        }
        if(this.scenes.length <= 1){
            return false;
        }
        this.scenes.splice(sceneIndex, 1);
        return true;
    }

    public getScenes() : Array<Scene>{
        return [... this.scenes];
    }

    public getCurrentScene() : Scene{
        return this.currentScene;
    }

    public changeScene(scene : Scene) : void{
        this.currentScene = scene;
    }

    public checkPassword(attempt : string) : boolean{
        return this.password == undefined || attempt == this.password;
    }

    public setPassword(password : string) : boolean{
        if(password.length > this.maxPasswordLength){
            return false;
        }
        this.password = password;
        return true;
    }
}