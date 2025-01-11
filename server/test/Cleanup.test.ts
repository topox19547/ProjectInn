import assert from "assert/strict";
import { it, mock } from 'node:test';
import { LobbyController } from "../controller/LobbyController.js";
import { ClientNotifier } from "../model/ClientNotifier.js";
import { Asset } from "../model/gameObjects/asset/Asset.js";
import { AssetType } from "../model/gameObjects/asset/AssetType.js";
import { GridType } from "../model/gameObjects/scene/GridType.js";
import { Scene } from "../model/gameObjects/scene/Scene.js";
import { Vector2 } from "../model/gameObjects/Vector2.js";
import { Lobby } from "../model/Lobby.js";
import { Command } from "../model/messages/Command.js";
import { Status } from "../model/messages/Status.js";
import { MockHandler } from "./MockHandler.js";

it("when a client leaves, the cleanup is done correctly", () => {
    const lobby : Lobby = new Lobby();
    const notifier : ClientNotifier = new ClientNotifier();
    lobby.setNotifier(notifier);
    const handler : MockHandler = new MockHandler();
    const extraHandler : MockHandler = new MockHandler();
    handler.changeState(new LobbyController(lobby, handler));
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
    handler.close()
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
    extraHandler.receive({
        status : Status.CLIENT_STATUS,
        command : Command.DELETE,
        content : {}
    });
    extraHandler.close();
    extraHandler.receive({
        status : Status.CLIENT_STATUS,
        command : Command.DELETE,
        content : {}
    });
    assert(handler.compareLastMessages([]));
});