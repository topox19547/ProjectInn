import { ensureObject, weakEnsureOf, ensureNumber } from "../../messages/Validators";

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
        this.max = max != undefined && min != undefined && max >= min ? max : min; 
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
