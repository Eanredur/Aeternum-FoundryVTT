import {SimpleActorSheet} from "../worldbuilding-release-072/module/actor-sheet";

/**
 *
 */
//evtl ActorSheet
export default class charakter extends SimpleActorSheet{
    get template()
    {
        return `systems/Aethernum-FoundryVTT/templates/${this.item.data.type}-sheet.html`;
    }

}
/*
class charakter {

}*/
