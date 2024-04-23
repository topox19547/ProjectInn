/**
 * custom map implemented using two arrays.
 * it uses Vector2 objects as key and compares them
 * through their equals method. this couldn't have been
 * done using the native Map object due to it only supporting
 * comparison by reference.
 */

import { Vector2 } from "./Vector2";

export class Vector2Map<T>{
    private keys:Array<Vector2>;
    private values:Array<T>;
    
    constructor(){
        this.keys = new Array<Vector2>();
        this.values = new Array<T>();
    }

    public getKeys():Array<Vector2>{
        return [...this.keys];
    }

    public getValues():Array<T>{
        return [...this.values];
    }

    public getEntries(){
        let entries:Array<{vec:Vector2,t:T}> = new Array();
        console.log(this.keys[0]);
        for(let i = 0; i < this.keys.length; i++){
            entries.push({vec:this.keys[i],t:this.values[i]});
        }
        return entries;
    }

    public get(key:Vector2):T|undefined{
        const index:number = this.keys.findIndex((vec:Vector2) => vec.equals(key));
        if(index == -1){
            return undefined;
        }
        return this.values[index];
    }

    public set(key:Vector2, t:T):void{
        const index:number = this.keys.findIndex((vec:Vector2) => vec.equals(key));
        if(index == -1){
            this.keys.push(key);
            this.values.push(t);
        }
        else{
            this.values[index] = t;
        }
    }
    public remove(key:Vector2):boolean{
        const index:number = this.keys.findIndex((vec:Vector2) => vec.equals(key));
        if(index == -1){
            return false;
        }
        this.keys.splice(index,1);
        this.values.splice(index,1);
        return true;
    }

    public has(key:Vector2):boolean{
        const index:number = this.keys.findIndex((vec:Vector2) => vec.equals(key));
        return index != -1;
    }
}