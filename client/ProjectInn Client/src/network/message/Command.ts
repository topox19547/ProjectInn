export enum Command{
    CREATE, //The command will create something
    DELETE, //The command will delete something
    MODIFY, //The command will fail if it doesn't exist
    NONE //This command won't modify the state of any element
}