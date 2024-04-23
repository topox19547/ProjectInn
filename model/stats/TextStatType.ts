/**
 * class that represents a type (as in, a way to aggregate information
 * about a token instance, which shares its name and default value
 * with "stat instances" on other tokens) for a text based stat instance
 */

class TextStatType{
    private defaultValue:string;
    private name:string;
    private readonly maxLength:number;

    constructor(name:string, defaultValue:string){
        this.name = name;
        this.defaultValue = defaultValue;
        this.maxLength = 140;
    }

    /**
     * @returns the current default value
     */
    public getDefaultValue():string{
        return this.defaultValue;
    }

    /**
     * @returns the current name
     */
    public getName(){
        return this.name;
    }

    /**
     * @param defaultValue the new name
     */
    public setName(name:string){
        this.name = name;
    }

    /**
     * @param defaultValue the new default value
     */
    public setDefaultValue(defaultValue:string):void{
        this.defaultValue = defaultValue;
    }

    /**
     * checks if the given value is less than the maximum length
     * @param value the string to check
     * @returns whether it is shorter than the maximum length
     */
    public isValueValid(value:string):boolean{
        return value.length < this.maxLength;
    }
}