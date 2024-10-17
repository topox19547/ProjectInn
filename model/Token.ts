class Token{
    private name : string;
    private readonly asset : Asset;
    private readonly id : number;
    private readonly owners : Array<string>;
    private readonly notes : Map<string, string>;
    private readonly stats : Map<string, Stat>;
    private readonly position : Vector2;
    private readonly maxNameLength: number;
    private readonly maxNoteLength : number;
    public static readonly validate = ensureObject({
        name : ensureString,
        id : ensureNumber,
        assetID : ensureNumber,
        owners : ensureArrayOf(ensureString),
        notes : ensureMapObject(ensureString),
        stats : ensureMapObject(Stat.validate),
        position : Vector2.validate
    });

    constructor(asset : Asset, id : number){
        this.asset = asset;
        this.id = id;
        this.name = asset.getName();
        this.owners = new Array<string>;
        this.notes = new Map<string,string>;
        this.stats = new Map<string,Stat>;
        this.position = new Vector2(0,0);
        this.maxNoteLength = 128;
        this.maxNameLength = 24;
    }

    public static fromObject(object: ReturnType<typeof this.validate>, gameContext : Game): Token | undefined {
        const asset : Asset | undefined = gameContext.getTokenAssets().find(a => a.getID() == object.id);
        if(asset == undefined){
            return undefined
        }
        const token : Token = new Token(asset, object.id);
        if (!token.setName(object.name)){
            return undefined
        }
        for (const owner in object.owners){
            if(!token.addOwner(owner) || gameContext.getPlayers().findIndex(p => p.getName() == owner) == -1){
                return undefined
            }
        }
        for (const key in object.notes){
            const value = object.notes.key
            if(!token.setNote(key,value)){
                return undefined
            }
        }
        for (const key in object.stats){
            const value = object.stats.key
            if(!token.setStat(key,new Stat(value.value, value.min, value.max))){
                return undefined
            }
        }
        const position = new Vector2(object.position.x, object.position.y);
        if(!gameContext.getCurrentScene().isValidPosition(position)){
            position.setX(0);
            position.setY(0);
        }
        token.setPosition(position);
        return token;
    }

    public static toObject(token : Token) : ReturnType<typeof this.validate>{
        const statsObject : Record<string,ReturnType<typeof Stat.toObject>> = {};
        const notesObject : Record<string,string> = {};
        token.stats.forEach((v,k) => statsObject[k] = Stat.toObject(v));
        token.notes.forEach((v,k) => notesObject[k] = v);
        return {
            name : token.name,
            id : token.id,
            assetID : token.asset.getID(),
            owners : [...token.owners],
            notes : notesObject,
            stats : statsObject,
            position : Vector2.toObject(token.position)
        }
    }

    public getAsset() : Asset{
        return this.asset;
    }

    public getId() : number{
        return this.id;
    }

    public getName() : string{
        return this.name;
    }

    public setName(name : string) : boolean{
        if (name.length > this.maxNameLength){
            return false
        }
        this.name = name;
        return true;
    }

    public isOwner(name : string) : boolean{
        return this.owners.indexOf(name) != -1;
    }

    public addOwner(name : string) : boolean{
        if(this.owners.indexOf(name) != -1){
            return false;
        }
        this.owners.concat(name);
        return true;
    }

    public removeOwner(name : string) : boolean{
        const indexToRemove : number = this.owners.indexOf(name); 
        if(indexToRemove != -1){
            return false;
        }
        this.owners.splice(indexToRemove, 1);
        return true;
    }

    public getNotes() : Map<string,string>{
        return new Map(this.notes);
    }

    public setNote(title : string, note : string) : boolean{
        if (title.length > this.maxNameLength || note.length > this.maxNoteLength){
            return false;
        }
        this.notes.set(title, note);
        return true;
    }

    public removeNote(title : string) : boolean{
        return this.notes.delete(title);
    }

    public getStats() : Map<string, Stat>{
        return new Map(this.stats);
    }

    public setStat(name : string, stat : Stat) : boolean{
        if(name.length > this.maxNameLength){
            return false;
        }
        this.stats.set(name, stat);
        return true;
    }

    public removeStat(name : string) : boolean{
        return this.stats.delete(name);
    }

    public setPosition(position : Vector2) : void{
        this.position.setTo(position);
    }

    public getPosition() : Vector2{
        return this.position;
    }
}