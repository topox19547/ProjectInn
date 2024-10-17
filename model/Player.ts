class Player{
    private readonly name : string;
    private readonly color : Color;
    private readonly permissions : Map<Permission, boolean>;
    private readonly maxNameLength : number;
    public static readonly validate = ensureObject({
        name : ensureString,
        color : ensureString,
        permissions : ensureMapObject(ensureBoolean)
    })

    constructor(name : string, color : Color){
        this.name = name;
        this.color = color;
        this.permissions = new Map<Permission, boolean>;
        let i : number = 0;
        for(const _ in Permission){
            this.permissions.set(i,false);
            i++;
        }
        this.maxNameLength = 24;
    }

    public static fromObject(object : ReturnType<typeof this.validate>) : Player{
        const player : Player = new Player(object.name, new Color(object.color));
        let i : number = 0;
        for(const key in Permission){
            player.setPermission(i, object.permissions[key] != undefined ? object.permissions[key] : false);
            i++;
        }
        return player;
    }

    public static toObject(player : Player) : ReturnType<typeof this.validate>{
        const permissions : Record<string,boolean> = {}
        for(const [key,value] of player.permissions){
            permissions[key] = value
        }
        return {
            name : player.name,
            color : player.color.getColor(),
            permissions : permissions
        }
    }

    public getName() : string{
        return this.name;
    }

    public getMaxNameLength() : number{
        return this.maxNameLength;
    }

    public getColor() : Color{
        return this.color;
    }

    public hasPermission(permission : Permission) : boolean{
        const hasPermission : boolean | undefined = this.permissions.get(permission);
        return hasPermission != undefined && hasPermission;
    }

    public setPermission(permission : Permission, value : boolean){
        this.permissions.set(permission, value);
    }
}