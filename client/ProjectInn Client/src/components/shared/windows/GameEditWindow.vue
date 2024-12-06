<script setup lang="ts">
    import PlayerIcon from '../../../assets/icons/player.svg';
    import WindowBase from '../WindowBase.vue';
    import WindowTitleBar from '../WindowTitleBar.vue';
    import CloseButton from '../CloseButton.vue';
    import { ref, watch, type Ref } from 'vue';
    import WindowBackground from '../WindowBackground.vue';
    import BoardCanvas from '../../game/canvas/BoardCanvas.vue';
    import { AssetType } from '../../../model/AssetType.js';
    import { GridType } from '../../../model/GridType.js';
    import ButtonBase from '../ButtonBase.vue';
    import type { Player } from '../../../model/Player.js';
import type { Game } from '../../../model/Game.js';
    const minTileSize = ref(10);
    const maxTileSize = ref(300);
    const tileSizeValue = ref(35);
    const confirmDisabled = ref(true);
    const passwordEnabled = ref(false);
    const passwordValue = ref("");
    const emits = defineEmits<{
        close : void
    }>();
    const props = defineProps<{
        game : Game
        isNewGame : boolean
        show : boolean
        onConfirm? : () => void
    }>();
    watch(passwordEnabled,(newValue) => {
        if(newValue == false){
            props.game.password = undefined;
        }
    });
</script>


<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="450px" window-width="500px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar title="Game Settings" :icon="PlayerIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="contentContainer">
                    <div class="editor">
                        <div class="subCategory" v-if=isNewGame>
                            <div class="inputTitle">Game name</div>
                            <input class="textBox" v-model="game.name" maxlength="24" type="text" title="sceneName">
                        </div>
                        <div class="multiLineSubCategory">
                            <div class="section">
                                <div class="inputTitle">Private game</div>
                                <input class="toggle" v-model="passwordEnabled" type="checkbox">
                            </div>
                            <div class="section">
                                <div class="inputTitle">Password</div>
                                <input 
                                class="textBox" v-model="game.password" :disabled="!passwordEnabled"
                                 maxlength="24" type="text" title="sceneName" placeholder="Password">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="buttonContainer">
                    <ButtonBase text="Next" @click="onConfirm" height="42px" 
                    :disabled="game.name.length == 0 || (passwordEnabled && game.password?.length == 0)">
                    </ButtonBase>
                </div>
            </template>
        </WindowBase>
    </Transition>
</template>

<style scoped>

    .subCategory{
        display: flex;
        width: 100%;
        background-color: #353535;
        border-radius: 16px;
        height: 72px;
        padding: 16px;
        box-sizing: border-box;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
    }

    .multiLineSubCategory{
        display: flex;
        flex-direction: column;
        width: 100%;
        background-color: #353535;
        border-radius: 16px;
        height: fit-content;
        padding-block: 32px;
        padding-inline: 16px;
        box-sizing: border-box;
        gap: 24px;
        justify-content: space-around;
    }

    .section{
        display: flex;
        justify-content: space-between;
    }

    .toggle{
        accent-color:#303F9F;
    }


    .coordinateName{
        padding-left: 4px;
        color: #d9d9d9;
    }

    .buttonContainer{
        display: flex;
        justify-content: center;
        padding-bottom: 16px;
    }

    .gridTypeSelection{
        display: flex;
        justify-content: space-around;
        align-items: center;

        border-radius: 8px;
        padding: 0px;
        height: 32px;
    }

    .contentContainer{
        display: flex;
        width: 100%;
        border-radius: 16px;
        width: 100%;
        flex-direction: column;
        justify-content: space-evenly;
        box-sizing: border-box;
        padding: 16px;
        height: 100%;
    }

    .colorPicker{
        border-radius: 16px;
        margin-bottom: 16px;
        width: 32px;
        background-color: transparent;
        border-color: transparent;
    }

    .editor{
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        padding: 24px;
        gap: 8px;
    }

    .inputTitle{
        color: #d9d9d9;
    }

    .textBox{
        background-color: #494949;
        color: #ffffff;
        border-radius: 8px;
        outline: #d9d9d9;
        border: 0;
        box-shadow: none;
        outline-style: none;
        outline-width: 0px;
        font-size: 16px;
        padding-top: 4px;
        padding-left: 4px;
        padding-bottom: 4px;
    }

    .textBox:disabled{
        background-color: #4e4e4e;
        color:#9a9a9a;
    }
    
    .subOption{
        color: #d9d9d9;
    }

    .background-enter-active,
    .background-leave-active {
        transition: opacity 0.5s ease;
    }

    .background-enter-from,
    .background-leave-to {
        opacity: 0;
    }

    .window-enter-active,
    .window-leave-active{
        transition: all 0.5s  cubic-bezier(0.075, 0.82, 0.165, 1);
    }

    .window-enter-from,
    .window-leave-to {
        opacity: 0;
        transform: scale(0.75);
    }
</style>