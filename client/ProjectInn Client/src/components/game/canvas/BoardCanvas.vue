<script setup lang="ts">
    import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
    import { Vector2, type WeakVector2 } from '../../../types/Vector2.js';
    import type { Token } from '../../../model/Token.js';
    import type { Scene } from '../../../model/Scene.js';
    import type { Asset } from '../../../model/Asset.js';
    import { BoardRenderer } from './BoardRenderer.js';
    import { GridType } from '../../../model/GridType.js';
    import { SquareGrid } from './grid/SquareGrid.js';
    import type { Grid } from './grid/Grid.js';
    import { HexagonGrid } from './grid/HexagonGrid.js';
    import ErrorWindow from '../../shared/windows/ErrorWindow.vue';
    const props = defineProps<{
        tokens : Array<Token>
        currentScene : Scene
        tokenAssets : Array<Asset>
        rounded : string
        canvasSize : WeakVector2
        onLoadError? : () => void;
        onLoadSuccess? : (img : ImageBitmap) => void;  
    }>();
    const loadError = ref(false);
    const canvas = useTemplateRef("board");
    

    onMounted(() => {
        let renderer : BoardRenderer;
        if(canvas.value !== null){
            renderer = 
                new BoardRenderer(canvas.value, props.tokens, props.currentScene, props.tokenAssets);
        }
        watch(props.tokenAssets, (newAssets) => {
            newAssets.forEach(a => {
                if(a.assetURL !== undefined){
                    renderer.updateSpriteCache(a.assetID, a.assetURL);
                }
            })
        }, {deep : true, immediate : true})
        watch(props.currentScene, (newScene) => {
            let grid : Grid;
            const offset : Vector2 = new Vector2(newScene.offset.x,newScene.offset.y);
            if(newScene.gridType == GridType.SQUARE){
                grid = new SquareGrid(newScene.tileSize,offset,1);
            } else {
                grid = new HexagonGrid(newScene.tileSize,offset,1);
            }
            renderer.setMap(newScene.asset.assetURL,grid, props.onLoadSuccess, props.onLoadError);
        }, { immediate : true });
    });
</script>

<template>
    <canvas ref="board" class="canvas" :style="{ 'border-radius': rounded }" :width="canvasSize.x" :height="canvasSize.y" >
        Game board
    </canvas>
    <ErrorWindow title="Load error" 
    message="unable to load the current scene. please try joining again" v-if="loadError">      
    </ErrorWindow>
</template>

<style scoped>
</style>