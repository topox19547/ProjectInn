class PermissionError extends Error{
    constructor(){
        super("You don't have the permission to do this action.");
    }
}