export class FormatError extends Error{
    constructor(specific : string){
        super(`An error occurred while parsing the object's format. ${specific}`);
    }
}