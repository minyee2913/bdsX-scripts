import { Actor, CANCEL, nethook, NetworkIdentifier, PacketId, RawTypeId } from "bdsx";
import { DataById, ListenInvTransaction, netCmd, playerPermission, sendText } from "./2913Module";
const system = server.registerSystem(0 ,0);

class Pos {
  x:number;
  y:number;
  z:number;
}
const timer = (ms: number) => new Promise(res=> setTimeout(res, ms));
class editor {
  public Leftclick = false;
  public Left:NodeJS.Timeout;
  public Rightclick = false;
  public Right:NodeJS.Timeout;
  public Pos1:Pos
  public Pos2:Pos
}
const editors = new Map<NetworkIdentifier, editor>();

ListenInvTransaction(ev => {
  if (!editors.has(ev.networkIdentifier)) {
    let js = new editor();
    editors.set(ev.networkIdentifier, js);
  }
  let tg = editors.get(ev.networkIdentifier)!;


  NetworkIdentifier.close.on((ni)=>{
    if (editors.has(ni)) {
      editors.delete(ni);
    }
  })

  //LEFT CLICK
  clearTimeout(tg.Left);
  tg.Left = setTimeout(()=>{
    leftEnd(ev.networkIdentifier);
  }, 500);
  if ( tg.Leftclick == false && ev.sourceType == 0 && ev.CraftingAction == 1 && ev.ReleaseAction == 0 && ev.useOnAction == 0 && ev.UseAction == 0 && ev.sactiontype == 15) {
    let [Name, actor, Entity, Xuid] = DataById(ev.networkIdentifier);
    let hand = system.getComponent(Entity, "minecraft:hand_container")!.data[0];
    if (hand.item == "minecraft:wooden_axe") {
      let Perm = playerPermission(Name);
      if (Perm == "operator") {
        let pos = system.getComponent(Entity, "minecraft:position")!.data;
        let p = new Pos();
        p.x = Math.floor(pos.x);
        p.y = Math.floor(pos.y);
        p.z = Math.floor(pos.z);
        system.executeCommand(`particle minecraft:dragon_destroy_block ${p.x} ${p.y} ${p.z}`, ()=>{});
        sendText(ev.networkIdentifier, `§a§l두번째 지점은 (${p.x}, ${p.y}, ${p.z}) 입니다`, 0);
        tg.Pos2 = p;
      }
    }
    tg.Leftclick = true;
  }

  //RIGHT CLICK
  clearTimeout(tg.Right);
  tg.Right = setTimeout(()=>{
    rightEnd(ev.networkIdentifier);
  }, 500);
  if ( tg.Rightclick == false && ev.sourceType == 0 && ev.CraftingAction == 1 && ev.ReleaseAction == 0 && ev.useOnAction == 1 && ev.UseAction == 0 && ev.sactiontype == 15) {
    let [Name, actor, Entity, Xuid] = DataById(ev.networkIdentifier);
    let hand = system.getComponent(Entity, "minecraft:hand_container")!.data[0];
    if (hand.item == "minecraft:wooden_axe") {
      let Perm = playerPermission(Name);
      if (Perm == "operator") {
        let pos = system.getComponent(Entity, "minecraft:position")!.data;
        let p = new Pos();
        p.x = Math.floor(pos.x);
        p.y = Math.floor(pos.y);
        p.z = Math.floor(pos.z);
        system.executeCommand(`particle minecraft:dragon_destroy_block ${p.x} ${p.y} ${p.z}`, ()=>{});
        sendText(ev.networkIdentifier, `§a§l첫번째 지점은 (${p.x}, ${p.y}, ${p.z}) 입니다`, 0);
        tg.Pos1 = p;
      }
    }
    tg.Rightclick = true;
  }

  editors.set(ev.networkIdentifier, tg);
});
function leftEnd(target:NetworkIdentifier){
  let tg = editors.get(target)!;
  tg.Leftclick = false;
  editors.set(target, tg);
}
function rightEnd(target:NetworkIdentifier){
  let tg = editors.get(target)!;
  tg.Rightclick = false;
  editors.set(target, tg);
}

netCmd(async ev => {
  if (ev.command == "//set" && playerPermission(ev.originName) == "operator") {
    sendText(ev.networkIdentifier, "§c§l//set <블럭>:<data>", 0);
    return CANCEL;
  }
  if (ev.command.startsWith("//set ") && playerPermission(ev.originName) == "operator") {
    if (!editors.has(ev.networkIdentifier)) {
      sendText(ev.networkIdentifier, "§c§l구역을 먼저 지정하세요!", 0);
      return CANCEL;
    } else {
      let cmd = ev.command.replace("//set ", "");
      let block:string;
      let data:number;
      if (cmd.includes(":")) {
        let oo = cmd.split(":");
        block = oo[0];
        data = Number(oo[1]);
      } else {
        block = cmd;
        data = 0;
      }
      BuildTask(ev, `${block} ${data}`);
      return CANCEL;
    }
  }


  if (ev.command == "//cut" && playerPermission(ev.originName) == "operator") {
    if (!editors.has(ev.networkIdentifier)) {
      sendText(ev.networkIdentifier, "§c§l구역을 먼저 지정하세요!", 0);
      return CANCEL;
    } else {
      BuildTask(ev, `air 0`);
      return CANCEL;
    }
  }


  if (ev.command.startsWith("//up ") && playerPermission(ev.originName) == "operator") {
    let value = ev.command.replace("//up ", "");
    system.executeCommand(`execute @a[name="${ev.originName}"] ~ ~ ~ setblock ~ ~${value} ~ glass`, () => { });
    system.executeCommand(`execute @a[name="${ev.originName}"] ~ ~ ~ tp @s ~ ~${value} ~`, () => { });
    system.executeCommand(`execute @a[name="${ev.originName}"] ~ ~ ~ tp @s ~ ~0.65 ~`, () => { });
    system.executeCommand(`tellraw @a[name="${ev.originName}"] {"rawtext":[{"text":"§dUP ${value}"}]}`, () => { });
    return CANCEL;
  }


  if (ev.command == "//replace" && playerPermission(ev.originName) == "operator") {
    sendText(ev.networkIdentifier, "§c§l//replace <블럭>:<data> <대상블럭>", 0);
    return CANCEL;
  }
  if (ev.command.startsWith("//replace ") && playerPermission(ev.originName) == "operator") {
    if (!editors.has(ev.networkIdentifier)) {
      sendText(ev.networkIdentifier, "§c§l구역을 먼저 지정하세요!", 0);
      return CANCEL;
    } else {
      let cmd = ev.command.replace("//replace ", "").split(" ");
      let block:string;
      let data:number;
      if (cmd.includes(":")) {
        let oo = cmd[0].split(":");
        block = oo[0];
        data = Number(oo[1]);
      } else {
        block = cmd[0];
        data = 0;
      }
      if (cmd[1] == undefined) cmd[1] = "air";
      BuildTask(ev, `${block} ${data} replace ${cmd[1]}`);
      return CANCEL;
    }
  }


  if (ev.command == "//destroy" && playerPermission(ev.originName) == "operator") {
    sendText(ev.networkIdentifier, "§c§l//destroy <블럭>:<data>", 0);
    return CANCEL;
  }
  if (ev.command.startsWith("//destroy ") && playerPermission(ev.originName) == "operator") {
    if (!editors.has(ev.networkIdentifier)) {
      sendText(ev.networkIdentifier, "§c§l구역을 먼저 지정하세요!", 0);
      return CANCEL;
    } else {
      let cmd = ev.command.replace("//destroy ", "");
      let block:string;
      let data:number;
      if (cmd.includes(":")) {
        let oo = cmd.split(":");
        block = oo[0];
        data = Number(oo[1]);
      } else {
        block = cmd;
        data = 0;
      }
      BuildTask(ev, `${block} ${data} destroy`);
      return CANCEL;
    }
  }
  if (ev.command == "//keep" && playerPermission(ev.originName) == "operator") {
    sendText(ev.networkIdentifier, "§c§l//keep <블럭>:<data>", 0);
    return CANCEL;
  }
  if (ev.command.startsWith("//keep ") && playerPermission(ev.originName) == "operator") {
    if (!editors.has(ev.networkIdentifier)) {
      sendText(ev.networkIdentifier, "§c§l구역을 먼저 지정하세요!", 0);
      return CANCEL;
    } else {
      let cmd = ev.command.replace("//keep ", "");
      let block:string;
      let data:number;
      if (cmd.includes(":")) {
        let oo = cmd.split(":");
        block = oo[0];
        data = Number(oo[1]);
      } else {
        block = cmd;
        data = 0;
      }
      BuildTask(ev, `${block} ${data} keep`);
      return CANCEL;
    }
  }
});

async function BuildTask(ev:any, cmd:string){
  let tg = editors.get(ev.networkIdentifier)!;
  let p1y = 0;
  let p2y = 0;
  let p1x = 0;
  let p2x = 0;
  let p1z = 0;
  let p2z = 0;
  if (tg.Pos1.x >= tg.Pos2.x) p1x = tg.Pos1.x;
  if (tg.Pos1.x <= tg.Pos2.x) p1x = tg.Pos2.x;
  if (tg.Pos1.x >= tg.Pos2.x) p2x = tg.Pos2.x;
  if (tg.Pos1.x <= tg.Pos2.x) p2x = tg.Pos1.x;

  if (tg.Pos1.y >= tg.Pos2.y) p1y = tg.Pos1.y;
  if (tg.Pos1.y <= tg.Pos2.y) p1y = tg.Pos2.y;
  if (tg.Pos1.y >= tg.Pos2.y) p2y = tg.Pos2.y;
  if (tg.Pos1.y <= tg.Pos2.y) p2y = tg.Pos1.y;

  if (tg.Pos1.z >= tg.Pos2.z) p1z = tg.Pos1.z;
  if (tg.Pos1.z <= tg.Pos2.z) p1z = tg.Pos2.z;
  if (tg.Pos1.z >= tg.Pos2.z) p2z = tg.Pos2.z;
  if (tg.Pos1.z <= tg.Pos2.z) p2z = tg.Pos1.z;
  for (;p2z <= p1z;p2z++) {
    for (let x = p2x;x <= p1x;x++) {
      system.executeCommand(`fill ${x} ${p1y} ${p2z} ${x} ${p2y} ${p2z} ${cmd}`, ()=>{});
      await timer(30);
    }
    system.executeCommand(`title "${ev.originName}" title §l`, ()=>{});
    system.executeCommand(`title "${ev.originName}" subtitle §l§a${p2z} / ${p1z}`, ()=>{});
    await timer(30);
  }
}

import { green } from 'colors';
console.log(green('worldedit.ts loaded'));
export {};
