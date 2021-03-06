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
import { PacketId, command, NetworkIdentifier, MinecraftPacketIds, RawTypeId, Actor, nethook, ServerPlayer } from "bdsx";
import { BossEventPacket, ContainerOpenPacket, DisconnectPacket, ModalFormRequestPacket, RemoveObjectivePacket, SetDisplayObjectivePacket, SetHealthPacket, SetScorePacket, TextPacket, TransferPacket } from "bdsx/bds/packets";
import { red } from 'colors';
import { open, readFileSync, writeFileSync } from "fs";
const system = server.registerSystem(0,0);

let playerList:string[] = [];
let nIt = new Map();
let nMt = new Map();
let nXt = new Map();
nethook.after(PacketId.Login).on((ptr, networkIdentifier) => {
    const cert = ptr.connreq.cert;
    const xuid = cert.getXuid();
    const username = cert.getId();
    nXt.set(username, xuid);
    nIt.set(username, networkIdentifier);
    nMt.set(networkIdentifier, username);
});
nethook.after(PacketId.SetLocalPlayerAsInitialized).on((ptr, target) => {
    let actor = target.getActor();
    let entity = actor!.getEntity();
    let playerName = system.getComponent(entity, "minecraft:nameable")!.data.name;
    setTimeout(()=>{
        if(!playerList.includes(playerName)) playerList.push(playerName);
    },100);
});
NetworkIdentifier.close.on(networkIdentifier => {
    const id = nMt.get(networkIdentifier);
    if (playerList.includes(id)) playerList.splice(playerList.indexOf(id),1);
    nXt.delete(id);
    nMt.delete(networkIdentifier);
    nIt.delete(id);
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
    let Rlt:string = nMt.get(networkIdentifier);
    return Rlt;
}
/**
  *get playerData by Id
  *result = [name,actor,entity, xuid]
*/
function DataById(networkIdentifier: NetworkIdentifier) {
    let actor = networkIdentifier.getActor();
    let entity = actor!.getEntity();
    let name = system.getComponent(entity, "minecraft:nameable")!.data.name;
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

let FormDataSaver = new Map;
let FormDataloader = new Map;

/**
  *JsonType example : https://github.com/NLOGPlugins/Form_Json
*/
function Formsend(networkIdentifier: NetworkIdentifier, form: object, handler = (data: any) => {}) {
    try {
        const modalPacket = ModalFormRequestPacket.create();
        let formId = Math.floor(Math.random() * 2147483647) + 1;
        modalPacket.setUint32(formId, 0x28);
        modalPacket.setCxxString(JSON.stringify(form), 0x30);
        modalPacket.sendTo(networkIdentifier, 0);
        FormDataSaver.set(formId, handler);
        FormDataloader.set(networkIdentifier, formId);
        modalPacket.dispose();
    } catch (err) {}
}
nethook.raw(PacketId.ModalFormResponse).on((ptr, size, networkIdentifier) => {
    let datas: {[key: string]: any} = {};
    ptr.move(1);
    datas.formId = ptr.readVarUint();
    datas.formData = ptr.readVarString();
    let dataValue = FormDataloader.get(networkIdentifier);
    if (datas.formId == dataValue) {
        let dataResult = FormDataSaver.get(dataValue);
        var data = JSON.parse(datas.formData.replace("\n",""));
        FormDataSaver.delete(dataValue);
        FormDataloader.delete(networkIdentifier);
        dataResult(data);
    }
});

/////////////////////////////////////////
//TEXT
/**
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
function sendText(networkIdentifier: NetworkIdentifier, text: string, type: number) {
    const Packet = TextPacket.create();
    Packet.message = text;
    Packet.setUint32(type, 0x28);
    Packet.sendTo(networkIdentifier, 0);
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
    HealthPacket.setInt32(value, 0x28);
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
		pkt.setCxxString("sidebar", 0x28);
		pkt.setCxxString("2913:sidebar", 0x48);
		pkt.setCxxString(name, 0x68)
		pkt.setCxxString("dummy", 0x88);
		pkt.setInt32(order, 0xA8);
		pkt.sendTo(player);
		pkt.dispose();
	}
	destroySidebar(player:NetworkIdentifier){
		const pkt = RemoveObjectivePacket.create();
		pkt.setCxxString("2913:sidebar", 0x28);
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
		pkt.setCxxString("list", 0x28);
		pkt.setCxxString("2913:list", 0x48);
		pkt.setCxxString(name, 0x68)
		pkt.setCxxString("dummy", 0x88);
		pkt.setInt32(order, 0xA8);
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
    let pk = BossEventPacket.create();
    let uniqueId:any = target.getActor()?.getUniqueIdPointer().getBin64();
    pk.setBin(uniqueId, 0x30);
    pk.setUint32(0, 0x40);
    pk.setCxxString(title, 0x48);
    pk.setFloat32(healthPercent, 0x68);
    pk.sendTo(target);
    pk.dispose();
}

function deleteBossBar(target: NetworkIdentifier): void {
    let pk = BossEventPacket.create();
    let uniqueId:any = target.getActor()?.getUniqueIdPointer().getBin64();
    pk.setBin(uniqueId, 0x30);
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
        console.log(`size : ${String(size)}\n\nsactiontype : ${String(sactiontype)}\nsourcetype : ${String(sourceType)}\nCraftingAction : ${String(CraftingAction)}\nReleaseAction : ${String(ReleaseAction)}\nUseAction : ${String(UseAction)}\nuseOnAction : ${String(useOnAction)}`)
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
    ListenInvTransaction
};
