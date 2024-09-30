class Game{
    private readonly name : string;
    private readonly ownerName : string;
    private readonly players : Array<Player>;
    private readonly tokenAssets : Array<Asset>;
    private readonly scenes : Array<Scene>;
    private readonly tokens : Array<Token>;

    constructor(name : string, owner : Player){
        this.name = name;
        this.ownerName = owner.getName();
        this.players = new Array().concat(owner);
        this.tokenAssets = new Array<Asset>;
        this.scenes = new Array<Scene>;
        this.tokens = new Array<Token>;
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
        return true;
    }

    public removePlayer(player : Player) : boolean{
        const playerIndex : number = this.players.indexOf(player);
        if(playerIndex == -1){
            return false;
        }
        this.players.splice(playerIndex, 1);
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
        return true;
    }

    public removeTokenAsset(asset : Asset) : boolean{
        const assetIndex : number = this.tokenAssets.indexOf(asset);
        for(let i = this.tokens.length - 1; i >= 0; i--){
            if (this.tokens[i].getAsset() == asset){
                this.tokens.splice(i,1);
            }
        }
        return this.players.splice(assetIndex, 1).length >= 1;
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
        this.scenes.splice(sceneIndex, 1);
        return true;
    }

    public getScenes() : Array<Scene>{
        return [... this.scenes];
    }

}