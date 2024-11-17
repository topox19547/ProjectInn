import { Command } from "../../../controller/Command";
import { ClientNotifier } from "../../ClientNotifier";
import { Status } from "../../messages/Status";
import { ensureObject, ensureNumber, weakEnsureOf, ensureString, ensureEnumLike } from "../../messages/Validators";
import { NotificationSource } from "../../NotificationSource";
import { Identifiable } from "../Identifiable";
import { Permission } from "../player/Permission";
import { Vector2 } from "../Vector2";
import { AssetType } from "./AssetType";

export class Asset implements Identifiable,NotificationSource{
    private assetURL : string | undefined;
    private assetSize : Vector2 | undefined;
    private name : string;
    private notifier : ClientNotifier | undefined;
    private assetID : number;
    private readonly assetType : AssetType;
    private static readonly maxNameLength: number = 24;
    public static readonly validate = ensureObject({
        assetID : ensureNumber,
        assetURL : weakEnsureOf(ensureString),
        assetType : ensureEnumLike(Object.values(AssetType).filter(v => typeof v === "number")),
        assetSize : weakEnsureOf(Vector2.validate),
        name : ensureString
    })

    constructor(assetID : number, name : string, assetType : AssetType){
        this.assetID = assetID;
        this.name = name;
        this.assetURL = undefined;
        this.assetType = assetType;
        this.assetSize = undefined;
    }

    public static fromObject(object : ReturnType<typeof this.validate>) : Asset{
        const asset : Asset = new Asset(
                object.assetID,
                object.name.slice(0,Asset.maxNameLength),
                object.assetType);
        if(object.assetURL === undefined){
            if(object.assetSize !== undefined){
                asset.assetSize = new Vector2(object.assetSize.x, object.assetSize.y);
            }
            return asset;
        }
        asset.setURL(object.assetURL); //TODO: change isInUse depending on what we need here
        return asset;
    }

    public static toObject(asset : Asset) : ReturnType<typeof this.validate>{
        return {
            assetURL : asset.assetURL,
            assetID : asset.assetID,
            assetType : asset.assetType,
            assetSize : asset.assetSize !== undefined ? Vector2.toObject(asset.assetSize) : undefined,
            name : asset.name
        }
    }

    public static getMaxNameLength() : number{
        return this.maxNameLength;
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
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

    public setID(id : number) : void{
        this.assetID = id;
    }

    public setName(name : string, permissionRequirement? : Permission) : boolean{
        if(name.length <= Asset.maxNameLength){
            this.name = name;
            this.notifier?.notifyIf({
                status : Status.ASSET_NAME,
                command : Command.MODIFY,
                content : {
                    id : this.assetID,
                    type : this.assetType,
                    name : this.name
                }
            }, p => permissionRequirement === undefined || p.hasPermission(permissionRequirement));
            return true;
        }
        return false;
    }

    public setURL(url : string, permissionRequirement? : Permission) : boolean{
        if(url.length >= 2048){
            return false;
        }
        const image : HTMLImageElement = new HTMLImageElement()
        image.src = url;
        //This could potentially be removed in the future and the client could supply its own dimensions
        //if it starts becoming a performance bottleneck
        image.decode().then(() => {
            this.assetURL = url;
            this.assetSize = new Vector2(image.width, image.height);
        }).catch(() => {
            this.assetURL = "/assets/missingSprite.jpg";
            this.assetSize = new Vector2(500, 500);
        });
        this.notifier?.notifyIf({
            status : Status.ASSET_URL,
            command : Command.MODIFY,
            content : {
                id : this.assetID,
                type : this.assetType,
                url : this.assetURL
            }
        }, p => permissionRequirement === undefined || p.hasPermission(permissionRequirement));
        return true;
    }
}