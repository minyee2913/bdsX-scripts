const system = server.registerSystem(0, 0);
system.listenForEvent("minecraft:entity_hurt", eventData => {
	let attacker = eventData.data.attacker;
	let cause = eventData.data.cause;
	if (cause === "projectile") {
		try {
			const attackerName = system.getComponent(attacker, "minecraft:nameable")!.data.name;
			system.executeCommand(`execute "${attackerName}" ~ ~ ~ playsound random.orb @s ~ ~ ~ 1 0.5`, () => {});
		} catch { return }
	}
})
import { green } from 'colors';
console.log(green('bowDing.ts loaded'));
