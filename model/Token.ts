class Token{
    private name : string;
    private readonly asset : Asset;
    private readonly id : number;
    private readonly owners : Array<string>;
    private readonly notes : Map<string,string>;
    private readonly stats : Map<string, Stat>;
    private readonly position : Vector2;
    private readonly maxNameLength: number;
    private readonly maxNoteLength : number;

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

    public getAsset() : Asset{
        return this.asset;
    }

    public getId() : number{
        return this.id;
    }

    public getName() : string{
        return this.name;
    }

    public setName(name : string) : void{
        this.name = name;
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