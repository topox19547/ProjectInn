import type { Grid } from "./grid/Grid.js";
import { Vector2 } from "../../../types/Vector2.js";
import type { Token } from "../../../model/Token.js";
import type { Ref } from "vue";
import type { Asset } from "../../../model/Asset.js";
import type { Scene } from "../../../model/Scene.js";
import { SquareGrid } from "./grid/SquareGrid.js";
import type { ServerPublisher } from "../../../network/ServerHandler.js";
import { Status } from "../../../network/message/Status.js";
import { Command } from "../../../network/message/Command.js";
import type { Player } from "../../../model/Player.js";

export class BoardRenderer{
    //the offset of the view as the coordinates of its top left corner
    private viewOffset:Vector2;
    private viewScale:number;
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D | null;
    private grid:Grid;
    private readonly maxScale:number;
    private readonly scrollWheelMultiplier;
    private isCursorDown:boolean;
    private isCursorIn:boolean;
    private draggedToken : Token | undefined;
    private background:ImageBitmap | undefined;
    private backgroundSource : string | undefined;
    private defaultBackground:ImageBitmap | undefined;
    private placeHolderSpriteColor:string;
    private spriteCache:Map<number,{
        url : string | undefined, 
        sprite : ImageBitmap | undefined,
        unused : boolean}>;
    private tokens:Array<Token>;
    private currentScene:Scene;
    private tokenAssets:Array<Asset>;
    private nextAnimationFrameID:number;
    private serverPublisher : ServerPublisher;


    constructor(
        canvas:HTMLCanvasElement,
        tokens:Array<Token>,
        localPlayer:Player,
        currentScene:Scene,
        tokenAssets : Array<Asset>,
        serverPublisher : ServerPublisher){
        console.log("new boardrenderer created");
        this.tokens = tokens;
        this.currentScene = currentScene;
        this.tokenAssets = tokenAssets;
        this.viewScale = 1;
        this.maxScale = 1.75;
        this.scrollWheelMultiplier = 1 / 2000;
        this.isCursorDown = false;
        this.isCursorIn = false;
        this.draggedToken = undefined;
        this.viewOffset = new Vector2(0,0);
        this.grid = new SquareGrid(10,new Vector2(0,0),1);
        this.placeHolderSpriteColor = "#222222"
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", { alpha : false});
        this.defaultBackground = undefined;
        this.background = undefined;
        this.backgroundSource = undefined;
        this.spriteCache = new Map();
        this.nextAnimationFrameID = 0;
        this.serverPublisher = serverPublisher;
        this.bindEvents();
    }

    public setMap(
        url : string | undefined,
        grid:Grid,
        onSuccess? : (img : ImageBitmap) => void,
        onFail? : () => void):void{
        this.grid = grid;
        if(url === undefined || this.backgroundSource === url){
            return;//Avoid reloading the same image again
        }
        const image : HTMLImageElement = new Image();
        image.src = url;
        this.backgroundSource = url;
        image.addEventListener("load",() =>{
            createImageBitmap(image).then((bg) => {
                window.cancelAnimationFrame(this.nextAnimationFrameID);
                this.background?.close();
                this.background = bg;
                this.renderView();
                this.resetScale();
                this.viewOffset.setX(0);
                this.viewOffset.setY(0);
                this.updateOnScreenTokens();
                if(onSuccess !== undefined){
                    onSuccess(bg);
                }
            }).catch(() => {
                if(onFail){
                    onFail();
                }
                this.setMap("placeholders/background_placeholder.png",this.grid)
             });
        })
    }


    public startCacheUpdate():void{
        this.spriteCache.forEach((v, k) => v.unused = true);
    }

    public updateSpriteCache(id:number, url:string):void{
        let spriteEntry = this.spriteCache.get(id); 
        if(spriteEntry == undefined){
            spriteEntry = {
                url : undefined,
                sprite : undefined,
                unused : false
            };
            this.spriteCache.set(id, spriteEntry);
        }
        spriteEntry.unused = false;
        if(spriteEntry.url != url){
            const image : HTMLImageElement = new Image();
            image.src = url;
            createImageBitmap(image).then(s => {
                spriteEntry.sprite = s;
            }).catch( 
                () => {
                    spriteEntry.sprite = undefined;
            });
        }
        spriteEntry.url = url;
    }

    public clearUnusedSprites():void{
        this.spriteCache.forEach((v,k) => {
            if(v.unused == true){
                this.spriteCache.delete(k);
            }
        });
    }

    public updateOnScreenTokens():void {
        const topLeftTile:Vector2 = this.grid.canvasToTile(this.viewOffset, new Vector2(0,0), this.viewScale);
        const canvasSizeVector:Vector2 = new Vector2(this.canvas.width, this.canvas.height);
        const bottomRightTile:Vector2 = this.grid.canvasToTile(this.viewOffset, canvasSizeVector, this.viewScale);
    }

    public destroy():void{
        window.cancelAnimationFrame(this.nextAnimationFrameID);
        this.background?.close();
        this.unbindEvents();
        console.log("boardrenderer destroyed");
    }

    private renderView():void{
        this.nextAnimationFrameID = requestAnimationFrame(() => this.renderView());
        if(this.ctx === null || this.background == undefined){
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#111111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.drawImage(
            this.background,
            this.viewOffset.getX(),
            this.viewOffset.getY(),
            Math.floor(this.canvas.width / this.viewScale),
            Math.floor(this.canvas.height / this.viewScale),
            0,
            0,
            this.canvas.width,
            this.canvas.height);
        this.grid.drawGrid(this.canvas,this.viewOffset,this.viewScale);
        const tokenSize : Vector2 = this.grid.getTokenSize(this.viewScale);
        const tokenOffset : Vector2 = this.grid.getTokenOffset(this.viewScale);
        for(const token of this.tokens){
            const spriteData = this.spriteCache.get(token.assetID);
            const vectorPosition = new Vector2(token.position.x,token.position.y);
            const tokenPosition:Vector2 = this.grid.tileToCanvas(this.viewOffset,vectorPosition,this.viewScale);
            if(spriteData === undefined || spriteData.sprite === undefined){
                this.ctx.fillStyle = this.placeHolderSpriteColor;
                this.ctx.beginPath()
                this.ctx.arc(
                    tokenPosition.getX() + tokenOffset.getX(),
                    tokenPosition.getY() + tokenOffset.getY(),
                    Math.floor(tokenSize.getX()),
                    0,
                    2 * Math.PI
                )
                this.ctx.fill();
            
            }else{
                this.ctx.drawImage(
                    spriteData.sprite,
                    tokenPosition.getX() + tokenOffset.getX(),
                    tokenPosition.getY() + tokenOffset.getY(),
                    Math.floor(tokenSize.getX()),
                    Math.floor(tokenSize.getY()));
            }
        }
        
    }

    private bindEvents(){
        this.canvas.onmousedown = () => this.onCursorDown();
        this.canvas.onmouseup = () => this.onCursorUp();
        this.canvas.onmouseleave = () => this.onCursorLeave();
        this.canvas.onmouseover = () => this.onCursorOver();
        this.canvas.onmousemove = e => this.onMouseMoved(e);
        this.canvas.onwheel = e => this.onWheelEvent(e);
        this.canvas.ondragenter = e => e.preventDefault();
        this.canvas.ondragover = e => e.preventDefault();
        this.canvas.ondrop = e => this.onDrop(e);
    }

    private unbindEvents(){
        this.canvas.onmousedown = null;
        this.canvas.onmouseup = null;
        this.canvas.onmouseleave = null;
        this.canvas.onmouseover = null;
        this.canvas.onmousemove = null;
        this.canvas.onwheel = null;
        this.canvas.ondragover = null;
        this.canvas.ondragenter = null;
        this.canvas.ondrop = null;
    }

    private onCursorDown() : void{
        this.isCursorDown = true;
    }

    private onCursorUp() : void{
        this.isCursorDown = false;
        if(this.draggedToken !== undefined){
            if(this.draggedToken.virtualPosition !== undefined){
                this.serverPublisher.send({
                    status : Status.TOKEN_MOVED,
                    command : Command.MODIFY,
                    content : {
                        id : this.draggedToken.id,
                        position : this.grid.canvasToTile(
                            this.viewOffset,
                            this.draggedToken.virtualPosition,
                            this.viewScale)
                    }
                });
            }
            this.draggedToken.virtualPosition = undefined
            this.draggedToken = undefined;
        }
    }

    private onCursorLeave() : void{
        this.isCursorDown = false;
        this.isCursorIn = false;
    }

    private onCursorOver() : void{
        this.isCursorIn = true;
    }

    private onMouseMoved(e : MouseEvent) : void{
        const boundingRect = this.canvas.getBoundingClientRect();
        this.cursorMoved(
        new Vector2(-e.movementX,-e.movementY),
        new Vector2(
            e.clientX - boundingRect.x,
            e.clientY - boundingRect.y));
    }

    private onWheelEvent(e : WheelEvent) : void{
        if(!this.isCursorIn){
            return;
        }
        const boundingRect = this.canvas.getBoundingClientRect();
        this.cursorZoomed(e.deltaY,new Vector2(e.clientX - boundingRect.x,e.clientY - boundingRect.y));
    }

    private onDrop(e : DragEvent){
        if(e.dataTransfer?.getData("id") == undefined || e.dataTransfer.getData("name") == undefined){
            return;
        }
        const boundingRect = this.canvas.getBoundingClientRect();
        const mousePosition : Vector2 = new Vector2(e.clientX - boundingRect.x, e.clientY - boundingRect.y);
        const tilePosition : Vector2 = this.grid.canvasToTile(this.viewOffset,mousePosition,this.viewScale);
        this.sendNewToken(
            parseInt(e.dataTransfer?.getData("id")),
            e.dataTransfer?.getData("name"),
            tilePosition);
    }

    private sendNewToken(id : number, name : string, position : Vector2){
        this.serverPublisher.send({
            status : Status.TOKEN,
            command : Command.CREATE,
            content : {
                name : name,
                id : -1,
                assetID : id,
                owners : [],
                notes : {},
                stats : {},
                position : position
            }
        })
    }

    private cursorMoved(movement:Vector2, position:Vector2):void{
        if(!this.isCursorDown){
            return;
        }   
        const overlappedTile:Vector2 = this.grid.canvasToTile(this.viewOffset, position, this.viewScale);
        if(this.draggedToken !== undefined){
            this.draggedToken.virtualPosition = position;
            const previousTile:Vector2 = this.grid.canvasToTile(
                this.viewOffset, this.draggedToken.virtualPosition, this.viewScale);
            if(overlappedTile != previousTile)
                this.serverPublisher.send({
                    status : Status.TOKEN_MOVING,
                    command : Command.MODIFY,
                    content : {
                        id : this.draggedToken.id,
                        position : overlappedTile
                    }
                });
            return;
        }
        const overlappedToken:Token | undefined = 
            this.tokens.find(t => t.position.x == overlappedTile.getX() && t.position.y == overlappedTile.getY());
        if(overlappedToken !== undefined){
            this.draggedToken = overlappedToken;
            return;
        }
        this.translateView(movement);
    }

    private cursorZoomed(deltaY:number,cursorPos:Vector2):void{
        this.changeViewScale(-deltaY * this.scrollWheelMultiplier,cursorPos);
    }

    private resetScale():void{
        this.changeViewScale(0,new Vector2(0,0));
    }


    private translateView(vector:Vector2):void{
        if(this.background === undefined){
            return;
        }
        vector.multiplyByScalar(1/this.viewScale);
        const newX:number = this.viewOffset.getX() + vector.getX();
        const newY:number = this.viewOffset.getY() + vector.getY();
        //Check if the new view position fits inside the background
        //if not, set X or Y to the closest possible coordinate
        const scaledCanvasW = this.canvas.width / this.viewScale;
        const scaledCanvasH = this.canvas.height / this.viewScale;
        const extraPaddingX = Math.max(
            this.grid.getTokenSize(this.viewScale).getX() / this.viewScale,
            Math.abs(this.grid.getTileOffset().getX()));
        const extraPaddingY = Math.max(
            this.grid.getTokenSize(this.viewScale).getY() / this.viewScale,
            Math.abs(this.grid.getTileOffset().getY()));
        if(newX < 0 - extraPaddingX){
            console.log(this.viewOffset)
            let limitedX:number = - extraPaddingX - this.viewOffset.getX();
            vector.setX(limitedX);
        }
        else if(newX + scaledCanvasW > this.background.width + extraPaddingX){
            let limitedX:number = 
                this.background.width + extraPaddingX - this.viewOffset.getX() - scaledCanvasW ;
            vector.setX(limitedX)
        }
        if(newY < 0 - extraPaddingY){
            let limitedY:number = - extraPaddingY - this.viewOffset.getY();
            vector.setY(limitedY);
        }
        else if(newY + scaledCanvasH > this.background.height + extraPaddingY){
            let limitedY:number =  
                this.background.height - this.viewOffset.getY() + extraPaddingY - scaledCanvasH;
            vector.setY(limitedY);
        }
        //if the background can be fully seen, block scrolling on that axis       
        this.viewOffset.translateBy(vector);
        this.updateOnScreenTokens();
    }

    private changeViewScale(amount:number,cursorPos:Vector2):void{
        if(this.background === undefined){
            return;
        }
        const tempViewScale:number = this.viewScale + amount;
        const oldScale:number = this.viewScale;
        const dynamicMinScale = Math.max(
            this.canvas.width / this.background.width,
            this.canvas.height / this.background.height);
        this.viewScale = Math.max(dynamicMinScale, Math.min(this.maxScale, tempViewScale))   
        //translate to "zoom" towards where the mouse position was
        let zoomOffset:Vector2 = new Vector2(0,0);
        const cursorPosFracX = cursorPos.getX() / this.canvas.width;
        const cursorPosFracY = cursorPos.getY() / this.canvas.height;
        zoomOffset.setX(((this.canvas.width / oldScale) -
            this.canvas.width / this.viewScale) * cursorPosFracX * this.viewScale);
        zoomOffset.setY(((this.canvas.height / oldScale) -
            this.canvas.height / this.viewScale) * cursorPosFracY * this.viewScale);
        this.translateView(zoomOffset);
    }
}