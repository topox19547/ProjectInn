/**
 * Enum that represents all the possible permissions that a user can have.
 * every permission has a specific list of scopes where it can be applied, specified at the end of each line here
 */

export enum Permission{
    KICK, //Permission that lets the user kick other users (excluding the game master) (GLOBAL)
    MAP_MOD, //Permission that lets the user change to another map (GLOBAL)
    TOKEN_TYPE_CREATE, //Permission that lets a user create or delete token types (GLOBAL)
    TOKEN_CREATE,/*Permission that lets the user manage instances of a certain token type (GLOBAL, TYPE)
    this can also be applied to specific token types so that a user may only
    create or delete tokens of that type*/
    ATTRIBUTE_CREATE, /*Permission that lets the user create or delete attributes (GLOBAL, TYPE, INSTANCE)
    this can also be applied to specific token types/instances so that a user may only
    create or delete tokens of that type*/
    ATTRIBUTE_CHANGE, //Permission to modify the value of an attribute (GLOBAL, TYPE, INSTANCE)
    TOKEN_MOVE, //Permission to move the token instances (GLOBAL, TYPE, INSTANCE)
    DICE_ROLL //Permission to roll the dice (GLOBAL)
}