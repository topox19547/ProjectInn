import { ClientNotifier } from "../../ClientNotifier.js";
import { Command } from "../../messages/Command.js";
import { Status } from "../../messages/Status.js";
import { ensureObject, ensureEnumLike, ensureNumber } from "../../messages/Validators.js";
import { NotificationSource } from "../../NotificationSource.js";
import { Asset } from "../asset/Asset.js";
import { Identifiable } from "../Identifiable.js";
import { Vector2 } from "../Vector2.js";
import { GridType } from "./GridType.js";


export class Scene implements Identifiable, NotificationSource{
    private readonly asset : Asset;
    private gridType : GridType;
    private offset : Vector2;
    private tileSize : number;
    private notifier : ClientNotifier | undefined;
    private static readonly maxTileSize : number = 1000;
    private static readonly minTileSize : number = 30;
    public static readonly validate = ensureObject({
        asset : Asset.validate,
        gridType : ensureEnumLike(Object.values(GridType).filter(v => typeof v === "number")),
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

    public getID(): number {
        return this.asset.getID();
    }

    public setID(id: number): void {
        this.asset.setID(id);
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
        this.notifier?.notify({
            status : Status.SCENE_GRIDTYPE,
            command : Command.MODIFY,
            content : {
                id : this.asset.getID(),
                gridType : gridType
            }
        })
    }

    public getOffset() :Vector2{
        return this.offset;
    }

    public setOffset(offset : Vector2) : void{
        this.offset = new Vector2(this.tileSize % offset.getX(), this.tileSize % offset.getY());
        this.notifier?.notify({
            status : Status.SCENE_OFFSET,
            command : Command.MODIFY,
            content : {
                id : this.asset.getID(),
                offset : offset
            }
        })
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
        this.notifier?.notify({
            status : Status.SCENE_OFFSET,
            command : Command.MODIFY,
            content : {
                id : this.asset.getID(),
                tileSize : tileSize
            }
        })
    }

    public isValidPosition(position : Vector2) : boolean{
        const mapSize : Vector2 | undefined = this.asset.getSize();
        return mapSize != undefined &&
            Math.ceil(mapSize.getX() + this.offset.getX() / this.tileSize) >= position.getX() &&
            Math.ceil(mapSize.getY() + this.offset.getY() / this.tileSize) >= position.getY();
    }
}
