type ensureType<T> = (object : unknown) => T;

const ensureString : ensureType<string> = (object : unknown) => {
    if (typeof object !== "string") throw Error("not a string");
    return object;
}

const ensureNumber : ensureType<number> = (object : unknown) => {
    if (typeof object !== "number") throw Error("not a number");
    return object;
}

const ensureBoolean : ensureType<boolean> = (object : unknown) => {
    if (typeof object !== "boolean") throw Error("not a boolean");
    return object;
}

const ensureGenericObject : ensureType<any> = (object : unknown) => {
    if (typeof object !== "object") throw Error("not an object");
    return object;
}

const ensureEnumLike = (permittedValues : Array<number>) => (object : unknown) => {
    if (typeof object !== "number") throw Error("not a number");
    if (!permittedValues.includes(object)) throw Error("not a valid enum value");
    return object;
}

const weakEnsureOf = <T>(ensureOtherType : ensureType<T>) => (object : unknown) => {
    try{
        return ensureOtherType(object);
    } catch(e) {
        if (typeof object !== undefined){
            throw Error("not undefined or of the desired type");
        }
        return undefined;
    }
}

const ensureArrayOf = <T>(ensureInnerType : ensureType<T>) => (object : unknown) : T[] => {
    if (!Array.isArray(object)) throw Error("not an array");
    return object.map(ensureInnerType);
}

const ensureObject = <T extends Record<string, ensureType<any>>>(ensureObject : T) => 
    (object : unknown) : {[K in keyof T] : ReturnType<T[K]>} => {
        if (typeof object !== "object" || object === null) throw Error("not an object / object is null");
        const toReturn : {[K in keyof T] : ReturnType<T[K]>} = {} as any;
        for (const key in object){
            if (ensureObject.hasOwnProperty(key)) throw Error("invalid key")
        }
        for (const key in ensureObject){
            toReturn[key] = ensureObject[key]((object as any)[key]);
        }
        return toReturn;
    }

const ensureMapObject = <V>(ensureValueType : ensureType<V>) => 
    (object : unknown) : Record<string,V> => {
        if (typeof object !== "object" || object === null) throw Error("not a map / object is null");
        const toReturn : Record<string,V> = {} as any;
        for (const key in object){
            toReturn.key = ensureValueType((object as any)[key])
        }
        return toReturn;
}