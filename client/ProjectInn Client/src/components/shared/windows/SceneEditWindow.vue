<script setup lang="ts">
    import type { Scene } from '../../../model/Scene.js';
    import SceneIcon from '../../../assets/icons/scene.svg'
    import WindowBase from '../WindowBase.vue';
    import WindowTitleBar from '../WindowTitleBar.vue';
import CloseButton from '../CloseButton.vue';
import { ref } from 'vue';
        const show = ref(true);
        const props = defineProps<{
            title : string
            scene? : Scene
        }>();
</script>


<template>
    <WindowBase window-height="500px" window-width="600px" v-if="show">
        <template v-slot:content>
            <WindowTitleBar :title="title" :icon="SceneIcon">
            <template v-slot:back>
                <CloseButton @click="show = false"></CloseButton>
            </template>
        </WindowTitleBar>
        </template>
    </WindowBase>
</template>

<style scoped>
</style>