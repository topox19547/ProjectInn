import { ClientNotifier } from "../../ClientNotifier.js";
import { Command } from "../../messages/Command.js";
import { Status } from "../../messages/Status.js";
import { ensureObject, ensureNumber, weakEnsureOf, ensureString, ensureEnumLike } from "../../messages/Validators.js";
import { NotificationSource } from "../../NotificationSource.js";
import { Identifiable } from "../Identifiable.js";
import { Permission } from "../player/Permission.js";
import { Vector2 } from "../Vector2.js";
import { AssetType } from "./AssetType.js";


export class Asset implements Identifiable,NotificationSource{
    private assetURL : string | undefined;
    private assetSize : Vector2;
    private name : string;
    private notifier : ClientNotifier | undefined;
    private assetID : number;
    private readonly assetType : AssetType;
    private static readonly maxNameLength: number = 24;
    public static readonly validate = ensureObject({
        assetID : ensureNumber,
        assetURL : ensureString,
        assetType : ensureEnumLike(Object.values(AssetType).filter(v => typeof v === "number")),
        assetSize : Vector2.validate,
        name : ensureString
    })

    constructor(assetID : number, name : string, assetType : AssetType){
        this.assetID = assetID;
        this.name = name;
        this.assetURL = undefined;
        this.assetType = assetType;
        this.assetSize = new Vector2(0,0);
    }

    public static fromObject(object : ReturnType<typeof this.validate>) : Asset{
        const asset : Asset = new Asset(
                object.assetID,
                object.name.slice(0,Asset.maxNameLength),
                object.assetType);
        asset.setURL(object.assetURL,asset.assetSize); //TODO: change isInUse depending on what we need here
        return asset;
    }

    public static toObject(asset : Asset) : ReturnType<typeof this.validate>{
        return {
            assetURL : asset.assetURL !== undefined ? asset.assetURL : "",
            assetID : asset.assetID,
            assetType : asset.assetType,
            assetSize : Vector2.toObject(asset.assetSize),
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

    public setURL(url : string, assetSize : Vector2, permissionRequirement? : Permission) : boolean{
        if(url.length >= 2048){
            return false;
        }
        this.assetURL = url;
        this.assetSize = assetSize;
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