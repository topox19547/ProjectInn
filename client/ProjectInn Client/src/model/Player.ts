
export interface Player{
    name : string
    color : string
    isOwner : boolean
    permissions : Record<string, boolean>
    connected : boolean
}

export function getStartingPlayerData(){
    return {
        name: "",
        color : "#784cff",
        permissions : {},
        connected : false,
        isOwner : false
    };
}
