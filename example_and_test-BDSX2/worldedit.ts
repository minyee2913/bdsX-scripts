"use strict";

import { Minecraft } from "bdsx/bds/server";

/// <reference types="minecraft-scripting-types-server" />
Object.defineProperty(exports, "__esModule", { value: true });
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
const system = server.registerSystem(0, 0);

var names: any[] = [];
var pos1: any[] = [];
var pos2: any[] = [];
var lastpos1: any[] = [];
var lastpos2: any[] = [];
var c_undo: any[] = [];
var c_redo: any[] = [];
system.initialize = function() {
    system.executeCommand(`scoreboard objectives add pos1 dummy`, () => {});
    system.executeCommand(`scoreboard objectives add pos2 dummy`, () => {});
    system.executeCommand(`scoreboard objectives add lastpos1 dummy`, () => {});
    system.executeCommand(`scoreboard objectives add lastpos2 dummy`, () => {});
}
function spl(pos: any) {
    let posT = pos.split(' ');
    let posX = posT[0];
    let posY = posT[1];
    let posZ = posT[2];
    return {posX, posY, posZ};
}
system.listenForEvent("minecraft:player_placed_block", eventData => {
  var Player = eventData.data.player;
  const eventerName = system.getComponent(Player, MinecraftComponent.Nameable)!.data.name;
  let nts = names.includes(`${eventerName}`);
  if (nts === false) {
      names.push(`${eventerName}`);
      pos1.push('~ ~ ~');
      pos2.push('~ ~ ~');
      c_undo.push('undefined');
      c_redo.push('undefined');
  }
  let nameState = names.indexOf(`${eventerName}`);
  let handContainer = system.getComponent(Player, MinecraftComponent.HandContainer)!;
  let handItem = handContainer.data[0];
  if (handItem.item == "2913:pos1_axe") {
        let pos = eventData.data.block_position;
        pos1.splice(nameState,1,`${pos.x} ${pos.y} ${pos.z}`);
        system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"${eventerName} : §7Pos1이(가) §a${pos1[nameState]} §7로 설정되었습니다"}]}`, () => {});
        system.executeCommand(`fill ${pos1[nameState]} ${pos1[nameState]} air 0 replace 2913:detect`, () => {});
  }
});
system.listenForEvent("minecraft:player_placed_block", eventData => {
  var Player = eventData.data.player;
  const eventerName = system.getComponent(Player, MinecraftComponent.Nameable)!.data.name;
  let nts = names.includes(`${eventerName}`);
  if (nts === false) {
      names.push(`${eventerName}`);
      pos1.push('~ ~ ~');
      pos2.push('~ ~ ~');
      c_undo.push('undefined');
      c_redo.push('undefined');
  }
  let nameState = names.indexOf(`${eventerName}`);
  let handContainer = system.getComponent(Player, MinecraftComponent.HandContainer)!;
  let handItem = handContainer.data[0];
  if (handItem.item == "2913:pos2_axe") {
        let pos = eventData.data.block_position;
        pos2.splice(nameState,1,`${pos.x} ${pos.y} ${pos.z}`);
        system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"${eventerName} : §7Pos2이(가) §a${pos2[nameState]} §7로 설정되었습니다"}]}`, () => {});
        system.executeCommand(`fill ${pos2[nameState]} ${pos2[nameState]} air 0 replace 2913:detect`, () => {});
  }
});
system.listenForEvent("minecraft:player_placed_block", eventData => {
  var Player = eventData.data.player;
  const eventerName = system.getComponent(Player, MinecraftComponent.Nameable)!.data.name;
  let nts = names.includes(`${eventerName}`);
  if (nts === false) {
      names.push(`${eventerName}`);
      pos1.push('~ ~ ~');
      pos2.push('~ ~ ~');
      c_undo.push('undefined');
      c_redo.push('undefined');
  }
  let nameState = names.indexOf(`${eventerName}`);
  let playerHotbar = system.getComponent(eventData.data.player, MinecraftComponent.HotbarContainer)!;
  let handContainer = system.getComponent(Player, MinecraftComponent.HandContainer)!;
  let handItem = handContainer.data[0];
  let block = playerHotbar.data[0].item;
  let blockName;
  blockName = block.replace("minecraft:","").replace("undefined","air").replace("water_bucket","water").replace("lava_bucket","lava").replace("2913:detect","dirt");
  if (handItem.item == "2913:set") {
      let pos = eventData.data.block_position;
      system.executeCommand(`fill ${pos.x} ${pos.y} ${pos.z} ${pos.x} ${pos.y} ${pos.z} air 0 replace 2913:detect `, () => {});
      if (pos1[nameState] == '~ ~ ~' || pos2[nameState] == '~ ~ ~') {
          system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cPos1, Pos2를 설정하세요!"}]}`, () => {});
          return 0;
      }
      let data;
      if (playerHotbar.data[0].count != 64) data = playerHotbar.data[0].count;
      if (playerHotbar.data[0].count == 64) data = 0;
      system.executeCommand(`structure save "${eventerName}undo" ${pos1[nameState]} ${pos2[nameState]}`, () => {});
      let posT1 = pos1[nameState].split(' ');
      let posX1 = Number(posT1[0]);
      let posY1 = Number(posT1[1]);
      let posZ1 = Number(posT1[2]);
      let posT2 = pos2[nameState].split(' ');
      let posX2 = Number(posT2[0]);
      let posY2 = Number(posT2[1]);
      let posZ2 = Number(posT2[2]);
      let p1y = 0;
      let p2y = 0;
      if (posY1 >= posY2) p1y = posY1;
      if (posY1 <= posY2) p1y = posY2;
      if (posY1 >= posY2) p2y = posY2;
      if (posY1 <= posY2) p2y = posY1;
      var mX = Math.abs(posX1 - posX2);
      var mZ = Math.abs(posZ1 - posZ2);
      var mY = Math.abs(posY1 - posY2);
      if (mX > 64 || mY > 64 || mZ > 64) c_undo.splice(nameState,1,`§cfalse`);
      if (mX <= 64 && mZ <= 64 && mY <= 64) c_undo.splice(nameState,1,`§atrue`);
      system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"{\n §7Editor : §a${eventerName}\n §7Pos1 :§a ${pos1[nameState]}\n §7Pos2 :§a ${pos2[nameState]}\n §7Block :§a ${blockName}\n §7Data :§a ${data}\n §7Can Undo : ${c_undo[nameState]} §r\n}"}]}`, () => {});
      while(p2y <= p1y) {
        system.executeCommand(`title "${eventerName}" times 0 10000 10`, (crd) => {});
        system.executeCommand(`title "${eventerName}" subtitle ${p2y}/${p1y}`, (crd) => {});
        system.executeCommand(`title "${eventerName}" title §l`, (crd) => {});
        system.executeCommand(`fill ${posX1} ${p2y} ${posZ1} ${posX2} ${p2y} ${posZ2} ${blockName} ${data}`, (crd) => {});
        p2y++;
      }
      system.executeCommand(`title "${eventerName}" times 10 100 10`, (crd) => {});
      system.executeCommand(`title "${eventerName}" title §l`, (crd) => {});
      system.executeCommand(`title "${eventerName}" subtitle §a§l${p1y}/${p1y}`, (crd) => {});
      lastpos1.splice(nameState,1,`${pos1}`);
      lastpos2.splice(nameState,1,`${pos2}`);
  }
});
system.listenForEvent("minecraft:player_placed_block", eventData => {
  var Player = eventData.data.player;
  const eventerName = system.getComponent(Player, MinecraftComponent.Nameable)!.data.name;
  let nts = names.includes(`${eventerName}`);
  if (nts === false) {
    names.push(`${eventerName}`);
    pos1.push('~ ~ ~');
    pos2.push('~ ~ ~');
    c_undo.push('undefined');
    c_redo.push('undefined');
  }
  let nameState = names.indexOf(`${eventerName}`);
  let handContainer = system.getComponent(Player, MinecraftComponent.HotbarContainer)!;
  let handItem = handContainer.data[0];
  if (handItem.item == "2913:undo") {
      let pos = eventData.data.block_position;
      system.executeCommand(`fill ${pos.x} ${pos.y} ${pos.z} ${pos.x} ${pos.y} ${pos.z} air 0 replace 2913:detect`, () => {});
      if (c_undo[nameState] === 'undefined') {
        system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"§7아무것도 정의되지 않았습니다"}]}`, () => {});
        return 0;
      }
      system.executeCommand(`structure save "${eventerName}redo" ${lastpos1[nameState]} ${lastpos2[nameState]}`, () => {});
      let posT1 = lastpos1[nameState].split(' ');
      let posX1 = Number(posT1[0]);
      let posY1 = Number(posT1[1]);
      let posZ1 = Number(posT1[2]);
      let posT2 = lastpos2[nameState].split(' ');
      let posX2 = Number(posT2[0]);
      let posY2 = Number(posT2[1]);
      let posZ2 = Number(posT2[2]);
      let p1x = 0; let p1y = 0; let p1z = 0;
      if (posZ1 <= posZ2) p1z = posZ1;
      if (posZ1 >= posZ2) p1z = posZ2;
      if (posX1 <= posX2) p1x = posX1;
      if (posX1 >= posX2) p1x = posX2;
      if (posY1 <= posY2) p1y = posY1;
      if (posY1 >= posY2) p1y = posY2;
      c_redo.splice(nameState,1,`defined`);
      if (c_undo[nameState] === '§atrue') {
        system.executeCommand(`structure load "${eventerName}undo" ${p1x} ${p1y} ${p1z}`, (crd) => {
            system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"§a복구 완료"}]}`, () => {});
        });
      }
      if (c_undo[nameState] === '§cfalse') {
        system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"§c복구할 수 없습니다"}]}`, () => {});
      }
  }
});
system.listenForEvent("minecraft:player_placed_block", eventData => {
  var Player = eventData.data.player;
  const eventerName = system.getComponent(Player, MinecraftComponent.Nameable)!.data.name;
  let nts = names.includes(`${eventerName}`);
  if (nts === false) {
    names.push(`${eventerName}`);
    pos1.push('~ ~ ~');
    pos2.push('~ ~ ~');
    c_undo.push('undefined');
    c_redo.push('undefined');
  }
  let nameState = names.indexOf(`${eventerName}`);
  let handContainer = system.getComponent(Player, MinecraftComponent.HandContainer)!;
  let handItem = handContainer.data[0];
  if (handItem.item == "2913:redo") {
      let pos = eventData.data.block_position;
      system.executeCommand(`fill ${pos.x} ${pos.y} ${pos.z} ${pos.x} ${pos.y} ${pos.z} air 0 replace 2913:detect`, () => {});
      if (c_redo[nameState] === 'undefined') {
        system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"§7정의된 복구 기록이 없습니다"}]}`, () => {});
        return 0;
      }
      let posT1 = lastpos1[nameState].split(' ');
      let posX1 = Number(posT1[0]);
      let posY1 = Number(posT1[1]);
      let posZ1 = Number(posT1[2]);
      let posT2 = lastpos2[nameState].split(' ');
      let posX2 = Number(posT2[0]);
      let posY2 = Number(posT2[1]);
      let posZ2 = Number(posT2[2]);
      let p1x = 0; let p1y = 0; let p1z = 0;
      let p2x = 0; let p2y = 0; let p2z = 0;
      if (posZ1 <= posZ2) p1z = posZ1;
      if (posZ1 >= posZ2) p1z = posZ2;
      if (posX1 <= posX2) p1x = posX1;
      if (posX1 >= posX2) p1x = posX2;
      if (posY1 <= posY2) p1y = posY1;
      if (posY1 >= posY2) p1y = posY2;
      system.executeCommand(`structure load "${eventerName}redo" ${p1x} ${p1y} ${p1z}`, (crd) => {
          system.executeCommand(`execute "${eventerName}" ~ ~ ~ tellraw @a {"rawtext":[{"text":"§a재실행 완료 ${p1x} ${p1y} ${p1z}"}]}`, () => {});
      });
  }
});
import { green } from 'colors';
console.log(green('worldedit.js loaded'));
export {};