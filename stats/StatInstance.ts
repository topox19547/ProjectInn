/**
 * Generic class that represents the instance of a text type.
 * every StatInstance requires a ValueChecker, usually provided by the stat type itself,
 * that is called by the setter to verify whether the provided value respects the constraints
 * set at the type level.
 * T is the type of the value held by the statInstance, V is the StatType class to utilize.
 */

export class StatInstance<T,V>{
    private value:T;
    private statType:V;
    private valueChecker:(t:T) => boolean;

    /**
     * constructor for StatInstance
     * @param value the starting value
     * @param statType the StatType for this instance
     * @param valueChecker the method that checks for the validity of a given value
     *                      usually provided by the StatType class itself
     */
    constructor(value:T,statType:V,valueChecker:(t:T) => boolean){
        this.value = value;
        this.statType = statType;
        this.valueChecker = valueChecker;
    }
    
    /**
     * @returns the value kept by this instance
     */
    public getValue():T{
        return this.value;
    }

    /**
     * set the given value, if considered valid by the valueChecker
     * @param value the value to set
     * @returns whether it has been set or not
     */
    public setValue(value:T):boolean{
        if (this.valueChecker(value)){
            this.value = value;
            return true;
        }
        return false;
    }

    /**
     * @returns the StatType for this instance
     */
    public getStatType():V{
        return this.statType;
    }
}
