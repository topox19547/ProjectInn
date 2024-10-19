class Stat{
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
        this.max = max;
        this.value = value;
    }

    public static toObject(stat : Stat) : ReturnType<typeof this.validate> {
        return { min : stat.min, max : stat.max, value : stat.value};
    }

    public getValue() : number{
        return this.value;
    }

    public setValue(value : number) : void{
        this.value = value;
    }

    public getMin() : number | undefined{
        return this.min;
    }

    public setMin(min : number | undefined) : void{
        this.min = min;
        min != undefined && this.value < min ? this.value = min : this.value = this.value;
    }

    public getMax() : number | undefined{
        return this.max;
    }

    public setMax(max : number | undefined) : void{
        this.max = max;
        this.value = max != undefined && this.value > max ? max : this.value;
    }
}
