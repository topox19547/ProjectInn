/**
 * class representing a vector with two components
 * a few useful methods added for convenience
 */
export class Vector2{
    private x:number;
    private y:number;

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }

    public getX():number{
        return this.x;
    }

    public getY():number{
        return this.y;
    }

    public setY(y:number){
        this.y = y;
    }

    public setX(x:number){
        this.x = x;
    }

    public translateX(increment:number){
        this.x += increment;
    }

    public translateY(increment:number){
        this.y += increment;
    }
    
    public translateBy(vector:Vector2){
        this.translateX(vector.getX());
        this.translateY(vector.getY());
    }

    public multiplyByScalar(number:number){
        this.setX(this.getX() * number);
        this.setY(this.getY() * number);
    }

    public equals(vector:Vector2):boolean{
        return vector.getX() == this.getX() && vector.getY() == this.getY();
    }

    public clone():Vector2{
        return new Vector2(this.x,this.y);
    }
}