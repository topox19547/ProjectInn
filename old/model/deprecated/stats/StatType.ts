
abstract class StatType<T>{
    private readonly name:string;
    private readonly instances:Array<StatInstance<T,StatType<T>>>;

    constructor(name:string){
        this.name = name;
        this.instances = new Array<StatInstance<T,StatType<T>>>;
    }
     /**
     * @returns the name of the stat type
     */
     public getName():string{
        return this.name;
    }

    protected abstract getInstances<V extends StatType<T>>():Array<StatInstance<T, V>>

    public abstract isValueValid(value:T):boolean
}