<script setup lang="ts">
    defineProps<{
        isActive : boolean,
        id : number,
        icon : string
    }>();
</script>

<template>
     <div class="tabButton" :class="{ selected : isActive}">
        <img :src="icon" class="tabIcon">
    </div>
</template>

<style scoped>
  .tabButton{
        height: 100%;
        width: 64px;
        display: flex;
        justify-content: center;
        border-radius: 16px;
        transition: all 0.2s linear;
    }

    .tabIcon{
        width: 20px;
    }

    .tabButton:hover{
        background-color: #666666;
    }

    .selected{
        background-color: #535353;
    }
</style>
