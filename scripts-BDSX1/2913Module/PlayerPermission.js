const bdsx = require("bdsx");
const common = require("bdsx/common");
const system = server.registerSystem(0, 0);
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
function playerPermission(playerName, ResultEvent = () => {}) {
    var operJs;
    var permissions;
    var readReport = fs.readFileSync("permissions.json");
    operJs = JSON.parse(fs.readFileSync("permissions.json", "utf8"))
    var ojs = operJs.map((e, i) => e);
    ojs.forEach(function(element, index, array){
        if (element.xuid == nXt.get(playerName)) {
            permissions = element.permission;
        }
    });
    ResultEvent(permissions);
};
exports.playerPermission = playerPermission;
var nIt = new Map();
var nIt2 = new Map();
var nXt = new Map();
netevent.after(PacketId.Login).on((ptr, networkIdentifier) => {
    const [xuid, username] = netevent.readLoginPacket(ptr);
    nXt.set(username, xuid);
    nIt.set(username, networkIdentifier);
    nIt2.set(networkIdentifier, username);
    console.log(`${username}> added Form Data`);
});
netevent.close.on(networkIdentifier => {
    const id = nIt2.get(networkIdentifier);
    nXt.delete(id);
    nIt2.delete(networkIdentifier);
    nIt.delete(id);
    console.log(`${id}> deleted Form Data`);
});
