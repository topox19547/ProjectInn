import { ClientNotifier } from "../../ClientNotifier.js";
import { Command } from "../../messages/Command.js";
import { Status } from "../../messages/Status.js";
import { ensureObject, ensureEnumLike, ensureNumber } from "../../messages/Validators.js";
import { NotificationSource } from "../../NotificationSource.js";
import { Asset } from "../asset/Asset.js";
import { Identifiable } from "../Identifiable.js";
import { Permission } from "../player/Permission.js";
import { Vector2 } from "../Vector2.js";
import { GridType } from "./GridType.js";


export class Scene implements Identifiable, NotificationSource{
    private readonly asset : Asset;
    private gridType : GridType;
    private offset : Vector2;
    private tileSize : number;
    private notifier : ClientNotifier | undefined;
    private sceneLimits : {
        min : Vector2,
        max : Vector2
    };
    private static readonly maxTileSize : number = 300;
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
        this.offset = offset;
        this.sceneLimits = {
            max : new Vector2(0,0),
            min : new Vector2(0,0)
        }
        this.recalculateSceneLimits();
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

    public getName() : string{
        return this.asset.getName()
    }

    public setName(name : string, permissionRequirement? : Permission) : boolean{
        return this.asset.setName(name, permissionRequirement);
    }

    public setURL(url : string, assetSize : Vector2, permissionRequirement? : Permission) : boolean{
        const status : boolean = this.asset.setURL(url, assetSize, permissionRequirement);
        if(status){
            this.recalculateSceneLimits();
        }
        return status;
    }

    public getGridType() : GridType{
        return this.gridType;
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
        this.asset.setNotifier(notifier);
    }

    public setGridType(gridType : GridType) : void{
        this.gridType = gridType;
        this.notifier?.notify({
            status : Status.SCENE_GRIDTYPE,
            command : Command.MODIFY,
            content : {
                asset : { assetID : this.asset.getID() },
                gridType : gridType
            }
        })
        this.recalculateSceneLimits();
    }

    public getOffset() :Vector2{
        return this.offset;
    }

    public setOffset(offset : Vector2) : void{
        this.offset = offset
        this.notifier?.notify({
            status : Status.SCENE_OFFSET,
            command : Command.MODIFY,
            content : {
                asset : { assetID : this.asset.getID() },
                offset : offset
            }
        })
        this.recalculateSceneLimits();
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
        this.recalculateSceneLimits();
        this.notifier?.notify({
            status : Status.SCENE_TILESIZE,
            command : Command.MODIFY,
            content : {
                asset : { assetID : this.asset.getID() },
                tileSize : tileSize
            }
        })
    }

    public isValidPosition(position : Vector2) : boolean{
        return this.sceneLimits != undefined &&
            position.getX() >= this.sceneLimits.min.getX() &&
            position.getY() >= this.sceneLimits.min.getY() &&
            position.getX() < this.sceneLimits.max.getX() &&
            position.getY() < this.sceneLimits.max.getY();
    }

    private recalculateSceneLimits() : void{
        this.sceneLimits.min = new Vector2(0,0);
        this.sceneLimits.max = new Vector2(0,0);
        const assetSize : Vector2 | undefined = this.asset.getSize();
        if(assetSize === undefined){
            return;
        }
        let realTileSize : Vector2;
        let realOffset : Vector2;
        if(this.gridType == GridType.SQUARE){
            realTileSize = new Vector2(this.tileSize, this.tileSize);
            realOffset = new Vector2(this.offset.getX() % this.tileSize,this.offset.getY() % this.tileSize);
        } else if (this.gridType == GridType.HEXAGONAL){
            realTileSize = new Vector2(this.tileSize * 3 / 4, this.tileSize * Math.sqrt(3) / 2);
            realOffset = new Vector2(this.offset.getX() % (this.tileSize * 3 / 2),this.offset.getY() % realTileSize.getY());
        } else {
            realTileSize = new Vector2(0,0);
            realOffset = new Vector2(0,0);
        }
        this.sceneLimits.min = new Vector2(
            -Math.abs(realOffset.getX()) / realTileSize.getX(), 
            -Math.abs(realOffset.getY()) / realTileSize.getY())
        this.sceneLimits.max = new Vector2(
            -this.sceneLimits.min.getX() + Math.ceil((assetSize.getX()) / realTileSize.getX()),
            -this.sceneLimits.min.getY() + Math.ceil((assetSize.getY()) / realTileSize.getY())
        )
    }
}
