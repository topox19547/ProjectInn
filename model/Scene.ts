
class Scene{
    private readonly asset : Asset;
    private gridType : GridType;
    private offset : Vector2;
    private tileSize : number;
    private notifier : ClientNotifier | undefined;
    private static readonly maxTileSize : number = 1000;
    private static readonly minTileSize : number = 30;
    public static readonly validate = ensureObject({
        asset : Asset.validate,
        gridType : ensureNumber,
        offset : Vector2.validate,
        tileSize : ensureNumber,
    })

    //Remember to always check if the asset's image can be loaded before using it in the constructor
    constructor(asset : Asset, grid : GridType, offset : Vector2, tileSize : number){
        this.asset = asset;
        this.gridType = grid;
        this.tileSize = tileSize;
        this.offset = new Vector2(this.tileSize % offset.getX(), this.tileSize % offset.getY());
    }
    
    public static getMaxTileSize() : number{ return this.maxTileSize; }
    
    public static getMinTileSize() : number{ return this.minTileSize; }

    public static fromObject(object : ReturnType<typeof Scene.validate>) : Scene{
        return new Scene(
            Asset.fromObject(object.asset),
            object.gridType,
            new Vector2(object.offset.x, object.offset.y),
            object.tileSize);
    }

    public static toObject(scene : Scene) : ReturnType<typeof Scene.validate>{
        return {
            asset : Asset.toObject(scene.asset),
            gridType : scene.gridType,
            offset : Vector2.toObject(scene.offset),
            tileSize : scene.tileSize
        };
    }

    public getAsset() : Asset{
        return this.asset;
    }

    public getGridType() : GridType{
        return this.gridType;
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
    }

    public setGridType(gridType : GridType) : void{
        this.gridType = gridType;
        this.sendNotification(MessageType.SCENE_GRIDTYPE, this.gridType);
    }

    public getOffset() :Vector2{
        return this.offset;
    }

    public setOffset(offset : Vector2) : void{
        this.offset = new Vector2(this.tileSize % offset.getX(), this.tileSize % offset.getY());
        this.sendNotification(MessageType.SCENE_OFFSET, this.offset);
    }

    public getTileSize() : number{
        return this.tileSize;
    }

    public setTileSize(tileSize : number) : void{
        if(tileSize > Scene.maxTileSize){
            this.tileSize = Scene.maxTileSize;
        } else if(tileSize < Scene.minTileSize){
            this.tileSize = Scene.minTileSize;
        } else {
            this.tileSize = tileSize;
        }
        this.sendNotification(MessageType.SCENE_TILESIZE, this.tileSize);
    }

    public isValidPosition(position : Vector2) : boolean{
        const mapSize : Vector2 | undefined = this.asset.getSize();
        return mapSize != undefined &&
            Math.ceil(mapSize.getX() + this.offset.getX() / this.tileSize) >= position.getX() &&
            Math.ceil(mapSize.getY() + this.offset.getY() / this.tileSize) >= position.getY();
    }

    private sendNotification<T>(type : MessageType, modified : T) : void{
        this.notifier?.notify({
            status : type,
            command : Command.MODIFY,
            content : { id : this.asset.getID(), modified : modified}
        });
    }
}
