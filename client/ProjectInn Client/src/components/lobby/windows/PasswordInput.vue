<script setup lang="ts">
    import JoinIcon from '../../../assets/icons/join.svg';
    import WindowBase from '../../shared/WindowBase.vue';
    import WindowTitleBar from '../../shared/WindowTitleBar.vue';
    import CloseButton from '../../shared/CloseButton.vue';
    import { ref, watch, type Ref } from 'vue';
    import WindowBackground from '../../shared/WindowBackground.vue';
    import BoardCanvas from '../../game/canvas/BoardCanvas.vue';
    import { AssetType } from '../../../model/AssetType.js';
    import { GridType } from '../../../model/GridType.js';
    import ButtonBase from '../../shared/ButtonBase.vue';
    import type { Player } from '../../../model/Player.js';
    const confirmDisabled = ref(true);
    const emits = defineEmits<{
        (e: "close") : void
    }>();
    const props = defineProps<{
        joinData : { gameId : number, player : Player, password : string | undefined}
        show : boolean
        onConfirm : () => void
    }>();
    watch(props.joinData,(joinData) => {
        confirmDisabled.value = joinData.password?.length == 0;
    })

    function confirm(){
        emits("close");
        props.onConfirm();
    }
</script>


<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="250px" window-width="500px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar title="Password" :icon="JoinIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="contentContainer">
                    <div class="subCategory">
                        <div class="inputTitle">Enter password</div>
                        <input class="textBox" v-model="joinData.password" maxlength="24" type="text">
                    </div>
                </div>
                <div class="buttonContainer">
                    <ButtonBase text="Next" height="42px" :disabled="confirmDisabled" @click="confirm"></ButtonBase>
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