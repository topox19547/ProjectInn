class Asset{
    private assetURL : string | undefined;
    private assetSize : Vector2 | undefined;
    private name : string;
    private readonly assetID : number;
    private readonly notifier : ClientNotifier | undefined;
    private static readonly maxNameLength: number = 24;

    constructor(assetID : number, name : string, notifier? : ClientNotifier){
        this.assetID = assetID;
        this.name = name;
        this.assetURL = undefined;
        this.assetSize = undefined;
        this.notifier = notifier;
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
    public setName(name : string) : boolean{
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