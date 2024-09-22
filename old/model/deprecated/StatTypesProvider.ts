import { Provider } from "./Provider";
import { StatTypesStorage } from "./stats/StatTypesStorage";

export interface StatTypesProvider extends Provider{
    /**
     * gets a copy of the local Stat Types for an object
     */
    getLocalStatTypes():StatTypesStorage;
    /**
     * sets the new StatTypeStorage instance for the object
     * @param statTypeStorage the StatTypeStorage instance to set
     */
    setLocalStatTypes(statTypeStorage:StatTypesStorage):void;
}