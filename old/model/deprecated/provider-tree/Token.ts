import { StatInstance } from "../stats/StatInstance";
import { ProviderNode } from "./ProviderNode";
import { TokenType } from "./TokenType";

export class Token extends ProviderNode{
    private readonly tokenType:TokenType;
    private readonly textStats:Array<StatInstance<string, TextStatType>>;
    private readonly numericStats:Array<StatInstance<number, NumericStatType>>;
    private name:string;

    constructor(tokenType:TokenType){
        super();
        this.tokenType = tokenType;
        this.name = tokenType.getName();
        this.textStats = new Array();
        this.numericStats = new Array();
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
