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
import PlaceholderSprite from "../../../assets/placeholders/token_placeholder.png"
import PlaceholderBackground from "../../../assets/placeholders/background_placeholder.png"
import type { ViewData } from "../../../model/Game.js";

export class BoardView{
    //the offset of the view as the coordinates of its top left corner
    private viewOffset:Vector2;
    private viewScale:number;
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D | null;
    private grid:Grid;
    private readonly maxScale:number;
    private readonly scrollWheelMultiplier;
    private readonly draggedSizeMultiplier;
    private isCursorDown:boolean;
    private isCursorIn:boolean;
    private draggingView : boolean;
    private cursorPosition : Vector2;
    private draggedToken : Token | undefined;
    private background:ImageBitmap | undefined;
    private backgroundSource : string | undefined;
    private defaultBackground:ImageBitmap | undefined;
    private placeHolderSpriteColor:string;
    private noSprite : ImageBitmap | undefined;
    private spriteCache:Map<number,{
        url : string | undefined, 
        sprite : ImageBitmap | undefined,
        unused : boolean}>;
    private tokens:Array<Token>;
    private currentScene:Scene;
    private localPlayer:Player;
    private players:Array<Player>;
    private viewData:ViewData;
    private nextAnimationFrameID:number;
    private serverPublisher : ServerPublisher;


    constructor(
        canvas:HTMLCanvasElement,
        gameContext : {
            tokens:Array<Token>,
            localPlayer:Player,
            players:Array<Player>,
            currentScene:Scene,
            viewData : ViewData
        },
        serverPublisher : ServerPublisher){
        console.log("new boardrenderer created");
        this.tokens = gameContext.tokens;
        this.currentScene = gameContext.currentScene;
        this.localPlayer = gameContext.localPlayer;
        this.players = gameContext.players;
        this.viewData=  gameContext.viewData;
        this.viewScale = 1;
        this.maxScale = 1.75;
        this.scrollWheelMultiplier = 1 / 2000;
        this.isCursorDown = false;
        this.isCursorIn = false;
        this.draggingView = false;
        this.cursorPosition = new Vector2(0,0);
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
        this.draggedSizeMultiplier = 8 / 7;
        this.bindEvents();
        const image : HTMLImageElement = new Image();
        image.src = PlaceholderSprite;
        this.noSprite = undefined;
        image.addEventListener("load",() =>{
            createImageBitmap(image).then((placeholder) => {
                this.noSprite = placeholder;
                console.log(PlaceholderSprite)
            }).catch(() => console.log(PlaceholderSprite));
        });
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
                this.setMap(PlaceholderBackground,this.grid)
             });
        })
    }


    public startCacheUpdate():void{
        this.spriteCache.forEach((v, k) => v.unused = true);
    }

    public updateSpriteCache(id:number, url:string):void{
        let spriteEntry = this.spriteCache.get(id); 
        console.log(this.spriteCache);
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
            image.addEventListener("error", () => {
                if(this.noSprite == undefined){
                    return;
                }
                spriteEntry.url = PlaceholderSprite;
                spriteEntry.sprite = this.noSprite;
            })
            image.addEventListener("load", () =>{
                createImageBitmap(image).then(s => {
                    spriteEntry.sprite = s;
                }).catch( 
                    () => {
                        if(this.noSprite == undefined){
                            return;
                        }
                        spriteEntry.url = PlaceholderSprite;
                        spriteEntry.sprite = this.noSprite;
                });
            })
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

    public updateOnScreenTokens():void { //marked as useless, pending removal
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
        //Clear the canvas and draw the grid
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
        //Draw the tokens that aren't being moved first
        const tokenSize : Vector2 = this.grid.getTokenSize(this.viewScale);
        const tokenOffset : Vector2 = this.grid.getTokenOffset(this.viewScale);
        for(const token of this.tokens){
            const spriteData = this.spriteCache.get(token.assetID);
            const vectorPosition = new Vector2(token.position.x,token.position.y);
            const tokenPosition:Vector2 = this.grid.tileToCanvas(this.viewOffset,vectorPosition,this.viewScale);
            if(spriteData === undefined || spriteData.sprite === undefined){
                continue;
            }
            if(!token.inDrag){
                this.ctx.drawImage(
                    spriteData.sprite,
                    tokenPosition.getX() + tokenOffset.getX(),
                    tokenPosition.getY() + tokenOffset.getY(),
                    Math.floor(tokenSize.getX()),
                    Math.floor(tokenSize.getY()));
                if(this.viewData.selectedToken == token){
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = "#D9D9D9"
                    this.ctx.lineWidth = 2;
                    this.ctx.roundRect(
                        tokenPosition.getX() + tokenOffset.getX(),
                        tokenPosition.getY() + tokenOffset.getY(),
                        Math.floor(tokenSize.getX()),
                        Math.floor(tokenSize.getY()),
                        8
                    );
                    this.ctx.stroke();
                }
            }
        }
        //Draw the tokens that are being moved
        for(const token of this.tokens){
            const spriteData = this.spriteCache.get(token.assetID);
            const vectorPosition = new Vector2(token.position.x,token.position.y);
            const tokenPosition:Vector2 = this.grid.tileToCanvas(this.viewOffset,vectorPosition,this.viewScale);
            if(spriteData === undefined || spriteData.sprite === undefined){
                continue;
            }
            if(token.inDrag){
                this.ctx.globalAlpha = 0.6;
                this.ctx.drawImage(
                    spriteData.sprite,
                    tokenPosition.getX() + tokenOffset.getX(),
                    tokenPosition.getY() + tokenOffset.getY(),
                    Math.floor(tokenSize.getX()),
                    Math.floor(tokenSize.getY()));
                const isOverlappingToken : boolean = this.tokens.find(t => t != token && 
                    t.position.x == token.position.x && t.position.y == token.position.y) !== undefined;
                if(isOverlappingToken && this.draggedToken == token){
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.fillStyle = "#9D2C2C";
                    this.ctx.fillRect(
                        tokenPosition.getX() + tokenOffset.getX(),
                        tokenPosition.getY() + tokenOffset.getY(),
                        Math.floor(tokenSize.getX()),
                        Math.floor(tokenSize.getY()));
                }
                this.ctx.globalAlpha = 1;
                if(token.byUser !== this.localPlayer.name){
                    const player : Player | undefined = this.players.find(p => p.name == token.byUser);
                    if(player === undefined){
                        continue;
                    }
                    this.ctx.fillStyle = player.color;
                    const measurements : TextMetrics = this.ctx.measureText(player.name);
                    const textHeight : number = tokenSize.getY() / 4;
                    const padding : number = textHeight / 2;
                    this.ctx.beginPath();
                    this.ctx.roundRect(tokenPosition.getX() - padding / 2, tokenPosition.getY() - padding / 2,
                         measurements.width + padding, textHeight + padding, 8);
                    this.ctx.fill();
                    this.ctx.textBaseline = "top";
                    this.ctx
                    this.ctx.fillStyle = "#FFFFFF";
                    this.ctx.font = `${textHeight}px Inter`
                    this.ctx.fillText(token.byUser,tokenPosition.getX(), tokenPosition.getY())
                }
            }
            
        }
        //Draw the token that follows the cursor
        if(this.draggedToken === undefined){
            return;
        }
        for(const token of this.tokens){
            const spriteData = this.spriteCache.get(token.assetID);
            if(spriteData === undefined || spriteData.sprite === undefined){
                continue;
            }
            if(token.inDrag == true && token.byUser == this.localPlayer.name){
                this.ctx.drawImage(
                    spriteData.sprite,
                    this.cursorPosition.getX() - tokenSize.getX() / 2,
                    this.cursorPosition.getY() - tokenSize.getY() / 2,
                    Math.floor(tokenSize.getX() * this.draggedSizeMultiplier),
                    Math.floor(tokenSize.getY() * this.draggedSizeMultiplier));
            }
        }
    }


    private bindEvents() : void{
        this.canvas.onmousedown = () => this.onCursorDown();
        this.canvas.onmouseup = e => this.onMouseUp(e);
        this.canvas.onmouseleave = () => this.onCursorLeave();
        this.canvas.onmouseover = () => this.onCursorOver();
        this.canvas.onmousemove = e => this.onMouseMoved(e);
        this.canvas.onwheel = e => this.onWheelEvent(e);
        this.canvas.ondragenter = e => e.preventDefault();
        this.canvas.ondragover = e => e.preventDefault();
        this.canvas.ondrop = e => this.onDrop(e);
    }

    private unbindEvents() : void{
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

    private onMouseUp(e : MouseEvent) : void{
        const boundingRect = this.canvas.getBoundingClientRect();
        this.onSelect(
            new Vector2(
                e.clientX - boundingRect.x,
                e.clientY - boundingRect.y
            )
        );
        this.onCursorUp();
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

    private onCursorDown() : void{
        this.isCursorDown = true;
    }

    private onCursorUp() : void{
        this.isCursorDown = false;
        this.draggingView = false;
        if(this.draggedToken !== undefined){
            if(this.draggedToken.virtualPosition !== undefined){
                this.serverPublisher.send({
                    status : Status.TOKEN_MOVED,
                    command : Command.MODIFY,
                    content : {
                        id : this.draggedToken.id,
                        position : this.draggedToken.virtualPosition
                    }
                });
            }
            this.draggedToken.virtualPosition = undefined
            this.draggedToken = undefined;
        }
    }

    private onCursorLeave() : void{
        this.onCursorUp();
        this.isCursorIn = false;
    }

    private onCursorOver() : void{
        this.isCursorIn = true;
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

    private onSelect(position : Vector2){
        if(this.draggingView || this.draggedToken !== undefined){
            return;
        }
        const overlappedTile:Vector2 = this.grid.canvasToTile(this.viewOffset, position, this.viewScale);
        const overlappedToken:Token | undefined = 
            this.tokens.find(t => t.position.x == overlappedTile.getX() && t.position.y == overlappedTile.getY());
        this.viewData.selectedToken = overlappedToken != this.viewData.selectedToken ? overlappedToken : undefined;
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
        const dragDistance : number = movement.distanceTo(new Vector2(0,0));
        const minDragDistance : number = 1.1;
        if(this.draggedToken === undefined && !this.draggingView && dragDistance < minDragDistance){
            return;
        }
        this.cursorPosition = position;
        const overlappedTile:Vector2 = this.grid.canvasToTile(this.viewOffset, position, this.viewScale);
        if(this.draggedToken !== undefined && this.draggedToken.virtualPosition !== undefined && !this.draggingView){
            if(!overlappedTile.equals(this.draggedToken.virtualPosition))
                this.serverPublisher.send({
                    status : Status.TOKEN_MOVING,
                    command : Command.MODIFY,
                    content : {
                        id : this.draggedToken.id,
                        position : overlappedTile
                    }
                });
            this.draggedToken.virtualPosition = overlappedTile;
            return;
        }
        const overlappedToken:Token | undefined = 
            this.tokens.find(t => t.position.x == overlappedTile.getX() && t.position.y == overlappedTile.getY());
        if(overlappedToken !== undefined && !this.draggingView){
            const isTokenOwner : boolean = overlappedToken.owners.find(o => o == this.localPlayer.name) !== undefined;
            const hasTokenPermissions : boolean = this.localPlayer.permissions.MANAGE_TOKENS == true;
            if(isTokenOwner || hasTokenPermissions){
                this.draggedToken = overlappedToken;
                this.draggedToken.virtualPosition = overlappedTile;
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
        }
        this.translateView(movement);
        this.draggingView = true;
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