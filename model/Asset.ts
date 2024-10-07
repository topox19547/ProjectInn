class Asset{
    private assetURL : string | undefined;
    private assetSize : Vector2 | undefined;
    private readonly name : string;

    constructor(name : string){
        this.name = name;
        this.assetURL = undefined;
        this.assetSize = undefined;
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

    public setURL(url : string) : void{
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