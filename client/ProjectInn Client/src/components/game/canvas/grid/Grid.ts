import { Vector2 } from "../../../../types/Vector2.js";

//interface used to implement different grid management strategies
export interface Grid{
    drawGrid(canvas:HTMLCanvasElement,viewOffset:Vector2,viewScale:number):void;
    canvasToTile(viewOffset:Vector2,position:Vector2,viewScale:number):Vector2;
    tileToCanvas(viewOffset:Vector2,tile:Vector2,viewScale:number):Vector2;
    getTileOffset():Vector2;
    getTokenSize(viewScale : number):Vector2;
    getTokenOffset(viewScale : number):Vector2;
    setLineColor(color:string):void;
    getLineWidth():number;
}