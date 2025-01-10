
/** defines the user permissions 
* MANAGE_TOKENS: allows the user to move and modify all tokens, regardless of whether they are assigned to the user or not. 
* It also gives the user the ability to create assets, create new tokens, and copy or delete existing tokens.
* MANAGE_SCENES: allows the user to create, edit or delete existing scenes, and to choose the current scene.
* MASTER (Dungeon Master): gives the user the two permissions listed above, and in addition provides the ability to 
* change the permissions of all users (except the creator and other DM users), 
* remove a player from the game (again following the criterion stated above),
* and change certain settings.
*/
export enum Permission{
    MASTER,
    MANAGE_TOKENS,
    MANAGE_SCENES
}