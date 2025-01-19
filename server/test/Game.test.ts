import assert from "assert/strict";
import { it } from 'node:test';
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
import { Game } from "../model/Game.js";
import { Color } from "../model/gameObjects/player/Color.js";
import { Player } from "../model/gameObjects/player/Player.js";
import { GameController } from "../controller/GameController.js";
import { Token } from "../model/gameObjects/token/Token.js";
import { Permission } from "../model/gameObjects/player/Permission.js";


it("an entire game can be played fully using all the main commands", () => {
    const handler : MockHandler = new MockHandler();
    const extraHandler : MockHandler = new MockHandler();
    const sceneAsset : Asset = new Asset(0, "test", AssetType.SCENE);
    sceneAsset.setURL("test",new Vector2(5000,5000));
    const notifier : ClientNotifier<Player> = new ClientNotifier();
    const startingScene : Scene = new Scene(sceneAsset, GridType.SQUARE, new Vector2(0,0), 100);
    startingScene.setNotifier(notifier);
    const game : Game = new Game("test", "test", startingScene);
    game.setNotifier(notifier);
    const player : Player = new Player("test", new Color("#222222"), true);
    const extraPlayer : Player = new Player("test2", new Color("#222222"), false);
    const lobby : Lobby = new Lobby();
    const lobbyNotifier : ClientNotifier = new ClientNotifier();
    lobby.setNotifier(lobbyNotifier);
    game.addPlayer(player);
    game.joinGame(player, handler);
    handler.changeState(new GameController(lobby, game, player, handler));
    handler.ignoreLastMessages();
    game.addPlayer(extraPlayer);
    game.joinGame(extraPlayer, extraHandler);
    extraHandler.changeState(new GameController(lobby, game, extraPlayer, extraHandler));
    assert(game.getPlayer("test") !== undefined && game.getPlayer("test2") !== undefined);
    assert(handler.compareLastMessages([Status.PLAYER, Status.CLIENT_STATUS, Status.CHAT]));
    //tokens
    handler.receive({
        status : Status.TOKEN_ASSET,
        command : Command.CREATE,
        content : {
            assetID : 0,
            assetURL : "test",
            assetType : AssetType.TOKEN,
            assetSize : { x : 0, y : 0},
            name : "test"
        }
    })
    handler.receive({
        status : Status.TOKEN,
        command : Command.CREATE,
        content : {
            name : "test",
            id : -1,
            assetID : 0,
            owners : [],
            stats : {},
            notes : {},
            position : {x : 0, y : 0}
        }
    });
    assert(handler.compareLastMessages([Status.TOKEN_ASSET, Status.TOKEN_ASSET, Status.TOKEN]));
    handler.receive({
        status : Status.TOKEN_NAME,
        command : Command.MODIFY,
        content : {
            name : "test2",
            id : 0
        }
    });
    handler.receive({
        status : Status.TOKEN_NOTE,
        command : Command.MODIFY,
        content : {
            title : "test",
            note : "test",
            id : 0
        }
    });
    handler.receive({
        status : Status.TOKEN_STAT,
        command : Command.MODIFY,
        content : {
            name : "test",
            stat : {value : 0, max : 100, min : 0},
            id : 0
        }
    });
    handler.receive({
        status : Status.TOKEN_MOVING,
        command : Command.MODIFY,
        content : {
            position : {x : 2, y : 2},
            id : 0
        }
    });
    handler.receive({
        status : Status.TOKEN_MOVED,
        command : Command.MODIFY,
        content : {
            position : {x : 2, y : 2},
            id : 0
        }
    });
    handler.receive({
        status : Status.TOKEN_COPY,
        command : Command.CREATE,
        content : {
            id : 0
        }
    });
    extraHandler.receive({
        status : Status.TOKEN_COPY,
        command : Command.CREATE,
        content : {
            id : 0
        }
    });
    handler.receive({
        status : Status.TOKEN_OWNERSHIP,
        command : Command.CREATE,
        content : {
            name : "test2",
            id : 0
        }
    })
    assert(handler.compareLastMessages([Status.TOKEN_NAME, Status.TOKEN_NOTE, Status.TOKEN_STAT,
         Status.TOKEN_MOVING, Status.TOKEN_MOVED, Status.TOKEN, Status.TOKEN_OWNERSHIP]));
    const token : Token | undefined = game.getToken(0);
    assert(game.getTokenAsset(0) !== undefined);
    assert(token !== undefined);
    assert(token.getName() == "test2");
    assert(token.getPosition().equals(new Vector2(2,2)));
    assert(token.getNotes().get("test") !== undefined);
    assert(token.getStats().get("test") !== undefined);
    assert(game.getToken(1) !== undefined);
    handler.receive({
        status : Status.TOKEN_STAT,
        command : Command.DELETE,
        content : {
            name : "test",
            id : 0
        }
    })
    handler.receive({
        status : Status.TOKEN_NOTE,
        command : Command.DELETE,
        content : {
            title : "test",
            id : 0
        }
    })
    handler.receive({
        status : Status.TOKEN_OWNERSHIP,
        command : Command.DELETE,
        content : {
            name : "test2",
            id : 0
        }
    })
    handler.receive({
        status : Status.TOKEN,
        command : Command.DELETE,
        content : {
            id : 1,
        }
    });
    assert(handler.compareLastMessages([Status.TOKEN_STAT, Status.TOKEN_NOTE,
         Status.TOKEN_OWNERSHIP,Status.TOKEN]))
    assert(game.getToken(1) === undefined);
    //chat, commands, scene pings
    handler.receive({
        status : Status.CHAT,
        command : Command.CREATE,
        content : {
            text : "test"
        }
    });
    handler.receive({
        status : Status.CHAT,
        command : Command.CREATE,
        content : {
            text : "!d 6d6 5d5"
        }
    });
    handler.receive({
        status : Status.CHAT,
        command : Command.CREATE,
        content : {
            text : "!w test /test2"
        }
    });
    handler.receive({
        status : Status.CHAT,
        command : Command.CREATE,
        content : {
            text : "!h"
        }
    });
    handler.receive({
        status : Status.SCENE_PING,
        command : Command.CREATE,
        content : {
            position : {x : 0, y : 0}
        }
        });
    assert(handler.compareLastMessages([Status.CHAT,Status.CHAT,Status.CHAT,Status.CHAT, Status.SCENE_PING]));
    //Player permissions
    handler.receive({
        status : Status.PERMISSIONS,
        command : Command.MODIFY,
        content : {
            name : "test2",
            permission : "MASTER",
            value : true
        }
    });
    handler.receive({
        status : Status.PERMISSIONS,
        command : Command.MODIFY,
        content : {
            name : "test2",
            permission : "MASTER",
            value : false
        }
    });
    handler.receive({
        status : Status.PERMISSIONS,
        command : Command.MODIFY,
        content : {
            name : "test2",
            permission : "MANAGE_SCENES",
            value : true
        }
    });
    assert(handler.compareLastMessages([Status.PERMISSIONS, Status.PERMISSIONS, Status.PERMISSIONS]));
    assert(!game.getPlayer("test2")?.hasPermission(Permission.MASTER));
    assert(game.getPlayer("test2")?.hasPermission(Permission.MANAGE_SCENES));
    //Scenes
    const scene2 : Scene = Scene.fromObject(Scene.toObject(startingScene));
    scene2.setName("test2")
    handler.receive({
        status : Status.SCENE,
        command : Command.CREATE,
        content : Scene.toObject(scene2)
    })
    handler.receive({
        status : Status.SCENE_CHANGE,
        command : Command.MODIFY,
        content : {
            id : 1
        }
    })
    scene2.setGridType(GridType.HEXAGONAL);
    scene2.setID(0);
    handler.receive({
        status : Status.SCENE,
        command : Command.MODIFY,
        content : Scene.toObject(scene2)
    })
    assert(handler.compareLastMessages([
        Status.SCENE, Status.SCENE_CHANGE, Status.TOKEN_MOVED, Status.TOKEN_MOVED, Status.SCENE_GRIDTYPE,
        Status.SCENE_OFFSET, Status.SCENE_TILESIZE, Status.ASSET_NAME, Status.ASSET_URL
    ]));
    const scene : Scene | undefined = game.getScene(1);
    assert(scene !== undefined);
    assert(game.getCurrentScene() == scene);
    assert(scene2.getGridType() == game.getScene(0)?.getGridType());
    //Kick player
    const thirdPlayer : Player = new Player("test3", new Color("#ffffff"), false);
    game.addPlayer(thirdPlayer);
    game.joinGame(thirdPlayer, new MockHandler());
    handler.ignoreLastMessages();
    handler.receive({
        status : Status.PLAYER,
        command : Command.DELETE,
        content : {
            name : "test3"
        }
    });
    assert(game.getPlayer("test3") == undefined);
    assert(handler.compareLastMessages([Status.PLAYER, Status.CLIENT_STATUS, Status.CHAT]));
    //Delete a token asset
    handler.receive({
        status : Status.TOKEN_ASSET,
        command : Command.DELETE,
        content : {
            id : 0
        }
    });
    assert(game.getToken(0) == undefined);
    assert(game.getTokenAsset(0) == undefined);
    handler.compareLastMessages([Status.TOKEN, Status.TOKEN_ASSET])
    //Game settings
    extraHandler.ignoreLastMessages();
    handler.receive({
        status : Status.PASSWORD_CHANGE,
        command : Command.MODIFY,
        content : {
            password : "test"
        }
    });
    handler.receive({
        status : Status.SAVE_GAME,
        command : Command.NONE,
        content : {
            show : false
        }
    });
    handler.receive({
        status : Status.GAME_END,
        command : Command.NONE,
        content : {}
    });
    assert(handler.compareLastMessages([Status.PASSWORD_CHANGE, Status.SAVE_GAME,
         Status.CLIENT_STATUS, Status.CLIENT_STATUS]));
    assert(extraHandler.compareLastMessages([Status.CLIENT_STATUS, Status.CLIENT_STATUS, Status.GAME_END]))
    assert(!game.checkPassword(undefined) && game.checkPassword("test"));
    assert(!game.getPlayer("test")?.isConnected());
});