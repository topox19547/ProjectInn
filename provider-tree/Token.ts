import { ProviderNode } from "./ProviderNode";
import { TokenType } from "./TokenType";

export class Token extends ProviderNode{
    private tokenType:TokenType;
    private name:string;

    constructor(tokenType:TokenType){
        super();
        this.tokenType = tokenType;
        this.name = tokenType.getName();
    }

    public getHigherScope(): ProviderNode{
        return this.tokenType;
    }
    
    public setName(name:string){
        this.name = name;
    }

    public getName():string{
        return this.name;
    }
}
