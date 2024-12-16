<script setup lang="ts">
    import { ref } from 'vue';
import HelpIcon from '../../assets/icons/help.svg'
import ErrorWindow from './windows/ErrorWindow.vue';
import WindowBase from './WindowBase.vue';
import WindowBackground from './WindowBackground.vue';
import ButtonBase from './ButtonBase.vue';

    const showHelp = ref(false);
</script>

<template>
    <div class="container">
        <img :src="HelpIcon" class="helpButton" @click="showHelp = true">
        <Transition name="background">
        <WindowBackground  v-if="showHelp"></WindowBackground>
        </Transition>
        <Transition name="window">
            <WindowBase window-height="550px" window-width="500px"  v-if="showHelp" >
                <template v-slot:content>
                    <div class="content">
                        <div class="title">Upload help</div>
                        <div class="message">
                            ProjectInn doesn't host the actual images so you'll need to find a suitable host.<br>
                            Here are a few options that are free, easy to use, and without any time limits:<br>
                            -<a href="https://www.imghippo.com/" target=”_blank”>
                            Imghippo:</a> choose the "direct link" option
                            after the upload and copy it here<br>
                            -<a href="https://postimages.org/" target=”_blank”>
                            Postimages:</a> after the upload, right click on 
                            the download button and press "copy link" to get the URL for the uncompressed image<br>
                            -<a href="https://neocities.org/" target=”_blank”>
                            Neocities (requires an account):</a> a great way to host
                            static websites, and by extension, images too. the free account nets you 1gb of storage and 
                            plenty of bandwidth.<br>
                            -<a>Other options:</a> You can also upload your assets onto your preferred web hosting 
                            provider (or even self-host!). <br> Cloud drives like Google Drive or OneDrive aren't recommended
                            because they usually prevent the image from being viewed at the highest quality without
                            using their proprietary viewer.
                        </div>
                        <ButtonBase text="Ok" @click="showHelp = false"></ButtonBase>
                    </div>
                </template>
            </WindowBase>
        </Transition>
    </div>
    
</template>

<style scoped>
    a{
        color: #a69ae9;
    }

    .content{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding-inline: 8px;
        padding-block: 24px;
        height: 100%;
    }

    .title{
        font-size: 20px;
        font-weight: bold;
        color: #d9d9d9;
        text-align: center;
    }

    .message{
        padding: 16px;
        color: #d9d9d9;
    }

    .container{
        padding-top: 12px;
        padding-left: 4px;
    }

    .helpButton:hover{
        opacity: 0.5;
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