<script setup lang="ts">
    import { inject, onMounted, onUnmounted, useTemplateRef, watch } from 'vue';
    import type { Asset } from '../../../model/Asset.js';
    import type { ViewData } from '../../../model/Game.js';
    import type { GlobalSettings } from '../../../model/GlobalSettings.js';
    import { GridType } from '../../../model/GridType.js';
    import type { Player } from '../../../model/Player.js';
    import type { Scene } from '../../../model/Scene.js';
    import type { Token } from '../../../model/Token.js';
    import type { ServerPublisher } from '../../../network/ServerPublisher.js';
    import { Vector2, type WeakVector2 } from '../../../types/Vector2.js';
    import { BoardView } from './BoardView.js';
    import type { Grid } from './grid/Grid.js';
    import { HexagonGrid } from './grid/HexagonGrid.js';
    import { SquareGrid } from './grid/SquareGrid.js';
    const props = defineProps<{
        tokens : Array<Token>
        currentScene : Scene
        tokenAssets : Array<Asset>
        localPlayer : Player
        players : Array<Player>
        viewData : ViewData
        globalSettings : GlobalSettings
        rounded : string
        canvasSize : WeakVector2
        onLoadError? : () => void;
        onLoadSuccess? : (img : ImageBitmap) => void;  
    }>();


    const canvas = useTemplateRef("board");
    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    let renderer: BoardView;

    function changeScene(newScene : Scene, renderer : BoardView){
        let grid : Grid;
        const offset : Vector2 = new Vector2(newScene.offset.x,newScene.offset.y);
        if(newScene.gridType == GridType.SQUARE){
            grid = new SquareGrid(newScene.tileSize,offset,1);
        } else {
            grid = new HexagonGrid(newScene.tileSize,offset,1);
        }
        renderer.setMap(newScene.asset.assetURL,grid, props.onLoadSuccess, props.onLoadError);
    }

    onMounted(() => {
        if(canvas.value !== null){
            const gameContext = {
                tokens : props.tokens,
                localPlayer : props.localPlayer,
                players : props.players,
                viewData : props.viewData,
                globalSettings : props.globalSettings
            }
            renderer = 
                new BoardView(
                    canvas.value,
                    gameContext,
                    serverPublisher);
        }
        watch(() => props.tokenAssets, (newAssets) => {
            renderer.startFullCacheUpdate();
            newAssets.forEach(a => {
                if(a.assetURL !== undefined){
                    renderer.updateSpriteCache(a.assetID, a.assetURL);
                }
            })
            renderer.clearUnusedSprites();
        }, {deep : true, immediate : true})
        watch(() => props.currentScene, (newScene) => {
            changeScene(newScene, renderer);
        }, { immediate : true, deep : true});
    });

    onUnmounted(() => {
        renderer.destroy();
    })
</script>

<template>
    <canvas @dragover.prevent @dragenter.prevent
    ref="board" class="canvas" tabindex="1"
    :style="{ 'border-radius': rounded }" :width="canvasSize.x" :height="canvasSize.y" >
        Game board
    </canvas>
</template>

<style scoped>
    .canvas:focus { 
        outline: none; 
    }
</style>