const system = server.registerSystem(0,0);

system.listenForEvent("minecraft:entity_created", ev=>{
    let entity = ev.data.entity;
    setTimeout(()=>{
        if (typeof entity === "object") {
            if (entity.__identifier__ !== "minecraft:player") {
                if (system.hasComponent(entity, "minecraft:ticking_area_description")) system.destroyComponent(entity, "minecraft:ticking_area_description");
                if (system.hasComponent(entity, "minecraft:lookat")) system.destroyComponent(entity, "minecraft:lookat");
            }
        }
    },1000);
});
