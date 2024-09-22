/**
 * class that represents a type (as in, a way to aggregate information
 * about a token instance, which shares its name and default value
 * with "stat instances" on other tokens) for a text based stat instance
 */

class NumericStatType extends StatType<number>{
    private readonly defaultValue:number;
    private readonly viewMode:ViewMode;
    private minimumValue?:number;
    private maximumValue?:number;

    constructor(name:string, defaultValue:number,
        viewMode:ViewMode,minimumValue?:number,
        maximumValue?:number){
        super(name);
        this.defaultValue = defaultValue;
        this.minimumValue = minimumValue;
        this.maximumValue = maximumValue;
        this.viewMode = viewMode;
    }

    /**
     * @returns the default value
     */
    public getDefaultValue():number{
        return this.defaultValue;
    }

    /**
     * getter for the minimum value
     * @returns the minimum value, if present
     */
    public getMinimumValue():number|undefined{
        return this.minimumValue;
    }

    /**
     * getter for the maximum value
     * @returns the maximum value, if present
     */
    public getMaximumValue():number|undefined{
        return this.maximumValue;
    }

    /**
     * sets a new minimum value. fails if the value is bigger
     * than the default one
     * @param minimumValue the new minimum value
     * @returns whether the operation was completed successfully
     */
    public setMinimumValue(minimumValue:number):boolean{
        if(this.defaultValue < minimumValue){
            return false;
        }
        //TODO: ALSO UPDATE THE INSTANCES WHENEVER THE MAX IS CHANGED
        this.minimumValue = minimumValue
        return true;
    }

    /**
     * sets a new maximum value. fails if the value is smaller
     * than the default one
     * @param maximumValue the new maximum value
     * @returns whether the operation was completed successfully
     */
    public setMaximumValue(maximumValue:number):boolean{
        if(this.defaultValue > maximumValue){
            return false;
        }
        //TODO: ALSO UPDATE THE INSTANCES WHENEVER THE MAX IS CHANGED
        this.maximumValue = maximumValue
        return true;
    }

    public isValueValid(value: number): boolean {
        return (this.maximumValue == undefined || value <= this.maximumValue)
            && (this.minimumValue == undefined || value >= this.minimumValue);
    }

    /**
     * retrieves how the stat is meant to be shown
     * @returns the current view mode
     */
    public getViewMode():ViewMode{
        return this.viewMode;
    }
}