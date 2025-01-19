<script setup lang="ts">
    import ButtonBase from '../../shared/ButtonBase.vue';
    import CloseButton from '../../shared/CloseButton.vue';
    import WindowBackground from '../../shared/WindowBackground.vue';
    import WindowBase from '../../shared/WindowBase.vue';
    import WindowTitleBar from '../../shared/WindowTitleBar.vue';

    defineEmits<{
        close : void
    }>();

    defineProps<{
        show : boolean
        title : string
        icon : string
        action : string
        message : string
        destructive : boolean
        onConfirm : () => void
    }>();

</script>

<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="fit-content" window-width="400px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar :title="title" :icon="icon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="content">
                    <div class="message">{{ message }}</div>
                    <slot name="additionalContent">

                    </slot>
                    <div class="buttonContainer">
                        <ButtonBase :text="action" :color="destructive ? { active : '#9D2C2C', hover : '#CD3A3A'} : undefined"
                        @click="() => {
                            onConfirm();
                            $emit('close');
                            }">
                        </ButtonBase>
                    </div>
                </div>
            </template>
        </WindowBase>
    </Transition>
</template>

<style scoped>
     .content{
        color: #d9d9d9;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 100%;
        padding-block: 16px;
    }
    .title{
        font-weight: bold;
        font-size: 20px;
    }
    .message{
        padding-inline: 32px;
        white-space: pre-wrap;
        text-align: center;
        padding-top:16px
    }

    .buttonContainer{
        padding-top: 48px;
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
