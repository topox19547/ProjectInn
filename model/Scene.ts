
class Scene{
    private readonly asset : Asset;
    private gridType : GridType;
    private offset : number;
    private tileSize : number;
    private readonly mapSize : Vector2;
    private readonly maxTileSize : number;
    private readonly minTileSize : number;

    //Remember to always check if the asset's image can be loaded before using in in the constructor
    constructor(asset : Asset, grid : GridType, offset : number, tilesize : number, mapSize : Vector2){
        this.asset = asset;
        this.gridType = grid;
        this.offset = offset;
        this.tileSize = tilesize;
        this.maxTileSize = 1000;
        this.minTileSize = 30;
        this.mapSize = mapSize; //TODO: find a way to update this when the asset URL changes
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

    public isValidPosition(position : Vector2){

    }
}