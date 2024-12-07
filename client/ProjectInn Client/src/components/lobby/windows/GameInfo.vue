<script setup lang="ts">
    import InfoIcon from '../../../assets/icons/info.svg'
    import WindowBase from '../../shared/WindowBase.vue';
    import WindowTitleBar from '../../shared/WindowTitleBar.vue';
    import CloseButton from '../../shared/CloseButton.vue';
    import { ref, watch, type Ref } from 'vue';
    import WindowBackground from '../../shared/WindowBackground.vue';
    const confirmDisabled = ref(true);
    const emits = defineEmits<{
        close : void
    }>();
    const props = defineProps<{
        gameId : number
        show : boolean
    }>();
</script>


<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="200px" window-width="300px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar title="Game Info" :icon="InfoIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="contentContainer">
                    <div class="subCategory">
                        <div class="title"> Game ID:</div>
                        <div class="id">{{ gameId }}</div>
                    </div>
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

    .id{
        color: #D9D9D9;
        font-weight: bold;
    }

    .title{
        color:#D9D9D9;
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