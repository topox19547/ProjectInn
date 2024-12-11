<script setup lang="ts">
    import WindowBase from '../../shared/WindowBase.vue';
    import WindowTitleBar from '../../shared/WindowTitleBar.vue';
    import CloseButton from '../../shared/CloseButton.vue';
    import { inject, onMounted, onRenderTriggered, ref, vModelCheckbox, watch} from 'vue';
    import WindowBackground from '../../shared/WindowBackground.vue';
    import ButtonBase from '../../shared/ButtonBase.vue';
    import type { Player } from '../../../model/Player.js';
    import type { ServerPublisher } from '../../../network/ServerHandler.js';
    import { Status } from '../../../network/message/Status.js';
    import { Command } from '../../../network/message/Command.js';
    import editPermsIcon from '../../../assets/icons/editPerms.svg';
    import { Permission } from '../../../model/Permission.js';

    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const toKick = ref("");
    const emits = defineEmits<{
        close : void
    }>();
    const props = defineProps<{
        editablePlayers : Array<string>
        playerPermissionsCopy : Record<string,Record<string,boolean>>
        show : boolean
    }>();
    let editedPermissions = generateBlankPermissions();



    function sendEditedPerms(){
        for(const entry of Object.entries(editedPermissions)){
            for(const permission of Object.entries(entry[1])){
                serverPublisher.send({
                status: Status.PERMISSIONS,
                command: Command.MODIFY,
                content:{
                    name: entry[0],
                    permission:Permission[permission[0] as keyof typeof Permission],
                    value: permission[1]
                },
            })
            }
        }
        editedPermissions = generateBlankPermissions();
    }

    function isCheckBoxDisabled(entry : string, key : string){
        editedPermissions[entry[0]][key] = !entry[1][key as any]
    }

    function generateBlankPermissions() : Record<string,Record<string, boolean | undefined>>{
        const permissions : Record<string,Record<string,boolean | undefined>> = {}
        for(const player of Object.keys(props.playerPermissionsCopy)){
            permissions[player] = {}
        }
        return permissions;
    }

</script>


<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="500px" window-width="700px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar title="Edit Permissions" :icon="editPermsIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="contentContainer">
                    <div class="subCategory">
                        <div >
                            <table class="permsTable">
                                <tbody>
                                    <tr>
                                        <th class="permsPlayer">Player</th>
                                        <th 
                                        class="permsPermission" 
                                        v-for="key in Object.keys(Permission)">{{ key }}</th>
                                    </tr>
                                    <tr class="playerPermissions" v-for="entry of Object.entries(playerPermissionsCopy)">
                                        <td class="permsEntry">{{ entry[0] }}</td>
                                        <td class="permsEntry" v-for="key in Object.keys(Permission)">
                                            <input type="checkbox" 
                                            :disabled="!editablePlayers.some(p => p == entry[0])"
                                            v-model="entry[1][key]" 
                                            @click="editedPermissions[entry[0]][key] = !entry[1][key]"
                                            class="checkbox">
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="buttonContainer">
                    <ButtonBase text="Save" height="42px" 
                    @click="() => {
                        $emit('close');
                        sendEditedPerms()
                    }">
                    </ButtonBase>
                </div>
            </template>
        </WindowBase>
    </Transition>
</template>

<style scoped>
    .subCategory{
        width: 100%;
        background-color: #353535;
        border-radius: 16px;
        height: 350px;
        overflow-y: auto;
        padding: 16px;
        box-sizing: border-box;
        align-items: center;
        gap: 8px;
        justify-content: center;
    }

    .coordinateName{
        padding-left: 4px;
        color: #d9d9d9;
    }

    .buttonContainer{
        display: flex;
        justify-content: center;
        padding-bottom: 16px; 
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

    .colorPicker{
        border-radius: 16px;
        width: 32px;
        background-color: transparent;
        border-color: transparent;
    }

    .permsPlayer{
        color: #d9d9d9;
        height: 32px;
        text-align: left;
    }

    .permsPermission{
        color: #d9d9d9;
        text-align: center;
    }

    .dropDown{
        background-color: #494949;
        color: #ffffff;
        border-radius: 8px;
        outline: #d9d9d9;
        border: 0;
        box-shadow: none;
        outline-style: none;
        outline-width: 0px;
        font-size: 16px;
        padding-top: 4px;
        padding-left: 4px;
        padding-bottom: 4px;

    }

    .checkbox{
        background-color: #353535;
        accent-color:#303F9F;
        width: 100%;
    }

    .permsEntry{
        color: #d9d9d9;
        height: 32px;
        max-width: 150px;
        width: 130px;
        overflow-wrap: anywhere;
    }

    .permsTable{
        padding: 16px;
        width: 100%;
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