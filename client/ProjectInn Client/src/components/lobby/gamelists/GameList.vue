<script setup lang="ts">
    console.log("a")
</script>

<template>
    <div class="container">
        <header class="categoryTitle"> Local games</header>
        <div class="gameListCard">
            <div class="gameEntry">
                <div class="gameInfo">GameName</div>
                <div class="action"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .categoryTitle{
        font-size: 32px;
        color: #D9D9D9;
        font-weight: bold;
    }
    .gameListCard{
        background-color: #353535;
        border-radius: 16px;
        max-height: 600px;
        width: fit-content;
        max-width: 50vh;
        height: 50vh;
        box-shadow: 0px 0px 3px;
    }
</style>