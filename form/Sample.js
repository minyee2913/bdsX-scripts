const bdsx = require("bdsx");
var form = require("./JSform.js");

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
            var playerName = form.nIt2.get(target);
            if (data >= 0) system.executeCommand(`say ${data}`, () => {});
            if (data >= 0) system.executeCommand(`execute "${playerName}" ~ ~ ~ playsound note.hat @s`, () => {});
        });
    }
});
console.log(Sample Form.js is loaded);
