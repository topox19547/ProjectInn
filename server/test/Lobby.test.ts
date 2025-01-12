import assert from "assert/strict";
import { it, mock } from 'node:test';
import { LobbyController } from "../controller/LobbyController.js";
import { Lobby } from "../model/Lobby.js";
import { MockHandler } from "./MockHandler.js";
import { Command } from "../model/messages/Command.js";
import { Scene } from "../model/gameObjects/scene/Scene.js";
import { Vector2 } from "../model/gameObjects/Vector2.js";
import { GridType } from "../model/gameObjects/scene/GridType.js";
import { AssetType } from "../model/gameObjects/asset/AssetType.js";
import { Asset } from "../model/gameObjects/asset/Asset.js";
import { Status } from "../model/messages/Status.js";
import { ClientNotifier } from "../model/ClientNotifier.js";


it("games can be added, removed, and accessed through the lobby ", () => {
    const lobby : Lobby = new Lobby();
    lobby.setNotifier(new ClientNotifier());
    const handler : MockHandler = new MockHandler();
    const extraHandler : MockHandler = new MockHandler();
    const testController : LobbyController = new LobbyController(lobby, handler);
    handler.changeState(testController);
    assert(testController.getNextDefaultState() == testController);
    extraHandler.changeState(new LobbyController(lobby, extraHandler));
    const sceneAsset : Asset = new Asset(0, "test", AssetType.SCENE);
    mock.timers.enable();
    handler.receive({
        status : Status.CREATE_GAME,
        command : Command.CREATE,
        content : {
            username : "test",
            playerColor : "#222222",
            gameName : "test",
            password : "test",
            scene : Scene.toObject(new Scene(sceneAsset, GridType.SQUARE, new Vector2(0,0), 100))
        }
    });
    assert(handler.compareLastMessages([Status.JOIN_GAME]));
    assert(lobby.getRunningGames().get(1) !== undefined);
    handler.receive({
        status : Status.CLIENT_STATUS,
        command : Command.DELETE,
        content : {}
    });
    handler.ignoreLastMessages();
    extraHandler.receive({
        status : Status.CREATE_GAME,
        command : Command.CREATE,
        content : {
            username : "test",
            playerColor : " #222222",
            gameName : "test",
            password : "test",
            scene : Scene.toObject(new Scene(sceneAsset, GridType.SQUARE, new Vector2(0,0), 100))
        }
    });
    assert(handler.compareLastMessages([Status.LOBBY_UPDATE]));
    handler.receive({
        status : Status.JOIN_GAME,
        command : Command.NONE,
        content : {
            gameId : 1,
            username : "other",
            playerColor : " #222222",
            password : "wrong",
            newPlayer : true
    }})
    assert(handler.compareLastMessages([Status.ERROR]));
    handler.receive({
        status : Status.JOIN_GAME,
        command : Command.NONE,
        content : {
            gameId : 1,
            username : "other",
            playerColor : " #222222",
            password : "test",
            newPlayer : true
    }})
    assert(handler.compareLastMessages([Status.JOIN_GAME]));
    handler.receive({
        status : Status.CLIENT_STATUS,
        command : Command.DELETE,
        content : {}
    });
    handler.ignoreLastMessages();
    handler.receive({
        status : Status.CLIENT_STATUS,
        command : Command.DELETE,
        content : {}
    });
    extraHandler.receive({
        status : Status.CLIENT_STATUS,
        command : Command.DELETE,
        content : {}
    });
    mock.timers.tick(300000);
})