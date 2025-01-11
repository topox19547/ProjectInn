import assert from "assert/strict";
import { describe, it, mock } from 'node:test';
import { Game } from "../model/Game.js";
import { Scene } from "../model/gameObjects/scene/Scene.js";
import { Asset } from "../model/gameObjects/asset/Asset.js";
import { AssetType } from "../model/gameObjects/asset/AssetType.js";
import { GridType } from "../model/gameObjects/scene/GridType.js";
import { Vector2 } from "../model/gameObjects/Vector2.js";
import { Player } from "../model/gameObjects/player/Player.js";
import { Color } from "../model/gameObjects/player/Color.js";
import { Permission } from "../model/gameObjects/player/Permission.js";
import { Token } from "../model/gameObjects/token/Token.js";
import { ClientNotifier } from "../model/ClientNotifier.js";
import { Stat } from "../model/gameObjects/token/Stat.js";

it("saves and loads the game correctly",() => {
    const sceneAsset : Asset = new Asset(0, "test", AssetType.SCENE);
    sceneAsset.setURL("test", new Vector2(0,0), Permission.MANAGE_SCENES);
    const tokenAsset : Asset = new Asset(0, "test", AssetType.TOKEN);
    tokenAsset.setURL("test", new Vector2(0,0), Permission.MANAGE_TOKENS);
    const token : Token = new Token(tokenAsset, 0);
    token.setStat("test",new Stat(0,0,100));
    token.setNote("test","test");
    const scene : Scene = new Scene(sceneAsset, GridType.SQUARE, new Vector2(0,0), 100);
    const player : Player = new Player("test", new Color("#222222"), true);
    const game : Game = new Game("test", "test", scene);
    game.addPlayer(player);
    game.addTokenAsset(tokenAsset);
    game.addToken(token);
    const gameObject = Game.toObject(game);
    //simulate message conversion process
    const objectString : string = JSON.stringify(gameObject);
    const backToObject = Game.validate(JSON.parse(objectString));
    const loadedGame = Game.fromObject(backToObject, new ClientNotifier());
    assert(loadedGame !== undefined);
    const checkPlayer = loadedGame.getPlayer("test");
    const checkToken = loadedGame.getToken(token.getID());
    const checkTokenAsset = loadedGame.getTokenAsset(tokenAsset.getID());
    const checkScene = loadedGame.getScene(scene.getID());
    assert(checkPlayer !== undefined);
    assert(checkPlayer.getColor().getColor() == player.getColor().getColor());
    assert(checkPlayer.getName() == player.getName());
    assert(checkPlayer.hasPermission(Permission.MASTER) == player.hasPermission(Permission.MASTER));
    assert(checkPlayer.isGameOwner() == player.isGameOwner());
    assert(checkToken !== undefined);
    assert(checkToken.getName() == token.getName());
    assert(checkToken.getPosition().getX() == token.getPosition().getX() &&
        checkToken.getPosition().getY() == token.getPosition().getY());
    assert(checkToken.getNotes().get("test") == "test");
    assert(checkToken.getStats().get("test")?.getMax() == token.getStats().get("test")?.getMax() &&
        checkToken.getStats().get("test")?.getMin() == token.getStats().get("test")?.getMin() &&
        checkToken.getStats().get("test")?.getValue() == token.getStats().get("test")?.getValue());
    assert(checkTokenAsset !== undefined);
    assert(checkTokenAsset.getURL() == tokenAsset.getURL());
    assert(checkTokenAsset.getName() == tokenAsset.getName());
    assert(checkScene !== undefined);
    assert(checkScene.getName() == scene.getName());
    assert(checkScene.getGridType() == scene.getGridType());
    assert(checkScene.getTileSize() == scene.getTileSize());
    assert(checkScene.getOffset().getX() == scene.getOffset().getX() &&
        checkScene.getOffset().getY() == scene.getOffset().getY());
    assert(loadedGame.getCurrentScene().getID() == game.getCurrentScene().getID());
})
