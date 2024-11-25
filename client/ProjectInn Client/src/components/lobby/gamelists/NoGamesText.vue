<template>
    <div class="container">
        <div class="noGamesText"><slot></slot></div>
    </div>
    
</template>

<style scoped>
    .noGamesText{
        text-align: center;
        height: 64px;
        color: #D9D9D9;
        margin: 64px;
    }
    .container{
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>