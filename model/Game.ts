class Game{
    private readonly name : string;
    private readonly ownerName : string;
    private readonly players : Array<Player>;
    private readonly tokenAssets : Array<Asset>;
    private readonly scenes : Array<Scene>;
    private readonly tokens : Array<Token>;
    private readonly maxPasswordLength;
    private readonly maxTokens;
    private readonly maxTokenAssets;
    private readonly maxScenes;
    private notifier : ClientNotifier | undefined;
    private currentScene : Scene;
    private password : string | undefined;
    private gameEndCallback : undefined | (() => void);
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
    
    constructor(name : string, ownerName : string, startingScene : Scene){
        this.name = name;
        this.ownerName = ownerName;
        this.players = new Array().concat(ownerName);
        this.tokenAssets = new Array<Asset>;
        this.scenes = new Array<Scene>;
        this.tokens = new Array<Token>;
        this.password = undefined;
        this.currentScene = startingScene;
        this.maxPasswordLength = 64;
        this.gameEndCallback = undefined;
        this.maxTokens = Number.MAX_SAFE_INTEGER;
        this.maxTokenAssets = Number.MAX_SAFE_INTEGER;
        this.maxScenes = Number.MAX_SAFE_INTEGER;
        this.scenes.concat(this.currentScene)
    }

    public static fromObject(object : ReturnType<typeof this.validate>){
        const game : Game = new Game(
            object.name.slice(0,Game.maxNameLength),
            object.owner,
            Scene.fromObject(object.currentScene)
        );
        const notifier = new ClientNotifier()
        for(const player of object.players){
            const newPlayer = Player.fromObject(player);
            newPlayer.setNotifier(notifier);
            if(!game.addPlayer(newPlayer)){
                return undefined;
            }
        }
        for(const scene of object.scenes){
            const newScene = Scene.fromObject(scene);
            newScene.setNotifier(notifier);
            if(!game.addScene(newScene)){
                return undefined;
            }
        }
        for(const asset of object.tokenAssets){
            const newAsset = Asset.fromObject(asset);
            newAsset.setNotifier(notifier);
            if(!game.addTokenAsset(newAsset)){
                return undefined;
            }
        }
        for(const token of object.tokens){
            const restoredToken : Token | undefined = Token.fromObject(token, game);
            restoredToken?.setNotifier(notifier);
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
        game.setNotifier(notifier);
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
    
    public setEndCallback(callback : () => void){
        this.gameEndCallback = callback;
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
    }

    public getName() : string{
        return this.name;
    }

    public getOwnerName() : string{
        return this.ownerName;
    }

    public addPlayer(player : Player) : boolean{
        if(this.players.indexOf(player) != -1){
            return false;
        }
        if(this.players.find(p => p.getName() == player.getName()) !== undefined){
            return false;
        }
        this.players.push(player);
        this.notifier?.notify({
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
        this.notifier?.notify({
            status : MessageType.PLAYER,
            command : Command.DELETE,
            content : Player.toObject(player)})
        return true;
    }

    public getPlayer(playerName : string) : Player | undefined{
        return this.players.find(p => p.getName() == playerName);
    }

    public addTokenAsset(asset : Asset) : boolean{
        if(this.tokenAssets.indexOf(asset) != -1){
            return false;
        }
        if(this.tokenAssets.find(a => a.getID() == asset.getID()) !== undefined){
            return false;
        }
        this.tokenAssets.push(asset);
        this.notifier?.notifyIf({
            status : MessageType.ASSET,
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
        this.notifier?.notify({
            status : MessageType.ASSET,
            command : Command.DELETE,
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
        if(this.tokens.length >= this.maxTokens){
            return false;
        }
        this.addToEntityArray(this.tokens, token, (t) => t.getID(), (t,id) => t.setID(id));
        this.notifier?.notify({
            status : MessageType.TOKEN,
            command : Command.CREATE,
            content : Token.toObject(token)
        });
        //this.tokens.sort((t1,t2) => t1.getID() < t2.getID() ? -1 : t1.getID() == t2.getID() ? 0 : 1);
        return true;
    }

    public removeToken(id : number) : boolean{
        const tokenIndex : number = this.tokens.findIndex(t => t.getID() == id);
        if(tokenIndex == -1){
            return false;
        }
        this.tokens.splice(tokenIndex, 1);
        this.notifier?.notify({
            status : MessageType.TOKEN,
            command : Command.DELETE,
            content : id
        });
        return true;
    }

    public getToken(tokenId : number) : Token | undefined{
        return this.tokens.find(t => t.getID() == tokenId);
    }

    private getNextTokenId() : number{
        for(let i = 0; i < this.maxTokens; i++){
            if(this.tokens[i] == undefined){
                return i;
            }
        }
        return -1;
    }

    public addScene(scene : Scene) : boolean{
        if(this.scenes.indexOf(scene) != -1 || 
        this.scenes.find(s => s.getAsset().getName() == scene.getAsset().getName())){
            return false;
        }
        this.scenes.push(scene);
        this.notifier?.notify({
            status : MessageType.SCENE,
            command : Command.CREATE,
            content : Scene.toObject(scene)
        });
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
        this.notifier?.notify({
            status : MessageType.SCENE,
            command : Command.DELETE,
            content : Scene.toObject(scene)
        });
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
        this.notifier?.notify({
            status : MessageType.SCENE_CHANGED,
            command : Command.MODIFY,
            content : Scene.toObject(scene)
        });
    }

    public checkPassword(attempt : string | undefined) : boolean{
        return this.password === undefined || attempt === this.password;
    }

    public setPassword(password : string) : boolean{
        if(password.length > this.maxPasswordLength){
            return false;
        }
        this.password = password;
        this.notifier?.notifyIf({
            status : MessageType.PASSWORD_CHANGED,
            command : Command.MODIFY,
            content : password
        }, p => p.hasPermission(Permission.MASTER));
        return true;
    }

    public endGame() : void{
        if(this.gameEndCallback !== undefined){
            this.gameEndCallback();
        }
        this.notifier?.notify(
            {
                status : MessageType.GAME_END,
                command : Command.DELETE,
                content : {}
            }
        );
    }

    private addToEntityArray<T>(
        array : Array<T>,
        object : T,
        getIdOf : (object : T) => number,
        setIdOf : (object : T, id : number) => void ) : void{
        let prev : number = -1;
        let prevId : number = -1;
        for(const [index, t] of array.entries()){
            if(getIdOf(t) - prevId > 1){
                array.splice(prev + 1, 0, object);
                setIdOf(object, prevId + 1)
                return;
            }
            prev = index;
            prevId = getIdOf(t);
        }
        array.push(object);
        setIdOf(object, prevId + 1)
    }
}