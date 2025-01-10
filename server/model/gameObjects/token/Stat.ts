import { ensureObject, weakEnsureOf, ensureNumber } from "../../messages/Validators.js";


/**
 * Defines a token's stat
 */
export class Stat{
    private min : number | undefined;
    private max : number | undefined;
    private value : number;
    public static readonly validate = ensureObject({
        min : weakEnsureOf(ensureNumber),
        max : weakEnsureOf(ensureNumber),
        value : ensureNumber
    })

    constructor(value : number, min? : number, max? : number){
        this.min = min;  
        if(max != undefined && min != undefined){
            this.max = max >= min ? max : min; 
        } else{
            this.max = max;
        }
        this.value = value;
        this.value = max != undefined && this.value > max ? max : this.value;
        this.value = min != undefined && this.value < min ? min : this.value;
    }

    public static toObject(stat : Stat) : ReturnType<typeof this.validate> {
        return { min : stat.min, max : stat.max, value : stat.value};
    }

    public getValue() : number{
        return this.value;
    }

    public getMin() : number | undefined{
        return this.min;
    }

    public getMax() : number | undefined{
        return this.max;
    }
}
