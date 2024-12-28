<script setup lang="ts">
    import type { GlobalSettings } from '../../../model/GlobalSettings.js';

    const emits = defineEmits<{
        (e : "changeShowNames", value : boolean) : void,
        (e : "changeShowStats", value : boolean) : void
    }>();

    const props = defineProps<{
        globalSettings : GlobalSettings
        show : boolean
    }>();


</script>

<template>
    <Transition name="window">
        <div class="window" v-if="show">
            <div class="content">
                <div class="title">Board settings</div>
                <div class="section">
                    <div class="checkboxLabel">show names</div>
                    <input class="checkbox" :checked="globalSettings.showNames" 
                    type="checkbox" @change="e => emits('changeShowNames',(e.target as HTMLInputElement).checked)">
                </div>
                <div class="section">
                    <div class="checkboxLabel">show stats</div>
                    <input class="checkbox" type="checkbox" :checked="globalSettings.showStats" 
                    @change="e => emits('changeShowStats',(e.target as HTMLInputElement).checked)">
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
    .window{
        position: absolute;
        left: 16px;
        bottom: 64px;
        height: 128px;
        width: 200px;
        border-radius: 8px;
        background: #242424bd;
        backdrop-filter: blur(4px);
    }

    .title{
        color: #FFFFFF;
        font-weight: bold;
        text-align: center;
        padding-top: 16px;
    }

    .content{
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .checkboxLabel{
        color: #FFFFFF;
    }

    .checkbox{
        background-color: #353535;
        accent-color:#303F9F;
        padding: 0px;
        margin: 0px;
    }

    .section{
        padding-inline: 16px;
        justify-content: space-between;
        display: flex;
    }

    .window-enter-active,
    .window-leave-active{
        transition: all 0.5s  cubic-bezier(0.075, 0.82, 0.165, 1);
    }

    .window-enter-from,
    .window-leave-to {
        opacity: 0;
        transform: scale(1,0.25);
        transform-origin: 50% 100%;
    }
</style>