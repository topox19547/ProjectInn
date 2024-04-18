/**
 * class that represents a type (as in, a way to aggregate information
 * about a token instance, which shares its name and default value
 * with "stat instances" on other tokens) for a text based stat instance
 */

class NumericStatType{
    private name:string;
    private defaultValue:number;
    private minimumValue?:number;
    private maximumValue?:number;
    private viewMode:ViewMode;

    constructor(name:string, defaultValue:number,
        viewMode:ViewMode,minimumValue?:number,
        maximumValue?:number){
        this.name = name;
        this.defaultValue = defaultValue;
        this.minimumValue = minimumValue;
        this.maximumValue = maximumValue;
        this.viewMode = viewMode;
    }

     /**
     * @returns the name of the stat type
     */
    public getName():string{
        return this.name;
    }

    /**
     * @param name the new name of the stat type
     */
    public setName(name:string){
        this.name = name;
    }

    /**
     * @returns the default value
     */
    public getDefaultValue():number{
        return this.defaultValue;
    }

    /**
     * sets the default value to a new one, if it is
     * between the maximum and the minimum value
     * @param defaultValue the new default value
     * @returns whether the operation was completed successfully
     */
    public setDefaultValue(defaultValue:number):boolean{
        if(this.minimumValue && defaultValue < this.minimumValue){
            return false;
        }
        if(this.maximumValue && defaultValue > this.maximumValue){
            return false;
        }
        this.defaultValue = defaultValue;
        return true;
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
        //TODO: ALSO UPDATE THE Textstat INSTANCES WHENEVER THE MAX IS CHANGED
        this.maximumValue = maximumValue
        return true;
    }

    /**
     * retrieves how the stat is meant to be shown
     * @returns the current view mode
     */
    public getViewMode():ViewMode{
        return this.viewMode;
    }

    /**
     * change how the stat is meant to be shown on the player's view
     * @param viewMode the view mode it will be changed to
     * @returns whether the operation was completed successfully
     */
    public setViewMode(viewMode:ViewMode):boolean{
        if(!this.maximumValue){
            return false;
        }
        this.viewMode = viewMode;
        return true;
    }
}