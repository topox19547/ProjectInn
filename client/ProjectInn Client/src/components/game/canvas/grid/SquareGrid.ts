import { Vector2 } from "../../../../types/Vector2.js";
import type { Grid } from "./Grid.js";

//implements a square grid for the BoardView
export class SquareGrid implements Grid{
    private tileSize:number;
    private tileOffset:Vector2;
    private color:string;
    private readonly lineWidth:number;
    

    constructor(tileSize:number, tileOffset:Vector2, lineWidth:number){
        //prevent offsets bigger than the tilesize itself to avoid issues with token placement
        this.tileOffset = new Vector2(tileOffset.getX() % tileSize,tileOffset.getY() % tileSize);
        this.tileSize = tileSize;
        this.lineWidth = lineWidth;
        this.color = "#111111";
    }

    public setLineColor(color: string): void {
        this.color = color;
    }

    public getTileOffset(): Vector2 {
        return this.tileOffset.clone();
    }

    public drawGrid(canvas: HTMLCanvasElement, viewOffset: Vector2, viewScale:number): void {
        let ctx:CanvasRenderingContext2D | null = canvas.getContext("2d");
        if(ctx === null){
            return;
        }
        const gridOffsetX:number = (-this.tileOffset.getX() - viewOffset.getX() % (this.tileSize)) * viewScale;
        const gridOffsetY:number = (-this.tileOffset.getY() - viewOffset.getY() % (this.tileSize)) * viewScale;
        const endX:number = canvas.width + this.lineWidth;
        const endY:number = canvas.height + this.lineWidth;
        ctx.strokeStyle = this.color;
        //draw the horizontal lines
        for(let i:number = gridOffsetY; i < endY; i += this.tileSize * viewScale){
            ctx.fillRect(0,i,canvas.width,this.lineWidth);
        }
        //draw the vertical lines
        for(let i:number = gridOffsetX; i < endX; i += this.tileSize * viewScale){
            ctx.fillRect(i,0,this.lineWidth,canvas.height);
        }
    }

    public canvasToTile(viewOffset: Vector2, position: Vector2, viewScale:number):Vector2{
        const tilesUntilPositionX:number = Math.floor(
            ((this.tileOffset.getX() + viewOffset.getX() + position.getX() / viewScale) / this.tileSize));
        const tilesUntilPositionY:number = Math.floor(
            ((this.tileOffset.getY() + viewOffset.getY() + position.getY() / viewScale) / this.tileSize));
        return new Vector2(tilesUntilPositionX,tilesUntilPositionY);
    }

    public tileToCanvas(viewOffset: Vector2, tile: Vector2, viewScale:number):Vector2{
        const canvasPositionX:number = 
            (tile.getX() * this.tileSize - viewOffset.getX() - this.tileOffset.getX()) * viewScale;
        const canvasPositionY:number = 
            (tile.getY() * this.tileSize - viewOffset.getY() - this.tileOffset.getY()) * viewScale;
        return new Vector2(canvasPositionX, canvasPositionY);
    }

    public getTokenSize(viewScale : number): Vector2 {
        return new Vector2(
            this.tileSize  * viewScale - this.lineWidth,
            this.tileSize  * viewScale - this.lineWidth,
        );
    }

    public getTokenOffset(viewScale: number): Vector2 {
        return new Vector2(this.lineWidth,this.lineWidth);
    }

    public getLineWidth(): number {
        return this.lineWidth;
    }
}