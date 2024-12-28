export interface GlobalSettings{
    showNames : boolean
    showStats : boolean
}

export function getDefaultGlobalSettings() : GlobalSettings{
    return {
        showNames : false,
        showStats : false
    }
}