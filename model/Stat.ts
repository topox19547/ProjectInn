class Stat{
    private min : number | undefined;
    private max : number | undefined;
    private value : number;

    constructor(min : number, max : number, value : number){
        this.min = min;
        this.max = max;
        this.value = value;
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

    public setMax(max : number | undefined){
        this.max = max;
        this.value = max != undefined && this.value > max ? max : this.value;
    }
}