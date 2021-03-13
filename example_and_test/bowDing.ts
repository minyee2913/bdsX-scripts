const system = server.registerSystem(0, 0);
system.listenForEvent("minecraft:entity_hurt", eventData => {
	const { 
		attacker,
		entity,
		cause
	} = eventData.data
	if (cause === "projectile") {
		const attackerName = system.getComponent(attacker, MinecraftComponent.Nameable)!.data.name;
		system.executeCommand(`execute "${attackerName}" ~ ~ ~ playsound random.orb @s ~ ~ ~ 1 0.5`, () => {});
	}
})
import { green } from 'colors';
console.log(green('bowDing.ts loaded'));
