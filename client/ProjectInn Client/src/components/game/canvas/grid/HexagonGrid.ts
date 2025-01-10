import { Vector2 } from "../../../../types/Vector2.js";
import type { Grid } from "./Grid.js";

//implements an hexagonal grid for the BoardView
export class HexagonGrid implements Grid{
    private tileHeight:number; //height of the hexagon
    private tileWidth:number;
    private tileOffset:Vector2;
    private color:string;
    private hexagonPoints:Array<Vector2>;
    private readonly lineWidth:number;
    
    constructor(tileWidth:number, tileOffset:Vector2, lineWidth:number){
        //prevent offsets bigger than the tilesize itself to avoid issues with token placement
        this.tileWidth = tileWidth;
        this.tileHeight = tileWidth * Math.sqrt(3) / 2;
        this.tileOffset = new Vector2(
            tileOffset.getX() % (this.tileWidth * 3 / 2),
            tileOffset.getY() % (this.tileHeight));
        this.lineWidth = lineWidth;
        this.color = "#111111";
        this.hexagonPoints = new Array();
        for(let offset = 0; offset < 2 * Math.PI; offset += Math.PI / 3){//1/6 of 2PI
            const nextPoint : Vector2 = new Vector2(Math.sin(Math.PI / 6 + offset),Math.cos(Math.PI / 6 + offset));
            this.hexagonPoints.push(nextPoint);
        }
    }
    
    public setLineColor(color: string): void {
        this.color = color;
    }

    public getTileOffset(): Vector2 {
        return this.tileOffset.clone();
    }

    public drawGrid(canvas: HTMLCanvasElement, viewOffset: Vector2, viewScale: number): void {
        let ctx:CanvasRenderingContext2D | null = canvas.getContext("2d");
        if(ctx === null){
            return;
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        const xDistBetweenCenters = this.tileWidth * 3 / 4;
        const xDistBeforeReTile = this.tileWidth + this.tileWidth / 2;
        let gridOffsetX:number = 
            (-this.tileOffset.getX() - viewOffset.getX() % (xDistBeforeReTile) - this.tileWidth / 2);
        let gridOffsetY:number = 
            (-this.tileOffset.getY() - viewOffset.getY() % (this.tileHeight) - this.tileHeight / 2);
        gridOffsetX = gridOffsetX * viewScale;
        gridOffsetY = gridOffsetY * viewScale;
        const endX:number = canvas.width + this.tileWidth * 2;
        const endY:number = canvas.height + this.tileHeight * 2;
        const scaledPoints : Array<Vector2> = new Array();
        this.hexagonPoints.forEach(p => {
            const newPoint : Vector2 = p.clone();
            newPoint.multiplyByScalar((this.tileWidth / 2) * viewScale);
            scaledPoints.push(newPoint);
        });
        ctx.beginPath();
        for(let c:number = -3; c * (xDistBetweenCenters * viewScale) < endX; c++){
            for(let y:number = gridOffsetY; y < endY; y += this.tileHeight * viewScale){
                const x = gridOffsetX + (this.tileWidth / 2 + ((xDistBetweenCenters) * c * 2) ) * viewScale;
                let center : Vector2 = new Vector2(x, y);   
                this.drawShape(center, ctx, scaledPoints);
                center = new Vector2(
                    x + xDistBetweenCenters * viewScale, 
                    y + this.tileHeight / 2 * viewScale);
                this.drawShape(center, ctx, scaledPoints);             
            } 
        }
        ctx.stroke();
    }

    public canvasToTile(viewOffset: Vector2, position: Vector2, viewScale: number): Vector2 {
        //First, check which "square" the position is in
        //If it is in more than one rect, compare the distances between the centers of each heaxagon and choose the closest 
        const overlaps : Array<Vector2> = [
            this.getOverlappedSquareTiles(0, position, viewScale, viewOffset),
            this.getOverlappedSquareTiles(- 1 / 4 * this.tileWidth, position, viewScale, viewOffset)];
        let bestDistance : number = -1;
        let tile : Vector2 = new Vector2(0,0);
        if(overlaps[0].equals(overlaps[1])){
            return overlaps[0];
        }
        overlaps.forEach(v => {
            const tilePosition = this.tileToCanvas(viewOffset, v, viewScale);
            tilePosition.translateBy(new Vector2(
                this.tileWidth / 2 * viewScale, this.tileHeight / 2 * viewScale));
            //get the tile's center
            const distance : number = position.distanceTo(tilePosition);
            if(bestDistance == -1 || distance < bestDistance){
                bestDistance = distance;
                tile = v
            }
        })
        return tile;
    }

    public tileToCanvas(viewOffset: Vector2, tile: Vector2, viewScale: number): Vector2 {
        let x : number = (tile.getX() * this.tileWidth * 3 / 4);
        let y : number = (tile.getY() * this.tileHeight); 
        y = tile.getX() % 2 == 0 ? y : y + this.tileHeight / 2;
        x -= viewOffset.getX() + this.tileOffset.getX();
        y -= viewOffset.getY() + this.tileOffset.getY();
        //x += this.tileWidth / 2;
        //y += this.tileHeight / 2;
        x *= viewScale;
        y *= viewScale;
        return new Vector2(x,y);
    }

    public getTokenSize(viewScale : number): Vector2{
        return new Vector2(
            this.tileWidth * 3 / 4 * viewScale - this.lineWidth, 
            this.tileWidth * 3 / 4 * viewScale - this.lineWidth,
        );// 3/4 instead of full width to help square tokens fit the grid better
    }

    public getTokenOffset(viewScale : number): Vector2 {
        return new Vector2(
            this.lineWidth + this.tileWidth / 8 * viewScale,
            this.lineWidth + this.tileWidth / 16 * viewScale
        );//1/8 and 1/16 of the width are the coordinates where the top left of the token should be
        //if we need it to be centered 
    }

    public getLineWidth(): number {
        return this.lineWidth;
    }

    private drawShape(position : Vector2, ctx : CanvasRenderingContext2D, points : Array<Vector2>){
        position.translateBy(this.hexagonPoints[0]);
        ctx.moveTo(position.getX(), position.getY());
        points.forEach(p => {
            position.translateBy(p);
            ctx.lineTo(position.getX(),position.getY());
            ctx.moveTo(position.getX(),position.getY());
        });
    }

    private getOverlappedSquareTiles(
        gridOffsetX : number,
        position : Vector2,
        viewScale : number,
        viewOffset : Vector2) : Vector2{
        //using squares which are 3/4 the width of the hexagons, we can be sure that if a position is inside
        //the square it must be part of one of the two hexagons.
        const virtualTileWidth = this.tileWidth * 3 / 4;
        const scaledXPosition = position.getX() / viewScale;
        const scaledYPosition = position.getY() / viewScale;
        const tilesUntilPositionX = Math.floor(
            (this.tileOffset.getX() + viewOffset.getX() + gridOffsetX + scaledXPosition) / virtualTileWidth);
        let tilesUntilPositionY;
        if(tilesUntilPositionX % 2 == 0 ){
            tilesUntilPositionY = 
                Math.floor((this.tileOffset.getY() + viewOffset.getY() + scaledYPosition) / this.tileHeight);
        } else {
            tilesUntilPositionY = 
                Math.round((this.tileOffset.getY() + viewOffset.getY() + scaledYPosition) / this.tileHeight) - 1;
        }
        return new Vector2(tilesUntilPositionX, tilesUntilPositionY);
    }
}