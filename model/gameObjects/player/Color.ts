/** class that represents a color, formatted as hexadecimal*/
class Color{
    private color:string;
    private readonly defaultColor:string = "#FFFFFF"
    private readonly validityChecker:RegExp

    constructor(color:string){
        this.validityChecker = new RegExp("/^#?([a-f0-9]{6}|[a-f0-9]{3})$/"); //from https://gist.github.com/daxburatto/307e8365c41fd5401f9ac315676490bf
        this.color = this.validityChecker.test(color) ? color : this.defaultColor;
    }

    public getColor():string{
        return this.color;
    }
}