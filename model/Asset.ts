class Asset{
    private assetURL : string | undefined;
    private assetSize : Vector2 | undefined;
    private name : string;
    private readonly assetID : number;
    private readonly notifier : ClientNotifier | undefined;
    private static readonly maxNameLength: number = 24;
    public static readonly validate = ensureObject({
        assetID : ensureNumber,
        assetURL : weakEnsureOf(ensureString),
        assetSize : weakEnsureOf(Vector2.validate),
        name : ensureString
    })

    constructor(assetID : number, name : string, notifier? : ClientNotifier){
        this.assetID = assetID;
        this.name = name;
        this.assetURL = undefined;
        this.assetSize = undefined;
        this.notifier = notifier;
    }

    public static fromObject(object : ReturnType<typeof this.validate>) : Asset{
        const asset : Asset = new Asset(object.assetID, object.name.slice(0,Asset.maxNameLength));
        if(object.assetURL === undefined){
            if(object.assetSize !== undefined){
                asset.assetSize = new Vector2(object.assetSize.x, object.assetSize.y);
            }
            return asset;
        }
        asset.setURL(object.assetURL, false); //TODO: change isInUse depending on what we need here
        return asset;
    }

    public static toObject(asset : Asset) : ReturnType<typeof this.validate>{
        return {
            assetURL : asset.assetURL,
            assetID : asset.assetID,
            assetSize : asset.assetSize !== undefined ? Vector2.toObject(asset.assetSize) : undefined,
            name : asset.name
        }
    }

    public static getMaxNameLength() : number{
        return this.maxNameLength;
    }

    public getURL() : string | undefined{
        return this.assetURL;
    }

    public getSize() : Vector2 | undefined{
        return this.assetSize;
    }

    public getName() : string{
        return this.name;
    }

    public getID() : number{
        return this.assetID;
    }

    //TODO: ADD CHECK FOR NAME UNIQUENESS ON THE CONTROLLER'S SIDE
    public setName(name : string, isInUse : boolean) : boolean{
        if(name.length <= Asset.maxNameLength){
            this.name = name;
            return true;
        }
        return false;
    }

    public setURL(url : string, isInUse : boolean) : void{
        const image : HTMLImageElement = new HTMLImageElement()
        image.src = url;
        //This could potentially be removed in the future and the client could supply its own dimensions
        //if it starts becoming a performance bottleneck
        image.decode().then(() => {
            this.assetURL = url;
            this.assetSize = new Vector2(image.width, image.height);
        }).catch(() => {
            //Notify the user that the URL isn't valid
        })
    }
}