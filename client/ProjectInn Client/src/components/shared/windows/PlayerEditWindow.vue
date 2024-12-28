<script setup lang="ts">
    import { ref, watch } from 'vue';
    import PlayerIcon from '../../../assets/icons/player.svg';
    import type { Player } from '../../../model/Player.js';
    import ButtonBase from '../ButtonBase.vue';
    import CloseButton from '../CloseButton.vue';
    import WindowBackground from '../WindowBackground.vue';
    import WindowBase from '../WindowBase.vue';
    import WindowTitleBar from '../WindowTitleBar.vue';
    
    const confirmDisabled = ref(true);
    const emits = defineEmits<{
        (e : "close") : void
        (e : "changeNewPlayerStatus", status : boolean) : void
    }>();
    const props = defineProps<{
        player : Player
        show : boolean
        onConfirm : () => void
        forceNewPlayer : boolean
    }>();
    const isNewPlayer = ref(true);

    watch(() => props.show, () => {
        isNewPlayer.value = true;
    })

    watch(props.player,(newPlayer) => {
        confirmDisabled.value = newPlayer.name.length == 0;
    })

    function submit(){
        emits("changeNewPlayerStatus", isNewPlayer.value);
        props.onConfirm();
    }
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
                    <TransitionGroup name="edit">
                        <div class="subCategory" key="newPlayer" v-if="forceNewPlayer == false">
                            <div class="inputTitle">Join as a new player</div>
                            <input class="checkbox" v-model="isNewPlayer" type="checkbox">
                        </div>
                        <div class="subCategory" key="playerName">
                            <div class="inputTitle">
                                {{ forceNewPlayer || isNewPlayer ? "Player name" : "Previous name"}}</div>
                            <input class="textBox" v-model="player.name" maxlength="24" type="text">
                        </div>
                        <div class="subCategory" key="color" 
                        v-if="forceNewPlayer == true || isNewPlayer">
                            <div class="inputTitle">Player color</div>
                            <input type="color" v-model="player.color" class="colorPicker">
                        </div>
                    </TransitionGroup>
                </div>
                <div class="buttonContainer">
                    <ButtonBase text="Next" height="42px" :disabled="confirmDisabled" @click="submit"></ButtonBase>
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

    .checkbox{
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

    .contentContainer{
        display: flex;
        flex-direction: column;
        width: 100%;
        border-radius: 16px;
        padding: 16px;
        gap:8px;
        justify-content: center;
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

    .edit-enter-active,
    .edit-leave-active {
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        max-height: 1000px;
        overflow: hidden;
    }

    .edit-enter-from,
    .edit-leave-to {
        padding-block: 0px;
        margin-block: 0px;
        max-height: 0px;
        overflow: hidden;
    }
</style>