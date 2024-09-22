import { Color } from "./model/player/Color";
import { GameActor } from "./model/player/Player";
import { PermissionStorage } from "./model/permissions/PermissionsStorage";
import { Permission } from "./model/player/Permission";
import { Vector2Map } from "./model/board/Vector2Map";
import { Vector2 } from "./model/board/Vector2";
import { Token } from "./model/deprecated/provider-tree/Token";
import { TokenType } from "./model/deprecated/provider-tree/TokenType";
import { Game } from "./model/deprecated/provider-tree/Game";
let perms:PermissionStorage = new PermissionStorage();
let gamer:GameActor = new GameActor(new Color("#FFFFFF"),"P")
perms.addPermission(gamer,Permission.DICE_ROLL);
let vec2Map:Vector2Map<Token> = new Vector2Map<Token>();
vec2Map.set(new Vector2(2,3), new Token(new TokenType("app","sup",new Game())))
vec2Map.set(new Vector2(5,3), new Token(new TokenType("app","sup",new Game())))
let obj:string = JSON.stringify(vec2Map);
let object = JSON.parse(obj);
console.log(object);