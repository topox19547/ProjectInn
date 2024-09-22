class Player{
    private readonly name : string;
    private readonly color : Color;
    private readonly permissions : Map<Permission, boolean>;

    constructor(name : string, color : Color){
        this.name = name;
        this.color = color;
        this.permissions = new Map<Permission, boolean>;
        let i = 0;
        for(const _ in Permission){
            this.permissions.set(i as Permission,false);
            i++;
        }
    }

    public getName() : string{
        return this.name;
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