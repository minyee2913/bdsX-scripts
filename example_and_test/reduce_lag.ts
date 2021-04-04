import { bedrockServer } from "bdsx";

const system = server.registerSystem(0,0);

let query = system.registerQuery();

let i = setInterval(()=>{
    let entities = system.getEntitiesFromQuery(query);
    if (typeof entities === "object") {
        for (let i = 0; i <= entities.length; i++) {
            let entity = entities[i];
            if (typeof entity === "object") {
                if (entity.__identifier__ !== "minecraft:player") {
                    if (system.hasComponent(entity, "minecraft:ticking_area_description")) system.destroyComponent(entity, "minecraft:ticking_area_description");
                    if (system.hasComponent(entity, "minecraft:lookat")) system.destroyComponent(entity, "minecraft:lookat");
                    return;
                }
                return;
            }
            return;
        }
        return;
    }
},5000);

bedrockServer.close.on(()=>{
    clearInterval(i);
});
