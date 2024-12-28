export interface Stat{
    min? : number
    max? : number
    value : number
}


export function statToString(name : string, stat : Stat) : string{
    if(stat.max !== undefined && stat.min !== undefined){
        return `${name}: ${ stat.min == 0 ? '' : stat.min + ' / ' } ${stat.value} / ${stat.max}`
    } else if (stat.max !== undefined && stat.min === undefined){
        return `${ name }: ${stat.value} / ${stat.max}`
    } else {
        return `${ name }: ${stat.value}`
    }
}