import { IdByName, sendText } from './2913Module';
const system = server.registerSystem(0,0);

system.listenForEvent("minecraft:entity_hurt", eventData => {
	try {
    let attacker = eventData.data.attacker;
	  let cause = eventData.data.cause;
    let entity = eventData.data.entity;
    let damage = eventData.data.damage;
    const healthMax = system.getComponent(entity, "minecraft:health")!.data.max;
    const healthBefore = system.getComponent(entity, "minecraft:health")!.data.value;
    let healthNow = healthBefore - damage;
    if (healthNow < 0) healthNow = 0;
    let hitter = '';
    if (attacker != undefined) hitter = system.getComponent(attacker, "minecraft:nameable")!.data.name;
    const entityName = system.getComponent(entity, "minecraft:nameable")!.data.name;
    if (attacker != undefined && attacker.__identifier__ == 'minecraft:player') sendText(IdByName(hitter), `§c§lDamage done: §6${damage}\n§aTarget Health: ${healthNow} / ${healthMax}` , 5);
    if (entity.__identifier__ == 'minecraft:player') sendText(IdByName(entityName), `§c§lDamage taken: §6${damage}\n§a` , 5);
  } catch(err) {}
});

import { green } from 'colors';
console.log(green('damageHandler.ts loaded'));
export {};
