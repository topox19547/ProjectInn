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
    const confirmDisabled = ref(true);
    const emits = defineEmits<{
        close : void
    }>();
    const props = defineProps<{
        player : Player
        show : boolean
        onConfirm : () => void
    }>();
    watch(props.player,(newPlayer) => {
        confirmDisabled.value = newPlayer.name.length == 0;
    })
</script>


<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="400px" window-width="500px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar title="Player" :icon="PlayerIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="contentContainer">
                    <div class="subCategory">
                        <div class="permsPlayer">Player name</div>
                        <input class="textBox" v-model="player.name" maxlength="24" type="text">
                    </div>
                    <div class="subCategory">
                        <div class="permsPlayer">Player color</div>
                        <input type="color" v-model="player.color" class="colorPicker">
                    </div>
                </div>
                <div class="buttonContainer">
                    <ButtonBase text="Next" height="42px" :disabled="confirmDisabled" @click="onConfirm"></ButtonBase>
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

    .coordinateName{
        padding-left: 4px;
        color: #d9d9d9;
    }

    .buttonContainer{
        display: flex;
        justify-content: center;
        padding-bottom: 16px; 
    }

    .contentContainer{
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        border-radius: 16px;
        padding: 16px;
        gap:8px;
        box-sizing: border-box;
        height: 100%;
    }

    .colorPicker{
        border-radius: 16px;
        width: 32px;
        background-color: transparent;
        border-color: transparent;
    }

    .permsPlayer{
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