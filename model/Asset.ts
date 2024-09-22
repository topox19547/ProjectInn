class Asset{
    private assetURL : string;
    private readonly name : string;

    constructor(name : string, assetURL: string){
        this.name = name;
        this.assetURL = assetURL;
    }

    public getURL() : string{
        return this.assetURL;
    }

    public getName() : string{
        return this.name;
    }

    public setURL(url : string) : void{
        this.assetURL = url;
    }
}