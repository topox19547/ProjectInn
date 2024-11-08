class Game implements NotificationSource{
    private readonly name : string;
    private readonly ownerName : string;
    private readonly players : Array<Player>;
    private readonly tokenAssets : Array<Asset>;
    private readonly scenes : Array<Scene>;
    private readonly tokens : Array<Token>;
    private readonly chat : Chat;
    private readonly maxPasswordLength : number;
    private readonly maxTokens : number;
    private readonly maxTokenAssets : number;
    private readonly maxScenes : number;
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
        this.chat = new Chat();
        this.chat.addCommand(new Dice()).addCommand(new Help(this.chat))
        this.maxTokens = Number.MAX_SAFE_INTEGER;
        this.maxTokenAssets = Number.MAX_SAFE_INTEGER;
        this.maxScenes = Number.MAX_SAFE_INTEGER;
        this.scenes.concat(this.currentScene)
    }

    public static fromObject(object : ReturnType<typeof this.validate>) : Game | undefined{
        const game : Game = new Game(
            object.name.slice(0,Game.maxNameLength),
            object.owner,
            Scene.fromObject(object.currentScene)
        );
        const notifier = new ClientNotifier();
        const sortById = (t1 : Identifiable,t2 : Identifiable) => {
            return t1.getID() < t2.getID() ? -1 : t1.getID() == t2.getID() ? 0 : 1
        };
        const restoreEntityArray = <T extends NotificationSource & Identifiable,K>(
            source : Array<K>,
            dest : Array<Identifiable & NotificationSource>,
            restoreMethod : (object : K) => T | undefined,
            maxEntities : number) : boolean => {
                if(source.length > maxEntities){
                    return false;
                }
                for(const obj of source){
                    const restored : T | undefined = restoreMethod(obj);
                    restored?.setNotifier(notifier);
                    if(restored === undefined){
                        return false;
                    }
                    dest.push(restored)
                }
                dest.sort(sortById);
                if(dest.some(e1 => dest.some(e2 => e1.getID() == e2.getID()))){ //Could be optimized by using binary search
                    return false;
                }
                return true;
        }
        for(const player of object.players){
            const newPlayer = Player.fromObject(player);
            newPlayer.setNotifier(notifier);
            if(!game.addPlayer(newPlayer)){
                return undefined;
            }
        }
        if(object.scenes.length >= game.maxScenes){
            return undefined;
        }
        if(!restoreEntityArray(object.scenes, game.scenes, Scene.fromObject, game.maxScenes)){
            return undefined;
        }
        if(!restoreEntityArray(object.tokenAssets, game.tokenAssets, Asset.fromObject, game.maxTokenAssets)){
            return undefined;
        }
        if(!restoreEntityArray(object.tokens, game.tokens, (t) => Token.fromObject(t,game), game.maxTokens)){
            return undefined;
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
        if(this.players.find(p => p.getName() == player.getName()) !== undefined){
            return false;
        }
        this.players.push(player);
        this.notifier?.notify({
            status : Status.PLAYER,
            command : Command.CREATE,
            content : Player.toObject(player)})
        return true;
    }

    public joinGame(player : Player, handler : ClientHandler) : boolean{
        if(!this.getPlayer(player.getName())){
            return false;
        }
        this.notifier?.subscribe(handler);
        this.notifier?.notify({
            status : Status.CLIENT_STATUS,
            command : Command.CREATE,
            content : {
                name : player.getName()
            }
        })
        return true
    }

    public leaveGame(player : Player, handler : ClientHandler) : boolean{
        if(!this.getPlayer(player.getName())){
            return false;
        }
        this.notifier?.unsubscribe(handler);
        this.notifier?.notify({
            status : Status.CLIENT_STATUS,
            command : Command.DELETE,
            content : {
                name : player.getName()
            }
        })
        return true;
    }

    public removePlayer(player : Player) : boolean{
        const playerIndex : number = this.players.indexOf(player);
        if(playerIndex == -1){
            return false;
        }
        this.players.splice(playerIndex, 1);
        this.notifier?.notify({
            status : Status.PLAYER,
            command : Command.DELETE,
            content : {
                name : player.getName()
            }
        })
        return true;
    }

    public getPlayer(playerName : string) : Player | undefined{
        return this.players.find(p => p.getName() == playerName);
    }

    public addTokenAsset(asset : Asset) : boolean{
        if(this.tokenAssets.findIndex(a => a.getName() == asset.getName()) == -1){
            return false;
        }
        this.tokenAssets.push(asset);
        this.notifier?.notifyIf({
            status : Status.ASSET,
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
            status : Status.ASSET,
            command : Command.DELETE,
            content : Asset.toObject(asset)})
        return true;
    }

    public getTokenAssets() : Array<Asset>{
        return [...this.tokenAssets];
    }

    public addToken(token : Token) : boolean{
        if(this.tokens.length >= this.maxTokens){
            return false;
        }
        this.addToEntityArray(this.tokens, token);
        this.notifier?.notify({
            status : Status.TOKEN,
            command : Command.CREATE,
            content : Token.toObject(token)
        });
        //this.tokens.sort();
        return true;
    }

    public removeToken(id : number) : boolean{
        const tokenIndex : number = this.tokens.findIndex(t => t.getID() == id);
        if(tokenIndex == -1){
            return false;
        }
        this.tokens.splice(tokenIndex, 1);
        this.notifier?.notify({
            status : Status.TOKEN,
            command : Command.DELETE,
            content : {
                id : id
            }
        });
        return true;
    }

    public getToken(tokenId : number) : Token | undefined{
        return this.tokens.find(t => t.getID() == tokenId);
    }

    public addScene(scene : Scene) : boolean{
        if(this.scenes.find(s => s.getAsset().getName() == scene.getAsset().getName())){
            return false;
        }
        this.scenes.push(scene);
        this.notifier?.notify({
            status : Status.SCENE,
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
            status : Status.SCENE,
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
            status : Status.SCENE_CHANGED,
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
            status : Status.PASSWORD_CHANGED,
            command : Command.MODIFY,
            content : {
                password : password
            }
        }, p => p.hasPermission(Permission.MASTER));
        return true;
    }

    public endGame() : void{
        if(this.gameEndCallback !== undefined){
            this.gameEndCallback();
        }
        this.notifier?.notify(
            {
                status : Status.GAME_END,
                command : Command.DELETE,
                content : {}
            }
        );
    }

    public getChatInstance() : Chat{
        return this.chat;
    }

    public pingMap(position : Vector2) : void{
        this.notifier?.notify({
            status : Status.PING,
            command : Command.CREATE,
            content : {
                position : position
            }
        })
    }

    private addToEntityArray(array : Array<Identifiable>, object : Identifiable){
        let prev : number = -1;
        let prevId : number = -1;
        for(const [index, t] of array.entries()){
            if(t.getID() - prevId > 1){
                array.splice(prev + 1, 0, object);
                object.setID(prevId + 1)
                return;
            }
            prev = index;
            prevId = t.getID();
        }
        array.push(object);
        object.setID(prevId + 1)
    }

    //TODO:ID MUST BE PRESERVED ACROSS SESSIONS, SO ADDTOKEN CAN'T ASSIGN IDs INDEPENDENTLY
}