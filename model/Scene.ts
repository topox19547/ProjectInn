
class Scene{
    private readonly asset : Asset;
    private gridType : GridType;
    private offset : number;
    private tileSize : number;
    private readonly maxTileSize : number;
    private readonly minTileSize : number;

    constructor(asset : Asset, grid : GridType, offset : number, tilesize : number){
        this.asset = asset;
        this.gridType = grid;
        this.offset = offset;
        this.tileSize = tilesize;
        this.maxTileSize = 1000;
        this.minTileSize = 1;
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

    public getOffset() : number{
        return this.offset;
    }

    public setOffset(offset : number) : void{
        this.offset = offset;
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
}