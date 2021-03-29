//
// _______        _______    __     _____     ______    ___      ___                                                      ________          ___      __________
// |      \      /      |   |__|    |    \    |    |    \  \    /  /    ___________     ___________       __________    _|        |__      /   |    |  ____    |
// |       \    /       |    __     |     \   |    |     \  \  /  /     |   _______|    |   _______|     |  ____    |   |           |     /_   |    |__|  |    |
// |        \__/        |   |  |    |      \  |    |      \  \/  /      |  |_______     |  |_______      |__|   /   |   |_          |       |  |       ___|    |
// |     |\      /|     |   |  |    |   |\  \ |    |       |    |       |   _______|    |   _______|           /   /      |______   |       |  |     _|___     |
// |     | \____/ |     |   |  |    |   | \  \|    |       |    |       |  |_______     |  |_______       ____/   /__            |  |    ___|  |__  |  |__|    |
// |_____|        |_____|   |__|    |___|  \_______|       |____|       |__________|    |__________|     |___________|           |__|   |_________| |__________|
//
//
import { PacketId, command, NetworkIdentifier, createPacket, sendPacket, MinecraftPacketIds, RawTypeId, Actor, nethook, ServerPlayer } from "bdsx";
import { BossEventPacket, ContainerOpenPacket, DisconnectPacket, ModalFormRequestPacket, RemoveObjectivePacket, SetDisplayObjectivePacket, SetHealthPacket, SetScorePacket, ShowModalFormPacket, TextPacket, TransferPacket } from "bdsx/bds/packets";
import { red } from 'colors';
import { open, readFileSync, writeFileSync } from "fs";
import { create } from "ts-node";
const system = server.registerSystem(0,0);

let playerList:string[] = [];
let nIt = new Map();
let nMt = new Map();
let nXt = new Map();
nethook.after(PacketId.Login).on((ptr, networkIdentifier) => {
    const cert = ptr.connreq.cert
    const xuid = cert.getXuid();
    const username = cert.getId();
    nXt.set(username, xuid);
    nIt.set(username, networkIdentifier);
    nMt.set(networkIdentifier, username);
});
nethook.after(PacketId.SetLocalPlayerAsInitialized).on((ptr, target) => {
    let actor = target.getActor();
    let playerName:string;
    playerName = NameById(target);
    setTimeout(()=>{
        if(!playerList.includes(playerName)) playerList.push(playerName);
    },100);
});
NetworkIdentifier.close.on(networkIdentifier => {
    setTimeout(()=>{
        const id = nMt.get(networkIdentifier);
        if (playerList.includes(id)) playerList.splice(playerList.indexOf(id),1);
        nXt.delete(id);
        nMt.delete(networkIdentifier);
        nIt.delete(id);
        FormData.delete(networkIdentifier);
    }, 100);
});
/**
  *get playerXuid by Name
*/
function XuidByName(PlayerName: string) {
    let Rlt:any = nXt.get(PlayerName);
    return Rlt;
}
/**
  *get playerName by Id
*/
function NameById(networkIdentifier: NetworkIdentifier) {
    let actor = networkIdentifier.getActor();
    let playerName:string;
    try {
        let entity = actor!.getEntity();
        playerName = system.getComponent(entity, "minecraft:nameable")!.data.name;
    } catch {
        playerName = nMt.get(networkIdentifier);
    }
    return playerName;
}
/**
  *get playerData by Id
  *result = [name,actor,entity, xuid]
*/
function DataById(networkIdentifier: NetworkIdentifier) {
    let actor = networkIdentifier.getActor();
    let entity = actor!.getEntity();
    let name = actor!.getName();
    let xuid:any = nXt.get(name);
    return [name, actor, entity, xuid];
}
/**
  *get playerId by Name
*/
function IdByName(PlayerName: string) {
    let Rlt:NetworkIdentifier = nIt.get(PlayerName);
    return Rlt;
}

/////////////////////////////////////////
//JSform


let FormData = new Map<NetworkIdentifier, {Id:number;func:(data:any)=>void}[]>();
class formJSONTYPE {
    type:"form"|"custom_form"|"modal";
    title:string;
    content:string|any[];
    buttons?:{text:string; image?:any}[];
    button1?:string;
    button2?:string;
}

class formJSON {
    type:"form";
    title:string;
    content:string;
    buttons?:{text:string; image?:any}[];
}

class CustomformJSON {
    type:"custom_form";
    title:string;
    content:any[];
}

class modalJSON {
    type:"modal";
    title:string;
    content:string;
    button1?:string;
    button2?:string;
}

class FormFile {
    json: formJSON;
    handler?: (data: any) => void;
    target: NetworkIdentifier;
    setTitle(title:string) {
        this.json.title = title;
    }
    setContent(content:string) {
        this.json.content = content;
    }
    addButton(text:string, image?:object) {
        this.json.buttons?.push({
            text: text,
            image: image
        });
    }
    addhandler(handler?:(data:number)=>void){
        this.handler = handler;
    }
    send(){
        Formsend(this.target, this.json, this.handler);
    }

}
class CustomFormFile {
    json: CustomformJSON;
    handler?: (data: any) => void;
    target: NetworkIdentifier;
    setTitle(title:string) {
        this.json.title = title;
    }
    addContent(content:object[]) {
        this.json.content = content;
    }
    addhandler(handler?:(data:any)=>void){
        this.handler = handler;
    }
    send(){
        Formsend(this.target, this.json, this.handler);
    }

}

class ModalFile {
    json: modalJSON;
    handler?: (data: any) => void;
    target: NetworkIdentifier;
    setTitle(title:string) {
        this.json.title = title;
    }
    setContent(content:string) {
        this.json.content = content;
    }
    setButton1(button:string) {
        this.json.button1 = button;
    }
    setButton2(button:string) {
        this.json.button2 = button;
    }
    addhandler(handler?:(data:boolean)=>void){
        this.handler = handler;
    }
    send(){
        Formsend(this.target, this.json, this.handler);
    }

}
namespace form {
    export function create(target:NetworkIdentifier, type?:"form"|"custom_form"|"modal"):FormFile{
        let form:any;
        if (type == "form" || type == undefined) {
            form = new FormFile();
        } else if (type == "custom_form") {
            form = new CustomFormFile();
        } else if (type == "modal") {
            form = new ModalFile();
        }
        form.target = target;
        return form;
    }
    export const write = Formsend;
}

/**
  *JsonType example : https://github.com/NLOGPlugins/Form_Json You can use form.write instead of this
*/
function Formsend(target: NetworkIdentifier, form: formJSONTYPE, handler?: (data: any) => void, id?:number) {
    try {
        const modalPacket = ShowModalFormPacket.create();
        let formId = Math.floor(Math.random() * 1147483647) + 1000000000;
        if (typeof id == "number") formId = id;
        modalPacket.setUint32(formId, 0x30);
        modalPacket.setCxxString(JSON.stringify(form), 0x38);
        modalPacket.sendTo(target, 0);
        if (handler == undefined) handler = ()=>{}
        if (!FormData.has(target)) {
            FormData.set(target, [
                {
                    Id: formId,
                    func: handler
                }
            ])
        } else {
            let f = FormData.get(target)!;
            f.push({
                Id: formId,
                func: handler
            })
            FormData.set(target, f);
        }
        modalPacket.dispose();
    } catch (err) {}
}
nethook.raw(PacketId.ModalFormResponse).on((ptr, size, target) => {
    ptr.move(1);
    let formId = ptr.readVarUint();
    let formData = ptr.readVarString();
    let dataValue = FormData.get(target)!.find((v)=> v.Id == formId)!;
    let data = JSON.parse(formData.replace("\n",""));
    if (dataValue == undefined) return;
    dataValue.func(data);
    let f = FormData.get(target)!;
    f.splice(f.indexOf(dataValue), 1);
    FormData.set(target, f);
});

/////////////////////////////////////////
//TEXT
/**
 * NAME or NETWORKIDENTIFIER
 *
 *Type Code :
 * Raw == 0,
 * Chat == 1,
 * Translation == 2,
 * Popup == 3,
 * Jukeboxpopup == 4,
 * Tip == 5,
 * system == 6,
 * Whisper == 7,
 * Announcement == 8,
 * Json == 9,
*/
function sendText(target: NetworkIdentifier|string, text: string, type?: number) {
    let networkIdentifier:NetworkIdentifier;
    if (target instanceof NetworkIdentifier) networkIdentifier = target;
    else {
        networkIdentifier = IdByName(target);
    }
    if ( type == undefined || typeof type != "number") type = 0;
    const Packet = TextPacket.create();
    Packet.message = text;
    Packet.setUint32(type, 0x30);
    Packet.sendTo(networkIdentifier!, 0);
    Packet.dispose();
}

/////////////////////////////////////////
//transferServer

function transferServer(networkIdentifier: NetworkIdentifier, address: string, port: number) {
    const Packet = TransferPacket.create();
    Packet.address = address;
    Packet.port = port;
    Packet.sendTo(networkIdentifier, 0);
    Packet.dispose();
}

/////////////////////////////////////////
//Health

function setHealth(networkIdentifier: NetworkIdentifier, value: number) {
    const HealthPacket = SetHealthPacket.create();
    HealthPacket.setInt32(value, 0x30);
    HealthPacket.sendTo(networkIdentifier, 0);
    HealthPacket.dispose();
};

/////////////////////////////////////////
//Permission

function playerPermission(playerName: string, ResultEvent = (perm: any) => {}) {
    let xuid = nXt.get(playerName);
    var operJs:{permission:string, xuid:string}[];
    let permissions = '';
    try {
        operJs = JSON.parse(readFileSync("permissions.json", "utf8"));
        let Js = operJs.find((v)=> v.xuid == xuid);
        if (Js != undefined) permissions = Js.permission;
        if (Js == undefined) permissions = 'member';
    } catch(err) {
        permissions = 'member';
    }
    ResultEvent(permissions);
    return permissions;
};

/////////////////////////////////////////
//Score

function getScore(targetName: string, objectives: string, handler = (result: any) => {}) {
    system.executeCommand(`scoreboard players add @a[name="${targetName}",c=1] ${objectives} 0`, result => {
        // @ts-ignore
        let msgs = result.data.statusMessage;
        let msg = String(msgs).split('now');
        let a = String(msg[1]);
        let s = null;
        if (a.includes('-') == true) s = Number(a.replace(/[^0-9  ]/g, '')) - (Number(a.replace(/[^0-9  ]/g, '')) * 2);
        if (a.includes('-') == false) s = Number(a.replace(/[^0-9  ]/g, ''));
        handler(s);
    });
    return;
};

class ScoreTYPE {
	public TYPE_PLAYER = 1;
	public TYPE_ENTITY = 2;
	public TYPE_FAKE_PLAYER = 3;
}
class ScoreEntry {

	public scoreboardId:number;
	public objectiveName:string;
	public score:number;
	public type:number;
	public entityUniqueId:number|null;
	public customName:string|null;
}
class scoreboard{

	CreateSidebar(player:NetworkIdentifier, name:string, order:number) {
		const pkt = SetDisplayObjectivePacket.create();
        pkt.displaySlot = "sidebar";
        pkt.objectiveName = "2913:sidebar";
        pkt.displayName = name;
        pkt.criteriaName = "dummy";
        pkt.sortOrder = order;
		pkt.sendTo(player);
		pkt.dispose();
	}
	destroySidebar(player:NetworkIdentifier){
		const pkt = RemoveObjectivePacket.create();
        pkt.objectiveName = "2913:sidebar";
		pkt.sendTo(player);
		pkt.dispose();
	}
	SetSidebarValue(player:NetworkIdentifier, Id:number, name:string, score:number) {
		const pkt = SetScorePacket.create();
		// let entry = new ScoreEntry()
		// entry.objectiveName = '2913:sidebar';
		// entry.type = ScoreTYPE.prototype.TYPE_FAKE_PLAYER;
		// entry.score = score;
		// entry.scoreboardId = Id;
		// entry.customName = name;
		// console.log(JSON.stringify(entry));
		pkt.setCxxString('2913:sidebar', 0x48);
		pkt.setInt32(ScoreTYPE.prototype.TYPE_FAKE_PLAYER, 0x8B);
		pkt.setInt32(score, 0xC4);
		pkt.setInt32(Id, 0x57);
		pkt.setCxxString(name, 0x48);
		pkt.setInt32(0, 0x81);
		// pkt.setCxxString(JSON.stringify(entry), 0x48);
		pkt.sendTo(player);
		pkt.dispose();
	}
	CreateList(player:NetworkIdentifier, name:string, order:number) {
		const pkt = SetDisplayObjectivePacket.create();
		pkt.displaySlot = "list";
        pkt.objectiveName = "2913:list";
        pkt.displayName = name;
        pkt.criteriaName = "dummy";
        pkt.sortOrder = order;
		pkt.sendTo(player);
		pkt.dispose();
	}
    destroyList(player:NetworkIdentifier){
		const pkt = RemoveObjectivePacket.create();
        pkt.objectiveName = "2913:list";
		pkt.sendTo(player);
		pkt.dispose();
	}
}

const CustomScore = new scoreboard();

/////////////////////////////////////////
//Disconnect

function Disconnect(networkidentifier: NetworkIdentifier, message: string) {
    const Packet = DisconnectPacket.create();
    Packet.message = message;
    Packet.sendTo(networkidentifier, 0);
    Packet.dispose();
}

///////////////////////////////////////
//bossbar

function setBossBar(target: NetworkIdentifier, title: string, healthPercent: number): void {
    return;
    let pk = BossEventPacket.create();
    let uniqueId:any = target.getActor()?.getUniqueIdPointer().getBin64();
    pk.entityUniqueId = uniqueId;
    pk.type = 0;
    pk.title = title;
    pk.healthPercent = healthPercent;
    pk.unknown = "";
    pk.unknown2 = "";
    // pk.setBin(uniqueId, 0x40);
    // pk.setUint32(0, 0x48);
    // pk.setCxxString(title, 0x68);
    // pk.setFloat32(healthPercent, 0xA8);
    pk.sendTo(target);
    pk.dispose();
}

function deleteBossBar(target: NetworkIdentifier): void {
    return;
    let pk = BossEventPacket.create();
    let uniqueId:any = target.getActor()?.getUniqueIdPointer().getBin64();
    pk.setBin(uniqueId, 0x38);
    pk.setUint32(2, 0x40);
    pk.setCxxString("", 0x48);
    pk.setFloat32(0, 0x68);
    pk.sendTo(target);
    pk.dispose();
}

///////////////////////

function netCmd(handler = (ev:{command:string, networkIdentifier:NetworkIdentifier, originActor:Actor, originEntity: IEntity, originName: string, originXuid: string})=>{}) {
    nethook.before(PacketId.CommandRequest).on((pkt, target)=>{
        let data = DataById(target);
        let ev = {
            command: pkt.command,
            networkIdentifier: target,
            originActor: data[1],
            originEntity: data[2],
            originName: data[0],
            originXuid: data[3]
        }
        return handler(ev);
    })
}

function numberFormat(x:any) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function numberToKorean(number:number){
    var inputNumber:any  = number < 0 ? false : number;
    var unitWords    = ['', '만', '억', '조', '경'];
    var splitUnit    = 10000;
    var splitCount   = unitWords.length;
    var resultArray  = [];
    var resultString = '';

    for (var i = 0; i < splitCount; i++){
        let unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
        unitResult = Math.floor(unitResult);
        if (unitResult > 0){
            resultArray[i] = unitResult;
        }
    }

    for (var i = 0; i < resultArray.length; i++){
        if(!resultArray[i]) continue;
        resultString = String(numberFormat(resultArray[i])) + unitWords[i] + resultString;
    }
    if (number == 0) resultString = "0"

    return resultString;
}

function ListenInvTransaction(handler = (ev: {sactiontype: number;sourceType: number;CraftingAction: number;ReleaseAction: number;UseAction: number;useOnAction: number;networkIdentifier:NetworkIdentifier; size:number}) => {}){
    nethook.raw(PacketId.InventoryTransaction).on((ptr, size, networkIdentifier)=>{
        let sactiontype = ptr.readVarInt();
        let sourceType = ptr.readVarInt();
        let CraftingAction = ptr.readVarInt();
        let ReleaseAction = ptr.readVarInt();
        let UseAction = ptr.readVarInt();
        let useOnAction = ptr.readVarInt();
        let ev = {
            sactiontype: sactiontype,
            sourceType: sourceType,
            CraftingAction: CraftingAction,
            ReleaseAction: ReleaseAction,
            UseAction: UseAction,
            useOnAction: useOnAction,
            networkIdentifier: networkIdentifier,
            size: size
        }
        //console.log(`size : ${String(size)}\n\nsactiontype : ${String(sactiontype)}\nsourcetype : ${String(sourceType)}\nCraftingAction : ${String(CraftingAction)}\nReleaseAction : ${String(ReleaseAction)}\nUseAction : ${String(UseAction)}\nuseOnAction : ${String(useOnAction)}`)
        return handler(ev);
    });
}

console.log(red('2913MODULE LOADED'));
export {
    Formsend,
    XuidByName,
    IdByName,
    NameById,
    sendText,
    transferServer,
    setHealth,
    playerPermission,
    getScore,
    playerList,
    Disconnect,
    DataById,
    CustomScore,
    setBossBar,
    deleteBossBar,
    netCmd,
    numberToKorean,
    numberFormat,
    ListenInvTransaction,
    form
};
