/** class that represents a color, formatted as hexadecimal*/
export class Color{
    private color:string;
    private readonly defaultColor:string = "#FFFFFF"
    private readonly validityChecker:RegExp

    constructor(color:string){
        this.validityChecker = new RegExp("^#(?:[0-9a-fA-F]{3,4}){1,2}$"); //from https://gist.github.com/daxburatto/307e8365c41fd5401f9ac315676490bf
        this.color = this.validityChecker.test(color) ? color : this.defaultColor;
    }

    public getColor():string{
        return this.color;
    }
}