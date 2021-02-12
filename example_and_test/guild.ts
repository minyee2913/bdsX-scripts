import { Actor, CANCEL, command, MinecraftPacketIds, netevent, NetworkIdentifier } from "bdsx";
import { bedrockServer } from "bdsx/launcher";
import { open, readFile, readFileSync, writeFileSync } from "fs";
import { Formsend, IdByName, NameById, sendText, DataById, playerList, XuidByName } from "./2913Module";

const system = server.registerSystem(0, 0);

let dummyG = [{
    Name: '-',
    guildID: 0,
    subtitle: '',
    level: 0,
    xp: 0,
    xpM: 0,
    PMC: 0,
    o: '공개'
}]

let dummyPl = [{
    Name: '-',
    xuid: '',
    guildID: 0,
    perm: ''
}]
let localfile = "data/Guild/guilds.json";
let localfilePlayer = "data/Guild/player.json";

export let guildJs:any[] = [];
export let dataJs:any[] = [];
let inviteJs:any[] = [];

open(localfile,'a+',function(err:any,fd:any){
    if(err) throw err;
    try {
        JSON.parse(readFileSync(localfile, "utf8"));
    } catch (err) {
        writeFileSync(localfile, JSON.stringify(dummyG), "utf8")
    }
    guildJs = JSON.parse(readFileSync(localfile, "utf8"));
});
open(localfilePlayer,'a+',function(err:any,fd:any){
    if(err) throw err;
    try {
        JSON.parse(readFileSync(localfilePlayer, "utf8"));
    } catch (err) {
        writeFileSync(localfilePlayer, JSON.stringify(dummyPl), "utf8")
    }
    dataJs = JSON.parse(readFileSync(localfilePlayer, "utf8"));
});
netevent.before(MinecraftPacketIds.CommandRequest).on((ev, networkIdentifier) => {
    if (ev.command == '/guild') {
        Nready(networkIdentifier);
        return CANCEL;
    };
    if (ev.command == '/guild invite') {
        Ginvlist(networkIdentifier);
        return CANCEL;
    };
});
system.listenForEvent('minecraft:entity_use_item', eventData => {
    if (eventData.data.entity.__identifier__ === 'minecraft:player' && eventData.data.item_stack.item === 'play:guild') {
      let target:any = Actor.fromEntity(eventData.data.entity)?.getNetworkIdentifier();
      Nready(target);
    }
});

export function Nready(target:NetworkIdentifier) {
    let gjs = dataJs.map((e:any) => e.Name);
    let playerName = DataById(target)[0];
    if (gjs.includes(`$${playerName}`) == true) {
        let data = dataJs.filter((e:any) => e.Name == `$${playerName}`)[0];
        if (data.perm == 'break') {
            Formsend(target, {
                type:"custom_form",
                title:"길드",
                content: [
                    {
                        "type": "label", 
                        "text": "§c§l길드가 해산되었습니다!"
                    }
                ]
            }, () => {
                let state = dataJs.indexOf(data);
                dataJs.splice(state, 1);
                Nmain(target);
            });
        } else if (data.perm == 'kicked') {
            Formsend(target, {type:"custom_form",title:"길드",content: [{"type": "label", "text": "§c§l길드에서 추방당했습니다!"}]}, () => {
                let state = dataJs.indexOf(data);
                dataJs.splice(state, 1);
                Nmain(target);
            });
        }
    } else if (gjs.includes(playerName) == false) {
        Nmain(target);
    } else {
        let data = dataJs.filter((e:any) => e.Name == playerName)[0];
        if (data.perm == 'leader') {
            Nmain2L(target);
        }
        if (data.perm == 'subleader') {
            Nmain2S(target);
        }
        if (data.perm == 'member') {
            Nmain2M(target);
        }
    };
}
function Nmain(target:NetworkIdentifier) {
    Formsend(target, {
        type: "form",
        title: "길드",
        content: '',
        buttons: [
            {
                "text": "길드 랭킹"
            },
            {
                "text": "길드 찾기"
            },
            {
                "text": "길드 만들기"
            },
            {
                "text": "초대장"
            }
        ]
    }, data => {
        if (data == 0) rank(target);
        if (data == 1) search(target);
        if (data == 2) make(target);
        if (data == 3) Ginvlist(target);
    });
};
function Nmain2M(target:NetworkIdentifier) {
    let data = dataJs.filter((e:any) => e.Name == DataById(target)[0])[0];
    let guild = guildJs.filter((e:any) => e.guildID == data.guildID)[0];
    let Id = String(data.guildID);
    Formsend(target, {
        type: "form",
        title: `길드`,
        content: `§l§a${guild.Name} §6${guild.level}Lv §7( ${guild.xp} / ${guild.xpM} )\n§r§8${guild.subtitle}\n§r내 직위 : ${data.perm}`,
        buttons: [
            {
                "text": "길드 랭킹"
            },
            {
                "text": "길드원 목록"
            },
            {
                "text": "길드 탈퇴"
            }
        ]
    }, data => {
        if (data == 0) rank(target);
        if (data == 1) memberlist(target, Id);
        if (data == 2) Gout(target, Id);
    });
};
function Nmain2S(target:NetworkIdentifier) {
    let data = dataJs.filter((e:any) => e.Name == DataById(target)[0])[0];
    let guild = guildJs.filter((e:any) => e.guildID == data.guildID)[0];
    let Id = String(data.guildID);
    Formsend(target, {
        type: "form",
        title: `길드`,
        content: `§l§a${guild.Name} §6${guild.level}Lv §7( ${guild.xp} / ${guild.xpM} )\n§r§8${guild.subtitle}\n§r내 직위 : ${data.perm}`,
        buttons: [
            {
                "text": "길드 랭킹"
            },
            {
                "text": "길드원 목록"
            },
            {
                "text": "길드원 추방"
            },
            {
                "text": "길드원 초대"
            },
            {
                "text": "길드 탈퇴"
            }
        ]
    }, data => {
        if (data == 0) rank(target);
        if (data == 1) memberlist(target, Id);
        if (data == 2) Gkick(target, Id);
        if (data == 3) Gout(target, Id);
    });
};
function Nmain2L(target:NetworkIdentifier) {
    let data = dataJs.filter((e:any) => e.Name == DataById(target)[0])[0];
    let guild = guildJs.filter((e:any) => e.guildID == data.guildID)[0];
    let Id = String(data.guildID);
    Formsend(target, {
        type: "form",
        title: `길드`,
        content: `§l§a${guild.Name} §6${guild.level}Lv §7( ${guild.xp} / ${guild.xpM} )\n§r§8${guild.subtitle}\n§r내 직위 : ${data.perm}`,
        buttons: [
            {
                "text": "길드 랭킹"
            },
            {
                "text": "길드원 목록"
            },
            {
                "text": "길드 관리"
            },
            {
                "text": "길드 탈퇴"
            }
        ]
    }, data => {
        if (data == 0) rank(target);
        if (data == 1) memberlist(target, Id);
        if (data == 2) leaderCmd(target, Id);
        if (data == 3) sendText(target, '§c§l길드장의 직책으론 탈퇴할 수 없습니다!\n길드장을 넘기거나 길드를 해산하세요!', 0);
        if (data == 3) system.executeCommand(`execute "${DataById(target)[0]}" ~ ~ ~ playsound mob.bat.death @s ~ ~ ~ 1 0.5`, () => {});
    });
};

function leaderCmd(target:NetworkIdentifier, Id:any) {
    Formsend(target, {
        type: "form",
        title: "길드 관리",
        content: "",
        buttons: [
            {
                "text": "길드설명 변경"
            },
            {
                "text": "공개 설정"
            },
            {
                "text": "길드원 추방"
            },
            {
                "text": "길드원 초대"
            },
            {
                "text": "하위리더 임명"
            },
            {
                "text": "길드장 넘기기"
            },
            {
                "text": "길드 해산"
            }
        ]
    }, data => {
        if (data == 0) Gsubtitle(target, Id);
        if (data == 1) Gosttt(target, Id);
        if (data == 2) Gkick(target, Id);
        if (data == 3) Ginvite(target, Id);
        if (data == 4) Gsub(target, Id);
        if (data == 5) Glead(target, Id);
        if (data == 6) GuildBreak(target, Id);
    })
}

function rank(target:NetworkIdentifier) {
    let array:any[] = [];
    var sortingField1 = "xp";
    var sortingField2 = "level";
    let rankJs = guildJs.sort((a, b) => b[sortingField1] - a[sortingField1]).sort((a, b) => b[sortingField2] - a[sortingField2]);
    let data:any = {
        Name: ''
    };
    rankJs.forEach(function(element:any, index:any, arr:any){
        let numc = 'th'
        data = dataJs.filter((e:any) => e.xuid == element.guildID)[0];
        if (String(index + 1)[String(index + 1).length - 1] == '1') numc = 'st';
        if (String(index + 1)[String(index + 1).length - 1] == '2') numc = 'nd';
        if (String(index + 1)[String(index + 1).length - 1] == '3') numc = 'rd';
        let s = `§l\n${index + 1}${numc}. §6${element.Name} §7- ${data.Name}\n§8${element.o} | ${element.level}레벨 ( ${element.xp} / ${element.xpM} )\n\n§f---------------------------------`;
        array.push(s);
    });
    Formsend(target, {
        type: "form",
        title: "길드 랭킹",
        content: String(array).replace(/,/gi, '\n'),
        buttons: []
    }, () => {
        Nready(target);
    })
}

function GuildBreak(target:NetworkIdentifier, Id:any) {
    Formsend(target, {
        type: "custom_form",
        title: "길드 해산",
        content: [
            {
                "type": "label",
                "text": "정말로 길드를 해산하시겠습니까?"
            },
            {
                "type": "input",
                "text": "해산하려면 확인을 입력해주세요",
                "placeholder": "확인"
            }
        ]
    }, data => {
        if (data == null) return;
        let [, input] = data;
        if (input == '확인') {
            let djs = dataJs;
            let gjs = guildJs;
            sendText(target, '§c§l길드가 해산되었습니다!', 0);
            system.executeCommand(`execute "${DataById(target)[0]}" ~ ~ ~ playsound random.anvil_use @s`, () => {});
            let members = dataJs.filter((e:any) => e.guildID == Id);
            let guild = guildJs.filter((e:any) => e.guildID == Id)[0];
            members.forEach(function(element:any, index:any, array:any){
                let state = djs.indexOf(element);
                element.Name = `$${element.Name}`
                element.guildID = '';
                element.perm = 'break';
                djs.splice(state,1, element);
            });
            let state = gjs.indexOf(guild);
            gjs.splice(state, 1);
        }
        if (input != '확인') sendText(target, '§c§l길드 해산이 취소되었습니다!', 0);
        if (input != '확인') system.executeCommand(`execute "${DataById(target)[0]}" ~ ~ ~ playsound mob.bat.death @s ~ ~ ~ 1 0.5`, () => {});
    })
}

function Glead(target:NetworkIdentifier, Id:any) {
    let member1 = dataJs.filter((e:any) => e.guildID == Id);
    let member2 = member1.filter((e:any) => e.perm == 'subleader');
    let memberA = member2.map((e:any, i:any) => e.Name);
    let Arr = ['길드원을 선택하세요'];
    memberA.forEach(function(ele:string){
        if (playerList.includes(ele)) Arr.push(ele);
    });
    Formsend(target, {
        type: "custom_form",
        title: "길드장 넘기기",
        content: [
            {
                "type": "dropdown",
                "text": "길드장을 넘겨줄 하위리더를 선택하세요(온라인인 길드원만 가능합니다)",
                "options": Arr
            }
        ]
    }, data => {
        if (data == null) return;
        let input = data;
        if (input == 0) return;
        let playerName = DataById(target)[0];
        let guild = guildJs.filter((e:any) => e.guildID == Id)[0];
        let state1 = dataJs.indexOf(guild);
        let targetj = member2.filter((e:any) => e.Name == Arr[input])[0];
        let targets = dataJs.filter((e:any) => e.Name == playerName)[0];
        let state = dataJs.indexOf(targetj);
        let state2 = dataJs.indexOf(targets);
        targetj.perm = 'leader';
        targets.perm = 'subleader';
        let newId = XuidByName(targetj.Name);
        guild.guildID = newId
        guildJs.splice(state1,1, guild);
        dataJs.splice(state,1, targetj);
        dataJs.splice(state2,1, targets);
        member1.map((e:any, i:any) => e.Name).forEach((v)=>{
            system.executeCommand(`tellraw "${v}" {"rawtext":[{"text":"§a§l${targetj.Name}님이 길드장으로 임명되었습니다"}]}`, ()=>{});
            system.executeCommand(`tellraw "${v}" {"rawtext":[{"text":"§c§l${targets.Name}님이 하위리더로 강등되었습니다"}]}`, ()=>{});
        });
        member1.forEach((v)=>{
            let state = dataJs.indexOf(v);
            v.guildID = newId;
            dataJs.splice(state,1, v);
        })
        system.executeCommand(`execute "${DataById(target)[0]}" ~ ~ ~ playsound random.anvil_use @s`, () => {});
    });
};

function Gsub(target:NetworkIdentifier, Id:any) {
    let member1 = dataJs.filter((e:any) => e.guildID == Id);
    let member2 = member1.filter((e:any) => e.perm == 'member');
    let memberA = member2.map((e:any, i:any) => e.Name);
    let Arr = ['길드원을 선택하세요'];
    memberA.forEach(function(ele:string){
        Arr.push(ele);
    });
    Formsend(target, {
        type: "custom_form",
        title: "하위리더 임명",
        content: [
            {
                "type": "dropdown",
                "text": "하위 리더로 임명하려는 길드원을 선택하세요",
                "options": Arr
            }
        ]
    }, data => {
        if (data == null) return;
        let input = data;
        if (input == 0) return;
        let targetj = member2.filter((e:any) => e.Name == Arr[input])[0];
        let state = dataJs.indexOf(targetj);
        targetj.perm = 'subleader';
        dataJs.splice(state,1, targetj);
        member1.map((e:any, i:any) => e.Name).forEach((v)=>{
            system.executeCommand(`tellraw "${v}" {"rawtext":[{"text":"§a§l${targetj.Name}님이 하위리더로 임명되었습니다"}]}`, ()=>{});
        });
        system.executeCommand(`execute "${DataById(target)[0]}" ~ ~ ~ playsound random.anvil_use @s`, () => {});
    });
};

function Gkick(target:NetworkIdentifier, Id:any) {
    let member1 = dataJs.filter((e:any) => e.guildID == Id);
    let member2 = member1.filter((e:any) => e.perm == 'member');
    let memberA = member2.map((e:any, i:any) => e.Name);
    let Arr = ['길드원을 선택하세요'];
    memberA.forEach(function(ele:string){
        Arr.push(ele);
    });
    Formsend(target, {
        type: "custom_form",
        title: "길드원 추방",
        content: [
            {
                "type": "dropdown",
                "text": "추방하려는 길드원을 선택하세요",
                "options": Arr
            }
        ]
    }, data => {
        if (data == null) return;
        let input = data;
        if (input == 0) return;
        let targetj = member2.filter((e:any) => e.Name == Arr[input])[0];
        let state = dataJs.indexOf(targetj);
        targetj.Name = `$${targetj.Name}`;
        targetj.guildID = ''
        targetj.perm = 'kicked';
        dataJs.splice(state,1, targetj);
        sendText(target, `§a§l${targetj.Name}님을 추방했습니다`, 0);
        system.executeCommand(`execute "${DataById(target)[0]}" ~ ~ ~ playsound random.anvil_use @s`, () => {});
    });
};

function Ginvite(target:NetworkIdentifier, Id:any) {
    let guild = guildJs.filter((e:any, i:any) => e.guildID == Id)[0];
    let memberA = dataJs.map((e:any, i:any) => e.Name);
    let Arr = ['플레이어를 선택하세요'];
    playerList.forEach(function(ele:string){
        Arr.push(ele);
    });
    memberA.forEach(function(ele:string){
        Arr.splice(Arr.indexOf(ele), 1);
    });
    Formsend(target, {
        type: "custom_form",
        title: "길드원 초대",
        content: [
            {
                "type": "dropdown",
                "text": "초대하려는 플레이어를 선택하세요",
                "options": Arr
            }
        ]
    }, data => {
        if (data == null) return;
        let playerName = DataById(target)[0];
        let input = data[0];
        let member = dataJs.filter((e:any) => e.guildID == Id);
        if (input == 0) return;
        if (member.length >= guild.PMC) {
            sendText(target, `§c§l길드의 인원수가 가득찼습니다`, 0);
            return;
        }
        let js1 = {
            Name: Arr[data],
            Gname: guild.Name,
            Id: Id,
            inviter: playerName
        }
        inviteJs.push(js1);
        system.executeCommand(`tellraw "${Arr[data]}" {"rawtext":[{"text":"§a§l----------\n\n§f${playerName}님이 ${guild.Name}길드에 초대하였습니다\n수락하려면 /guild invite명령어를 사용하세요\n\n§a§l----------"}]}`, ()=>{});
        sendText(target, `§a§l${Arr[data]}님께 초대장을 보냈습니다`, 0);
    });
};
function Ginvlist(target:NetworkIdentifier) {
    try {let [playerName,,, playerXuid] = DataById(target);
    let inv = inviteJs.filter((e) => e.Name == playerName).reverse();
    let Arr:any[] = [];
    inv.forEach((value) => {
        let js = {
            text: `${value.Gname}`,
            value: value
        }
        Arr.push(js);
    });
    Formsend(target, {
        type: "form",
        title: "초대장",
        content: "받은 길드 초대장이 모두 표시됩니다",
        buttons: Arr
    }, data => {
        let selects = Arr[data];
        let select = guildJs.filter((e:any) => e.guildID == selects.value.Id)[0];
        let dt = dataJs.filter((e:any) => e.xuid == selects.value.Id)[0];
        let member = dataJs.filter((e:any) => e.guildID == selects.value.Id);
        Formsend(target, {
            type: 'form',
            title: '길드 정보',
            content: `길드명: ${select.Name}\n길드 레벨: ${select.level} ( ${select.xp} / ${select.xpM} )\n인원수: ${member.length} / ${select.PMC}\n길드장: ${dt.Name}`,
            buttons: [
                {"text": "수락"},
                {"text": "거절"}
            ]
        }, data => {
            if (data == null) Ginvlist(target);
            let [playerName, , ,playerXuid] = DataById(target);
            if (data == 1) {
                inviteJs.splice(inviteJs.indexOf(selects.value), 1);
                sendText(target, `§a§l초대를 거절하였습니다`, 0);
                system.executeCommand(`tellraw "${selects.value.inviter}" {"rawtext":[{"text":"§c§l${playerName}님이 길드 초대를 거절하셨습니다"}]}`, ()=>{});
            }
            if (data == null || data == 1) return;
            if (data == 0) {
                if (member.length >= select.PMC) {
                    sendText(target, `§a§l해당 길드의 인원수가 가득찼습니다`, 0);
                    return;
                }
                let js1 = {
                    Name: playerName,
                    xuid: playerXuid,
                    guildID: select.guildID,
                    perm: 'member'
                }
                dataJs.push(js1);
                sendText(target, `§a§l${select.Name} 길드에 가입했습니다`, 0);
                system.executeCommand(`tellraw "${selects.value.inviter}" {"rawtext":[{"text":"§a§l${playerName}님이 길드 초대를 수락하셨습니다"}]}`, ()=>{});
                system.executeCommand(`execute "${playerName}" ~ ~ ~ playsound random.anvil_use @s`, ()=>{})
            }
        })
    })} catch(err) {}
};

function Gout(target:NetworkIdentifier, Id:any) {
    let playerName = DataById(target)[0];
    Formsend(target, {
        type: "custom_form",
        title: "길드 탈퇴",
        content: [
            {
                "type": "label",
                "text": "정말로 길드를 탈퇴하시겠습니까?"
            }
        ]
    }, data => {
        let targetj = dataJs.filter((e:any) => e.Name == playerName)[0];
        let state = dataJs.indexOf(targetj);
        dataJs.splice(state,1);
        sendText(target, `§a§l길드를 성공적으로 탈퇴하였습니다`, 0);
    });
};

function Gsubtitle(target:NetworkIdentifier, Id:any) {
    let playerName = DataById(target)[0];
    Formsend(target, {
        type: "custom_form",
        title: "길드설명 변경",
        content: [
            {
                "type": "input",
                "text": "길드 설명 바꾸기",
                "placeholder": "문구를 입력해주세요"
            }
        ]
    }, data => {
        let guild = guildJs.filter((e:any) => e.guildID == Id)[0];
        guild.subtitle = data[0];
        let state = guildJs.indexOf(guild);
        guildJs.splice(state,1, guild);
        sendText(target, `§a§l성공적으로 설명을 변경하였습니다`, 0);
    });
};

function Gosttt(target:NetworkIdentifier, Id:any) {
    let drop = ['공개','비공개'];
    Formsend(target, {
        type: "custom_form",
        title: "길드설명 변경",
        content: [
            {
                "type": "dropdown",
                "text": "길드 설명 바꾸기",
                "options": drop
            }
        ]
    }, data => {
        let osttt = drop[data];
        let guild = guildJs.filter((e:any) => e.guildID == Id)[0];
        guild.o = osttt;
        let state = guildJs.indexOf(guild);
        guildJs.splice(state,1, guild);
        sendText(target, `§a§l성공적으로 공개 여부를 변경하였습니다`, 0);
    });
};

function memberlist(target:NetworkIdentifier, Id:any) {
    let guild = guildJs.filter((e:any) => e.guildID == Id)[0];
    let members = dataJs.filter((e:any) => e.guildID == Id);
    let leader = members.filter((e:any) => e.perm == 'leader').map((e:any, i:any) => e.Name);
    let subleader = members.filter((e:any) => e.perm == 'subleader').map((e:any, i:any) => e.Name);
    let member = members.filter((e:any) => e.perm == 'member').map((e:any, i:any) => e.Name);
    Formsend(target, {
        type: "custom_form",
        title: "길드원 목록",
        content: [
            {
                "type": "label",
                "text": `\n§6§l----길드장----\n§f${String(leader)}\n\n§6§l----하위 리더----\n§f${String(subleader)}\n\n§6§l----맴버----\n§f${String(member)}`
            }
        ]
    }, ()=> {
        Nready(target);
    })
}

function search(target:NetworkIdentifier) {
    let array:any[] = [];
    var sortingField1 = "xp";
    var sortingField2 = "level";
    let rankJs = guildJs.sort((a, b) => b[sortingField1] - a[sortingField1]).sort((a, b) => b[sortingField2] - a[sortingField2]);
    let data:any = {
        Name: ''
    };
    rankJs.forEach(function(element:any, index:any, arr:any){
        let numc = 'th'
        data = dataJs.filter((e:any) => e.xuid == element.guildID)[0];
        let member = dataJs.filter((e:any) => e.guildID == element.guildID);
        if (String(index + 1)[String(index + 1).length - 1] == '1') numc = 'st';
        if (String(index + 1)[String(index + 1).length - 1] == '2') numc = 'nd';
        if (String(index + 1)[String(index + 1).length - 1] == '3') numc = 'rd';
        let s = `§l§6${element.Name} §8(${member.length}/${element.PMC}) - ${data.Name} ㅣ`
        array.push(s);
    });
    Formsend(target, {
        type: "custom_form",
        title: "길드 찾기",
        content: [
            {
                "type": "input",
                "text": `검색어`,
                "placeholder": "길드 이름을 적어주세요"
            },
            {
                "type": "dropdown",
                "text": '길드 목록',
                "options": array
            }
        ]
    }, data => {
        if (data == null) Nready(target);
        if (data == null) return;
        let [input,] = data;
        if (input == '') search(target);
        if (input != '') searchRs(target, input);
        
    });
}
function searchRs(target:NetworkIdentifier, input: string) {
    let array:any[] = [];
    let content = '';
    let searchJs:any[] = guildJs.filter((e:any) => new RegExp(input).test(e.Name));
    var sortingField1 = "xp";
    var sortingField2 = "level";
    let rankJs = searchJs.sort((a, b) => b[sortingField1] - a[sortingField1]).sort((a, b) => b[sortingField2] - a[sortingField2]);
    let data:any = {
        Name: ''
    };
    rankJs.forEach(function(element:any, index:any, arr:any){
        let member = dataJs.filter((e:any) => e.guildID == element.guildID);
        let numc = 'th'
        data = dataJs.filter((e:any) => e.xuid == element.guildID)[0];
        if (String(index + 1)[String(index + 1).length - 1] == '1') numc = 'st';
        if (String(index + 1)[String(index + 1).length - 1] == '2') numc = 'nd';
        if (String(index + 1)[String(index + 1).length - 1] == '3') numc = 'rd';
        let s = {
            "text": `${index + 1}${numc}. §6${element.Name} §7( ${member.length} / ${element.PMC} ) - ${data.Name}\n§8${element.level}레벨 ( ${element.xp} / ${element.xpM} )`,
            "gName": element.Name,
            "owner": data.Name
        }
        array.push(s);
    });
    if (array.length <= 0) content = '\n검색 결과가 없습니다'
    Formsend(target, {
        type: "form",
        title: `검색어: §9${input}`,
        content: content,
        buttons: array
    }, data => {
        if (data == null) search(target);
        if (data == null) return;
        let selectdata = array[data];
        let select = guildJs.filter((e:any) => e.Name == selectdata.gName)[0];
        let button: any[] = [];
        if (select.o == '공개') button = [
            {
                "text": "가입하기"
            },
            {
                "text": "돌아가기"
            }
        ]
        if (select.o == '비공개') button = [
            {
                "text": "가입 불가"
            },
            {
                "text": "돌아가기"
            }
        ]
        data = dataJs.filter((e:any) => e.xuid == select.guildID)[0];
        let member = dataJs.filter((e:any) => e.guildID == select.guildID);
        Formsend(target, {
            type: 'form',
            title: '길드 정보',
            content: `길드명: ${select.Name}\n길드 레벨: ${select.level} ( ${select.xp} / ${select.xpM} )\n인원수: ${member.length} / ${select.PMC}\n길드장: ${data.Name}`,
            buttons: button
        }, data => {
            if (data == null || data == 1) searchRs(target, input);
            if (data == null || data == 1) return;
            let playerName = NameById(target);
            let playerXuid = DataById(target)[3];
            if (select.o == '공개' && data == 0) {
                if (member.length >= select.PMC) {
                    sendText(target, `§a§l해당 길드의 인원수가 가득찼습니다`, 0);
                    return;
                }
                let js1 = {
                    Name: playerName,
                    xuid: playerXuid,
                    guildID: select.guildID,
                    perm: 'member'
                }
                dataJs.push(js1);
                sendText(target, `§a§l${select.Name} 길드에 가입했습니다`, 0);
            }
            if (select.o == '비공개' && data == 0) {
                sendText(target, '§c§l이 길드에는 초대없인 가입할 수 없습니다', 0);
                system.executeCommand(`execute "${NameById(target)}" ~ ~ ~ playsound mob.bat.death @s ~ ~ ~ 1 0.5`, () => {});
                searchRs(target, input);
                return;
            }
        })
    });
}

function regExp(str:string){  
    let reg = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/gi
    if(reg.test(str)){
      return str.replace(reg, "");    
    } else {
      return str;
    }  
}

function make(target: NetworkIdentifier) {
    let drop = ['공개','비공개'];
    Formsend(target, {
        type: "custom_form",
        title: "길드 만들기",
        content: [
            {
                "type": "label",
                "text": "나만의 길드를 만들어보세요!"
            },
            {
                "type": "input",
                "text": "길드 이름을 적어주세요",
                "placeholder": "특수 문자는 사용할 수 없습니다! ex) .!@§"
            },
            {
                "type": "input",
                "text": "길드 설명을 적어주세요",
                "placeholder": "특수 문자는 사용할 수 없습니다! ex) .!@§"
            },
            {
                "type": "dropdown",
                "text": "공개 범위",
                "options": drop
            }

        ]
    }, data => {
        if (data == null) return;
        let [,input, sub, dropz] = data;
        let dropd = drop[dropz];
        let Gname = regExp(String(input).replace(/§/gi, ''));
        let subtitle = regExp(String(sub).replace(/§/gi, ''));
        Formsend(target, {
            type: "form",
            title: "",
            content: `${Gname}으로 길드를 만드시겠습니까?`,
            buttons: [{"text":"만들기"}]
        }, data => {
            if (data == null) return;
            if (data == 0) {
                let [playerName, actor, entity, playerXuid] = DataById(target);
                let objL = guildJs.map((e:any, i:any) => e.Name);
                if (objL.includes(Gname)) {
                    sendText(target, '§c§l이미 존재하는 길드입니다!', 0);
                    return;
                }
                if (objL.includes(Gname) == false) {
                    if (guildJs[0].Name == '-') {
                        guildJs.splice(0, 1);
                    }
                    let js = {
                        Name: Gname,
                        guildID: String(playerXuid),
                        subtitle: subtitle,
                        level: 1,
                        xp: 0,
                        xpM: 2000,
                        PMC: 10,
                        o: dropd
                    }
                    guildJs.push(js);
                    let js1 = {
                        Name: playerName,
                        xuid: String(playerXuid),
                        guildID: String(playerXuid),
                        perm: 'leader'
                    }
                    if (dataJs[0].Name == '-') {
                        dataJs.splice(0, 1);
                    }
                    dataJs.push(js1);
                    sendText(target, `§a§l${Gname} 길드를 만들었습니다!`, 0);
                    system.executeCommand(`execute "${playerName}" ~ ~ ~ playsound random.anvil_use @s`, () => {});
                }
            }
        })
    });
};

system.listenForEvent("minecraft:entity_death", eventData => {
    // @ts-ignore
    if (eventData.data.cause == 'entity_attack') {
        // @ts-ignore
        if(eventData.data.killer.__identifier__ == 'minecraft:player') {
            // @ts-ignore
            let killerName = system.getComponent(eventData.data.killer, MinecraftComponent.Nameable)!.data.name;
            let entityHealth = system.getComponent(eventData.data.entity, MinecraftComponent.Health)!.data.max;
            let djs = dataJs.map((e:any, i:any) => e.Name);
            if (djs.includes(killerName) == true) {
                let data = dataJs.filter((e:any) => e.Name == killerName)[0];
                let guild = guildJs.filter((e:any) => e.guildID == data.guildID)[0];
                addXp(Math.round(entityHealth * 0.8), data.guildID, guild);
            }
        }
    }
});

function addXp(xp:number, id:any, IdJs:any){
    let memberJs = dataJs.filter((e:any) => e.guildID == id);
    let before = IdJs;
    let [lastLv, lastXp, lastXpM] = [IdJs.level, IdJs.xp, IdJs.xpM];
    IdJs.xp += xp;
    if (IdJs.xp >= IdJs.xpM) {
        IdJs.xp -= IdJs.xpM;
        IdJs.xpM += Math.round(IdJs.xpM * (33 / 100));
        IdJs.level += 1;
        IdJs.PMC += 2;
        let members:any[] = memberJs.map((e:any, i:any) => e.Name);
        members.forEach(function(element, index, array){
            system.executeCommand(`tellraw "${element}" {"rawtext":[{"text":"§a§l--------------------\n\n     §6↑ 길드 레벨업 ↑\n§b+1레벨 +2인원수 +33%필요 경험치 접속중인 길드원 전체 3000원 획득\n\n§a--------------------"}]}`, () => {});
            system.executeCommand(`execute "${element}" ~ ~ ~ playsound random.anvil_use @s ~ ~ ~ 0.6`, () => {});
            system.executeCommand(`execute "${element}" ~ ~ ~ scoreboard players add @s money 3000`, () => {});
            setTimeout(function(){
                system.executeCommand(`execute "${element}" ~ ~ ~ playsound block.grindstone.use @s`, () => {});
            }, 400);
        });
    }
    guildJs.splice(guildJs.indexOf(before), 1, IdJs);
}


let backup = setInterval(function(){
    writeFileSync(localfilePlayer, JSON.stringify(dataJs), 'utf8');
    writeFileSync(localfile, JSON.stringify(guildJs), 'utf8');
    console.log('guildData AutoSaved!');
}, 60000);

bedrockServer.close.on(()=> {
    clearTimeout(backup);
    writeFileSync(localfilePlayer, JSON.stringify(dataJs), 'utf8');
    writeFileSync(localfile, JSON.stringify(guildJs), 'utf8');
    console.log('guildData saved!');
});

import { green } from 'colors';
console.log(green('guild.ts loaded'));
export {};