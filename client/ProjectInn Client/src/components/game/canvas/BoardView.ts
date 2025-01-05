import type { Grid } from "./grid/Grid.js";
import { Vector2 } from "../../../types/Vector2.js";
import type { Token } from "../../../model/Token.js";
import type { Ref } from "vue";
import type { Asset } from "../../../model/Asset.js";
import type { Scene } from "../../../model/Scene.js";
import { SquareGrid } from "./grid/SquareGrid.js";
import type { ServerPublisher } from "../../../network/ServerPublisher.js";
import { Status } from "../../../network/message/Status.js";
import { Command } from "../../../network/message/Command.js";
import type { Player } from "../../../model/Player.js";
import PlaceholderSprite from "../../../assets/placeholders/token_placeholder.png"
import PlaceholderBackground from "../../../assets/placeholders/background_placeholder.png"
import type { ViewData } from "../../../model/Game.js";
import { statToString, type Stat } from "../../../model/Stat.js";
import type { GlobalSettings } from "../../../model/GlobalSettings.js";

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
    private noSprite : ImageBitmap | undefined;
    private spriteCache:Map<number,{
        url : string | undefined, 
        sprite : ImageBitmap | undefined,
        unused : boolean}>;
    private tokens:Array<Token>;
    private globalSettings:GlobalSettings;
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
            viewData : ViewData,
            globalSettings : GlobalSettings
        },
        serverPublisher : ServerPublisher){
        this.tokens = gameContext.tokens;
        this.localPlayer = gameContext.localPlayer;
        this.players = gameContext.players;
        this.viewData =  gameContext.viewData;
        this.globalSettings = gameContext.globalSettings;
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
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", { alpha : false});
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
            });
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


    public startFullCacheUpdate():void{
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

    public destroy():void{
        window.cancelAnimationFrame(this.nextAnimationFrameID);
        this.background?.close();
        this.unbindEvents();
    }

    private renderView():void{
        this.nextAnimationFrameID = requestAnimationFrame(() => this.renderView());
        if(this.ctx === null || this.background == undefined){
            return;
        }
        //Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#111111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        //Draw the scene
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
        //Draw the grid
        this.grid.drawGrid(this.canvas,this.viewOffset,this.viewScale);
        const tokenSize : Vector2 = this.grid.getTokenSize(this.viewScale);
        const tokenOffset : Vector2 = this.grid.getTokenOffset(this.viewScale);
        //Draw the tokens that aren't moving
        this.drawStillTokens(tokenSize, tokenOffset);
        //Draw token stats and tags (if enabled)
        this.drawTokenInfo(tokenSize,tokenOffset);
        //Draw the tokens that are being moved
        this.drawMovingTokens(tokenSize,tokenOffset);
        //Draw the scene pings
        this.drawPings(tokenSize,tokenOffset);
        //Draw the token that follows the cursor
        this.drawTokenInDrag(tokenSize);
    }

    private drawStillTokens(tokenSize : Vector2, tokenOffset : Vector2){
        if(this.ctx === null) return;
        for(const token of this.tokens){
            const spriteData = this.spriteCache.get(token.assetID);
            const vectorPosition : Vector2 = new Vector2(token.position.x,token.position.y);
            const tokenPosition:Vector2 = this.grid.tileToCanvas(this.viewOffset,vectorPosition,this.viewScale);
            tokenPosition.translateBy(tokenOffset);
            if(spriteData === undefined || spriteData.sprite === undefined){
                continue;
            }
            if(!token.inDrag){
                this.drawToken(spriteData.sprite, tokenPosition, tokenSize);
                if(this.viewData.selectedToken == token){
                    this.ctx.strokeStyle = "#D9D9D9"
                    this.ctx.lineWidth = 2;
                    this.drawRoundRect(tokenPosition, tokenSize, false);
                }
            }
        }
    }

    private drawTokenInfo(tokenSize : Vector2, tokenOffset : Vector2){
        for(const token of this.tokens){
            const vectorPosition : Vector2 = new Vector2(token.position.x,token.position.y);
            const tokenPosition:Vector2 = this.grid.tileToCanvas(this.viewOffset,vectorPosition,this.viewScale);
            tokenPosition.translateBy(tokenOffset);
            if(this.globalSettings.showNames == true){
                this.drawTokenTag(tokenPosition, tokenSize, token.name);
            }
            if(!token.inDrag && this.globalSettings.showStats){
                this.drawTokenStats(tokenPosition, tokenSize, token.stats);
            }
        }
    }

    private drawMovingTokens(tokenSize : Vector2, tokenOffset : Vector2){
        if(this.ctx === null) return;
        for(const token of this.tokens){
            const spriteData = this.spriteCache.get(token.assetID);
            const vectorPosition : Vector2  = new Vector2(token.position.x,token.position.y);
            const tokenPosition:Vector2 = this.grid.tileToCanvas(this.viewOffset,vectorPosition,this.viewScale);
            tokenPosition.translateBy(tokenOffset);
            if(spriteData === undefined || spriteData.sprite === undefined){
                continue;
            }
            if(token.inDrag){
                this.ctx.globalAlpha = 0.5;
                this.drawToken(spriteData.sprite, tokenPosition, tokenSize);
                const isOverlappingToken : boolean = this.tokens.find(t => t != token && 
                    t.position.x == token.position.x && t.position.y == token.position.y) !== undefined;
                if(isOverlappingToken && this.draggedToken == token){
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.fillStyle = "#9D2C2C";
                    this.drawRoundRect(tokenPosition, tokenSize, true);
                }
                this.ctx.globalAlpha = 1;
                if(token.byUser !== this.localPlayer.name){
                    const player : Player | undefined = this.players.find(p => p.name == token.byUser);
                    if(player === undefined){
                        continue;
                    }
                    this.drawPlayerTag(tokenPosition, tokenSize, player);
                }
            }
            
        }
    }

    private drawPings(tokenSize : Vector2, tokenOffset : Vector2){
        if(this.ctx === null) return;
        for(const ping of this.viewData.pingBuffer){
            const vectorPosition : Vector2 = new Vector2(ping.position.x, ping.position.y);
            const pingPosition : Vector2 = this.grid.tileToCanvas(this.viewOffset, vectorPosition, this.viewScale);
            const player : Player | undefined = this.players.find(p => p.name == ping.player);
            const padding : number = 16;
            pingPosition.translateBy(tokenOffset);
            if(player == undefined){
                continue;
            }
            this.ctx.strokeStyle = player.color;
            this.ctx.lineWidth = 4;
            this.drawRoundRect(pingPosition, tokenSize, false);
            pingPosition.translateBy(new Vector2(0, - tokenSize.getY() / 4 - padding * this.viewScale));
            this.drawPlayerTag(pingPosition, tokenSize, player);
        }
    }

    private drawTokenInDrag(tokenSize : Vector2){
        if(this.draggedToken === undefined){
            return;
        }
        for(const token of this.tokens){
            const spriteData = this.spriteCache.get(token.assetID);
            if(spriteData === undefined || spriteData.sprite === undefined){
                continue;
            }
            if(token.inDrag == true && token.byUser == this.localPlayer.name){
                const dragPosition = new Vector2(
                    this.cursorPosition.getX() - tokenSize.getX() / 2,
                    this.cursorPosition.getY() - tokenSize.getY() / 2
                );
                tokenSize.multiplyByScalar(this.draggedSizeMultiplier);
                this.drawToken(spriteData.sprite, dragPosition, tokenSize);
            }
        }
    }

    private drawRoundRect(position : Vector2, size : Vector2, fill : boolean){
        if(this.ctx === null) return;
        this.ctx.beginPath();
        this.ctx.roundRect(
            position.getX(),
            position.getY(),
            Math.floor(size.getX()),
            Math.floor(size.getY()),
            8);
        if(fill == true){
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }

    private drawToken(sprite : ImageBitmap, position : Vector2, size : Vector2){
        if(this.ctx === null) return;
        this.ctx.drawImage(
            sprite,
            position.getX(),
            position.getY(),
            Math.floor(size.getX()),
            Math.floor(size.getY()));
    }

    private drawPlayerTag(position : Vector2, tokenSize : Vector2, player : Player) : void{
        if(this.ctx === null) return;
        const textHeight : number = tokenSize.getY() / 4;
        this.ctx.font = `${textHeight}px Inter`;
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "left"
        const measurements : TextMetrics = this.ctx.measureText(player.name);
        this.ctx.fillStyle = player.color;
        const padding : number = textHeight / 2;
        this.drawRoundRect(
            new Vector2(position.getX() - padding / 2, position.getY() - padding / 2),
            new Vector2(measurements.width + padding, textHeight + padding), true);
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillText(player.name,position.getX(), position.getY());
    }

    private drawTokenTag(tokenPosition : Vector2, tokenSize : Vector2, tokenName : string) : void{
        if(this.ctx === null) return;
        const textHeight : number = tokenSize.getY() / 8;
        const padding : number = 4;
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = `${textHeight}px Inter`;
        this.ctx.shadowColor = "#000000"
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 2;
        this.ctx.shadowBlur = 3;
        this.ctx.fillText(tokenName,
            tokenPosition.getX() + tokenSize.getX() / 2,
            tokenPosition.getY() + tokenSize.getY() + padding * this.viewScale,
            tokenSize.getX());
        this.ctx.shadowColor = "#00000000"
        this.ctx.shadowBlur = 0;
    }

    private drawTokenStats(tokenPosition : Vector2, tokenSize : Vector2, tokenStats : Record<string,Stat>){
        if(this.ctx === null) return;
        const initialPadding : number = 2 * this.viewScale;
        const padding : number = tokenSize.getY() / 6;
        const drawPosition : Vector2 = tokenPosition.clone();
        const barHeight : number = tokenSize.getY() / 6;
        const textHeight : number = tokenSize.getY() / 10;
        const barSize : Vector2 = new Vector2(tokenSize.getX(), barHeight);
        drawPosition.translateY(-padding - initialPadding);
        for(const stat of Object.entries(tokenStats).reverse()){
            let shortenedName = stat[0];
            if(stat[0].length >= 5){
                shortenedName = `${stat[0].slice(0,4)}..`
            }
            const text : string = statToString(shortenedName.slice(0,6), stat[1]);
            const progressSize : Vector2 = barSize.clone();
            this.ctx.fillStyle = "#000000";
            this.ctx.globalAlpha = 0.7;
            this.drawRoundRect(drawPosition, barSize, true);
            if(stat[1].min !== undefined && stat[1].max !== undefined){
                progressSize.setX((stat[1].value - stat[1].min) / (stat[1].max - stat[1].min) * barSize.getX());
                this.ctx.fillStyle = "#303F9F";
                this.drawRoundRect(drawPosition, progressSize, true);
            }
            this.ctx.font = `${textHeight}px Inter`;
            this.ctx.globalAlpha = 1;
            this.ctx.textBaseline = "top";
            this.ctx.textAlign = "left";
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(text,
                drawPosition.getX() + padding / 2,
                drawPosition.getY() + (barSize.getY() - textHeight) / 2,
                tokenSize.getX() - padding);
            drawPosition.translateY(- barHeight - padding / 4);
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
        this.canvas.ondblclick = e => this.onDoubleClick(e);
        this.canvas.onkeydown = e => this.onKeyDown(e);
        this.canvas.onselectstart  = e => false;
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
        this.canvas.ondblclick = null;
        this.canvas.onkeydown = null;
        this.canvas.onselectstart = null;
        
    }

    private onKeyDown(e : KeyboardEvent){
        e.preventDefault();
        if(this.localPlayer.permissions["MANAGE_TOKENS"] == false){
            return;
        }
        if(e.key == "x" && e.ctrlKey == true && this.viewData.selectedToken !== undefined){
            this.deleteToken(this.viewData.selectedToken?.id);
        }else if(e.key == "c" && e.ctrlKey == true && this.viewData.selectedToken !== undefined){
            this.copyToken(this.viewData.selectedToken.id);
        }
    }

    private onDoubleClick(e : MouseEvent){
        e.preventDefault();
        const boundingRect = this.canvas.getBoundingClientRect();
        this.ping(this.grid.canvasToTile(
            this.viewOffset,
            new Vector2(e.clientX - boundingRect.x, e.clientY - boundingRect.y),
            this.viewScale
        )
        );
    }

    private onMouseUp(e : MouseEvent) : void{
        e.preventDefault();
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
        e.preventDefault();
        const boundingRect = this.canvas.getBoundingClientRect();
        this.cursorMoved(
        new Vector2(-e.movementX,-e.movementY),
        new Vector2(
            e.clientX - boundingRect.x,
            e.clientY - boundingRect.y));
    }

    private onWheelEvent(e : WheelEvent) : void{
        e.preventDefault();
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
        this.viewData.viewCenterPosition = this.grid.canvasToTile(this.viewOffset, new Vector2(
            this.canvas.width / 2,
            this.canvas.height / 2
        ), this.viewScale);
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


    private onDrop(e : DragEvent) : void{
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

    private onSelect(position : Vector2) : void{
        if(this.draggingView || this.draggedToken !== undefined){
            return;
        }
        const overlappedTile:Vector2 = this.grid.canvasToTile(this.viewOffset, position, this.viewScale);
        const overlappedToken:Token | undefined = 
            this.tokens.find(t => t.position.x == overlappedTile.getX() && t.position.y == overlappedTile.getY());
        this.viewData.selectedToken = overlappedToken != this.viewData.selectedToken ? overlappedToken : undefined;
    }

    private sendNewToken(id : number, name : string, position : Vector2) : void{
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

    private deleteToken(id : number) : void{
        this.serverPublisher.send({
            status : Status.TOKEN,
            command : Command.DELETE,
            content : {
                id : id
            }
        });
    }

    private copyToken(id : number) : void{
        this.serverPublisher.send({
            status : Status.TOKEN_COPY,
            command : Command.CREATE,
            content : {
                id : id
            }
        });
    }

    private ping(position : Vector2) : void{
        this.serverPublisher.send({
            status : Status.SCENE_PING,
            command : Command.CREATE,
            content : {
                position : position
            }
        });
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