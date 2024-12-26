<script setup lang="ts">
    import { computed, inject, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
    import { Vector2, type WeakVector2 } from '../../../types/Vector2.js';
    import type { Token } from '../../../model/Token.js';
    import type { Scene } from '../../../model/Scene.js';
    import type { Asset } from '../../../model/Asset.js';
    import { BoardView } from './BoardView.js';
    import { GridType } from '../../../model/GridType.js';
    import { SquareGrid } from './grid/SquareGrid.js';
    import type { Grid } from './grid/Grid.js';
    import { HexagonGrid } from './grid/HexagonGrid.js';
    import ErrorWindow from '../../shared/windows/MessageWindow.vue';
    import type { ServerPublisher } from '../../../network/ServerHandler.js';
    import type { Player } from '../../../model/Player.js';
    import type { ViewData } from '../../../model/Game.js';
    const props = defineProps<{
        tokens : Array<Token>
        currentScene : Scene
        tokenAssets : Array<Asset>
        localPlayer : Player
        players : Array<Player>
        viewData : ViewData
        rounded : string
        canvasSize : WeakVector2
        onLoadError? : () => void;
        onLoadSuccess? : (img : ImageBitmap) => void;  
    }>();


    const loadError = ref(false);
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
                currentScene : props.currentScene,
                localPlayer : props.localPlayer,
                players : props.players,
                viewData : props.viewData
            }
            renderer = 
                new BoardView(
                    canvas.value,
                    gameContext,
                    serverPublisher);
        }
        watch(() => props.tokenAssets, (newAssets) => {
            renderer.startCacheUpdate();
            newAssets.forEach(a => {
                if(a.assetURL !== undefined){
                    renderer.updateSpriteCache(a.assetID, a.assetURL);
                }
            })
            renderer.clearUnusedSprites();
        }, {deep : true, immediate : true})
        watch(() => props.currentScene, (newScene) => {
            console.log("aaaaa");
            changeScene(newScene, renderer);
        }, { immediate : true, deep : true});
    });

    onUnmounted(() => {
        renderer.destroy();
    })
</script>

<template>
    <canvas @dragover.prevent @dragenter.prevent
    ref="board" class="canvas" :style="{ 'border-radius': rounded }" :width="canvasSize.x" :height="canvasSize.y" >
        Game board
    </canvas>
    <ErrorWindow title="Load error" 
    message="unable to load the current scene. please try joining again" v-if="loadError">      
    </ErrorWindow>
</template>

<style scoped>
</style>