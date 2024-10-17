
class Scene{
    private asset : Asset;
    private gridType : GridType;
    private offset : Vector2;
    private tileSize : number;
    private static readonly maxTileSize : number = 1000;
    private static readonly minTileSize : number = 30;
    public static readonly validate = ensureObject({
        assetID : ensureNumber,
        gridType : ensureNumber,
        offset : Vector2.validate,
        tileSize : ensureNumber,
    })

    //Remember to always check if the asset's image can be loaded before using it in the constructor
    constructor(asset : Asset, grid : GridType, offset : Vector2, tileSize : number){
        this.asset = asset;
        this.gridType = grid;
        this.offset = new Vector2(0,0);
        this.setOffset(offset);
        this.tileSize = tileSize;
    }
    
    public static getMaxTileSize() : number{ return this.maxTileSize; }
    
    public static getMinTileSize() : number{ return this.minTileSize; }

    public static fromObject(object : ReturnType<typeof Scene.validate>, asset : Asset) : Scene{
        return new Scene(asset, object.gridType, new Vector2(object.offset.x, object.offset.y), object.tileSize);
    }

    public static toObject(scene : Scene) : ReturnType<typeof Scene.validate>{
        return {
            assetID : scene.asset.getID(),
            gridType : scene.gridType,
            offset : Vector2.toObject(scene.offset),
            tileSize : scene.tileSize
        }
    }

    public getAsset() : Asset{
        return this.asset;
    }

    public getGridType() : GridType{
        return this.gridType;
    }

    public setGridType(gridType : GridType) : void{
        this.gridType = gridType; 
    }

    public getOffset() :Vector2{
        return this.offset;
    }

    public setOffset(offset : Vector2) : void{
        this.offset = new Vector2(this.tileSize % offset.getX(), this.tileSize % offset.getY());
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
    }

    public isValidPosition(position : Vector2) : boolean{
        const mapSize : Vector2 | undefined = this.asset.getSize();
        return mapSize != undefined &&
            Math.ceil(mapSize.getX() + this.offset.getX() / this.tileSize) >= position.getX() &&
            Math.ceil(mapSize.getY() + this.offset.getY() / this.tileSize) >= position.getY();
    }
}