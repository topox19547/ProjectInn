/** class that represents a color, formatted as hexadecimal*/
export class Color{
    private color:string;
    private readonly defaultColor:string = "#FFFFFF"
    private readonly validityChecker:RegExp

    constructor(){
        this.color = this.defaultColor;
        this.validityChecker = new RegExp("/^#?([a-f0-9]{6}|[a-f0-9]{3})$/"); //from https://gist.github.com/daxburatto/307e8365c41fd5401f9ac315676490bf
    }

    setColor(color:string):boolean{
        if(this.validityChecker.test(color)){
            this.color = color;
            return true;
        }
        return false;
    }
}