<script setup lang="ts">
    import Back from '../../assets/icons/back.svg'
</script>

<template>
    <img :src="Back" class="back">
</template>

<style scoped>
    .back{
        width: 24px;
        justify-self: start;
        position:absolute;
        top:16px;
        left:16px;
    }
    .back:hover{
        opacity: 75%;
    }
</style>