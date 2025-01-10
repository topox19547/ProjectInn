/**
 * defines an object that can be identified through an ID
 */
export interface Identifiable{
    getID() : number
    setID(id : number) : void
}