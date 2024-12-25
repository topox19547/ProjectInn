<script setup lang="ts">
import { ref } from 'vue';
import type { Stat } from '../../../../../model/Stat.js';
    const isEditing = ref(false);

    const props = defineProps<{
        stat : Stat
        name : string
    }>();

    const editableStat = ref({
        value : props.stat.value,
        max : props.stat.max,
        min : props.stat.min
    });

</script>

<template>
    <div class="stat">
        <div class="static" v-if="!isEditing">
            <div class=" anchor progressBar" v-if="props.stat.max !== undefined && props.stat.min !== undefined">
                <div class="progressFill" 
                :style="{width: props.stat.value / (props.stat.max - props.stat.min) * 100 + '%' }"></div>
                <div class="progressText">{{ name }}: {{stat.value}} / {{stat.max}}</div>
            </div>
            <div class="anchor noProgress" v-if="props.stat.max !== undefined && props.stat.min === undefined">
                <div class="progressText">
                    {{ name }}: {{stat.value}} / {{stat.max}}
                </div>
            </div>
            <div class="anchor noProgress"  v-if="props.stat.max === undefined">
                <div class="progressText">
                    {{ name }}: {{stat.value}}
                </div>
            </div>
        </div>
        <div class="editable" v-if="isEditing">
            
        </div>
    </div>
</template>

<style scoped>
    .anchor{
        position: relative;
        height: 28px;
    }

    .progressBar{
        height: 28px;
        border-radius: 16px;
        appearance: none;
        background-color: #222222;
    }

    .progressFill{
        position: absolute;
        left: 0px;
        height: 100%;
        border-radius: 16px;
        appearance: none;
        background-color: #303F9F;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.5s;
    }

    .progressText{
        position: absolute;
        left: 16px;
        line-height: 28px;
        height: 100%;
        color : #FFFFFF;
        font-weight: bold;
    }

    .noProgress{
        color : #d9d9d9;
        background-color: #555555;
        height: 28px;
        border-radius: 16px;
        width: 100%;
    }

    .stat{
        padding-inline: 8px;
        padding-block: 12px;
    }
</style>