const bdsx = require("bdsx");
const common = require("bdsx/common");
const system = server.registerSystem(0, 0);
const fs = require('fs');
var Pms = require('./2913Module/PlayerPermission.js');

bdsx.command.hook.on((command, originName) => {
    if (command == '/test' && originName != 'Server') {
        Pms.playerPermission(originName, perms => {
            system.executeCommand(`tellraw "${originName}" {"rawtext":[{"text":"You are ${perms}"}]}`, () => {});
        })
        return 0;
    }
});
console.log("GetPermission Sample.js loaded");
