/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormatError } from "../../errors/FormatError.js";

/**
 * Library of functions that can be used to compose typeguards for complex objects
 */

export type ensureType<T> = (object : unknown) => T;

export const ensureString : ensureType<string> = (object : unknown) => {
    if (typeof object !== "string") throw new FormatError("not a string");
    return object;
}

export const ensureNumber : ensureType<number> = (object : unknown) => {
    if (typeof object !== "number") throw new FormatError("not a number");
    return object;
}

export const ensureBoolean : ensureType<boolean> = (object : unknown) => {
    if (typeof object !== "boolean") throw new FormatError("not a boolean");
    return object;
}

export const ensureGenericObject : ensureType<any> = (object : unknown) => {
    if (typeof object !== "object") throw new FormatError("not an object");
    return object;
}

export const ensureEnumLike = (permittedValues : Array<number>) => (object : unknown) => {
    if (typeof object !== "number") throw new FormatError("not a number");
    if (!permittedValues.includes(object)) throw new FormatError("not a valid enum value");
    return object;
}

export const ensureStringEnumLike = (permittedValues : Array<string>) => (object : unknown) => {
    if (typeof object !== "string") throw new FormatError("not a number");
    if (!permittedValues.includes(object)) throw new FormatError("not a valid enum value");
    return object;
}

export const weakEnsureOf = <T>(ensureOtherType : ensureType<T>) => (object : unknown) => {
    try{
        return ensureOtherType(object);
    } catch {
        if (typeof object !== "undefined"){
            throw new FormatError("not undefined or of the desired type");
        }
        return undefined;
    }
}

export const ensureArrayOf = <T>(ensureInnerType : ensureType<T>) => (object : unknown) : T[] => {
    if (!Array.isArray(object)) throw new FormatError("not an array");
    return object.map(ensureInnerType);
}

export const ensureObject = <T extends Record<string, ensureType<any>>>(ensureObject : T) => 
    (object : unknown) : {[K in keyof T] : ReturnType<T[K]>} => {
        if (typeof object !== "object" || object === null) throw new FormatError("not an object / object is null");
        const toReturn : {[K in keyof T] : ReturnType<T[K]>} = {} as any;
        for (const key in object){
            if (!ensureObject.hasOwnProperty(key)) throw new FormatError(`invalid key ${key}`)
        }
        for (const key in ensureObject){
            toReturn[key] = ensureObject[key]((object as any)[key]);
        }
        return toReturn;
    }

export const ensureMapObject = <V>(ensureValueType : ensureType<V>) => 
    (object : unknown) : Record<string,V> => {
        if (typeof object !== "object" || object === null) throw new FormatError("not a map / object is null");
        const toReturn : Record<string,V> = {} as any;
        for (const key of Object.keys(object)){
            toReturn[key] = ensureValueType((object as any)[key])
        }
        return toReturn;
}