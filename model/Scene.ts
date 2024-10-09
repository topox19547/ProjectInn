
class Scene{
    private asset : Asset;
    private gridType : GridType;
    private offset : Vector2;
    private tileSize : number;
    private readonly maxTileSize : number;
    private readonly minTileSize : number;

    //Remember to always check if the asset's image can be loaded before using it in the constructor
    constructor(asset : Asset, grid : GridType, offset : Vector2, tileSize : number, mapSize : Vector2){
        this.asset = asset;
        this.gridType = grid;
        this.offset = new Vector2(tileSize % offset.getX(), tileSize % offset.getY());
        this.tileSize = tileSize;
        this.maxTileSize = 1000;
        this.minTileSize = 30;
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

    public setTileSize(tileSize : number) : boolean{
        if(tileSize > this.maxTileSize || tileSize < this.minTileSize){
            return false;
        }
        this.tileSize = tileSize;
        return true;
    }

    public isValidPosition(position : Vector2) : boolean{
        const mapSize : Vector2 | undefined = this.asset.getSize();
        return mapSize != undefined &&
            Math.ceil(mapSize.getX() + this.offset.getX() / this.tileSize) >= position.getX() &&
            Math.ceil(mapSize.getY() + this.offset.getY() / this.tileSize) >= position.getY();
    }
}