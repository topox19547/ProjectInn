/**
 * class used to manage the StatTypes for an object
 */

export class StatTypesStorage{
    private textStatTypes:Array<TextStatType>
    private numericStatTypes:Array<NumericStatType>

    constructor(){
        this.textStatTypes = new Array<TextStatType>;
        this.numericStatTypes = new Array<NumericStatType>;
    }

    public getTextStatTypes():Array<TextStatType>{
        return [...this.textStatTypes];
    }

    public addTextStatType(statType:TextStatType):void{
        this.textStatTypes.push(statType);
    }

    public removeTextStatType(statType:TextStatType):void{
        const index:number = this.textStatTypes.indexOf(statType)
        if(index != -1){
            this.textStatTypes.splice(index,index)
        }
    }

    public getNumericStatTypes():Array<NumericStatType>{
        return [...this.numericStatTypes];
    }

    public addNumericStatType(statType:NumericStatType):void{
        this.numericStatTypes.push(statType);
    }

    public removeNumericStatType(statType:NumericStatType):void{
        const index:number = this.numericStatTypes.indexOf(statType)
        if(index != -1){
            this.numericStatTypes.splice(index,index)
        }
    }

    /**
     * create a clone of the StatTypesStorage instance
     * @returns a clone of the StatTypesStorage instance the method was called on
     */
    public clone():StatTypesStorage{
        const newSTS:StatTypesStorage = new StatTypesStorage();
        newSTS.textStatTypes = [...this.textStatTypes];
        newSTS.numericStatTypes = [...this.numericStatTypes];
        return newSTS;
    }
}