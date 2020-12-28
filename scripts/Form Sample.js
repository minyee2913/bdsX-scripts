const bdsx = require("bdsx");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
var form = require("./2913Module/JSform.js");
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
bdsx.command.hook.on((command, originName) => {
    if (originName != 'Server' && command == '/form') {
        var target = form.nIt.get(originName);
        form.send(target, {
            type: "form",
            title: "Sample Form",
            content: "made by minyee2913",
            buttons: [
                {
                    "text": "say 0"

                },
                {
                    "text": "say 1"

                }
            ]
        },data => {
            if (data == null) return;
            var playerName = form.nIt2.get(target);
            if (data == 0) system.executeCommand(`say 0`, () => {});
            if (data == 0) system.executeCommand(`say 1`, () => {});
        });
        return 0;
    }
    if (originName != 'Server' && command == '/custom_form') {
        var target = form.nIt.get(originName);
        var Arr = ["one", "two", "three", "four"];
        form.send(target, {
            type: "custom_form",
            title: "Custom Form Sample",
            content: [
                {
                    "type": "label",
                    "text": "label"
                },
                {
                    "type": "dropdown",
                    "text": "dropdown",
                    "options": Arr
                },
                {
                    "type": "input",
                    "text": "input",
                    "placeholder": "placeholder"
                },
                {
                    "type": "slider",
                    "text": "slider",
                    "min": 0,
                    "max": 10
                },
                {
                    "type": "step_slider",
                    "text": "step slider",
                    "steps": Arr
                },
                {
                    "type": "toggle",
                    "text": "toggle",
                    "default": false
                }
            ]
        },data => {
            if (data == null) return;
            var Data = form.dataFix(data);
            var playerName = form.nIt2.get(target);
            var [label, dropdown, input, slider, step_slider, toggle] = Data;
            console.log(Data);
            console.log(`Player : ${playerName}, label : ${label}, dropdown : ${Arr[dropdown]}, input : ${input}, slider : ${slider}, step slider : ${Arr[step_slider]}, toggle : ${toggle}`);
            system.executeCommand(`execute "${playerName}" ~ ~ ~ tellraw @s {"rawtext":[{"text":"Player : ${playerName}, label : ${label}, dropdown : ${Arr[dropdown]}, input : ${input}, slider : ${slider}, step slider : ${Arr[step_slider]}, toggle : ${toggle}"}]}`, () => {});
        });
        return 0;
    }
});
console.log('Sample Form.js is loaded');
