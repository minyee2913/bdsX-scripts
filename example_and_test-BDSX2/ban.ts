import { ipfilter, command, netevent, MinecraftPacketIds } from 'bdsx';
import { open, readFileSync, writeFileSync } from 'fs';
import { IdByName, Disconnect, NameById } from './2913Module';
const system = server.registerSystem(0,0);
ipfilter.setTrafficLimit(1000000);
ipfilter.setTrafficLimitPeriod(10*60);
///////////////////////////////////////////////////////////////////////

let config = 
{
    LocalData: 'data/ban.json',
    Ban_command: '/ban',
    IpBan_command: '/ipban',
    UnBan_command: '/unban',
    Ban_msg: '§cYou are BANNED',
    IpBan_msg: '§cYou are Ip BANNED',
    UnBan_msg: '§a${target} is UNBANNED',
    announce: '§e${target} was BANNED By ${origin}'
}

//////////////////////////////////////////////////////////////////////

open(config.LocalData,'a+',function(err,fd){
if(err) throw err;
try {
    JSON.parse(readFileSync(config.LocalData, "utf8"));
} catch (err) {
    writeFileSync(config.LocalData, '{ "IpBan": [{"ip": "","name":""}], "NameBan": [] }', "utf8");
}
});
command.hook.on((command, originName) => {
    if (command.startsWith(`${config.Ban_command} `)) {
        let targetName = command.replace(`${config.Ban_command} `, '')
        let target = IdByName(targetName);
        let [ip, port] = target.getAddress().split('|');
        console.log(`${originName} banned ${targetName}\nip : ${ip} port : ${port}`);
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"${config.announce.replace('${target}', `${targetName}`).replace('${origin}', `${originName}`)}"}]}`, () => {});
        const BanJS = JSON.parse(readFileSync(config.LocalData, "utf8"));
        BanJS.NameBan.push(targetName);
        writeFileSync(config.LocalData, JSON.stringify(BanJS), "utf8");
        Disconnect(target, config.Ban_msg);
        return 0;
    }
    if (command.startsWith(`${config.IpBan_command} `)) {
        let targetName = command.replace(`${config.IpBan_command} `, '')
        let target = IdByName(targetName);
        let [ip, port] = target.getAddress().split('|');
        console.log(`${originName} Ip banned ${targetName}\nip : ${ip} port : ${port}`);
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"${config.announce.replace('${target}', `${targetName}`).replace('${origin}', `${originName}`)}"}]}`, () => {});
        const BanJS = JSON.parse(readFileSync(config.LocalData, "utf8"));
        let js = {
            ip: ip,
            name: targetName
        }
        BanJS.IpBan.push(js);
        writeFileSync(config.LocalData, JSON.stringify(BanJS), "utf8");
        Disconnect(target, config.IpBan_msg);
        return 0;
    }
    if (command.startsWith(`${config.UnBan_command} `)) {
        let targetName = command.replace(`${config.UnBan_command} `, '')
        let target = IdByName(targetName);
        console.log(`${originName} Unbanned ${targetName}`);
        system.executeCommand(`tellraw @p[name="${originName}"] {"rawtext":[{"text":"${config.UnBan_msg.replace('${target}', `${targetName}`).replace('${origin}', `${originName}`)}"}]}`, () => {});
        const BanJS = JSON.parse(readFileSync(config.LocalData, "utf8"));
        let Nstate = BanJS.NameBan.indexOf(targetName);
        BanJS.NameBan.splice(Nstate, 1);
        let Ijs = BanJS.IpBan.map((e:any, i:any) => e.name);
        let Istate = Ijs.indexOf(targetName);
        BanJS.IpBan.splice(Istate, 1);
        writeFileSync(config.LocalData, JSON.stringify(BanJS), "utf8");
        return 0;
    }
});

netevent.after(MinecraftPacketIds.Login).on((ptr, networkidentifier, packetId) => {
    let target = networkidentifier.getAddress();
    let targetName = NameById(networkidentifier);
    let [ip, port] = target.split('|');
    const BanJS = JSON.parse(readFileSync(config.LocalData, "utf8"));
    let Ijs = BanJS.IpBan.map((e:any, i:any) => e.ip);
    setTimeout(function(){
        if (BanJS.NameBan.includes(targetName)) Disconnect(networkidentifier, config.Ban_msg);
        if (Ijs.includes(ip)) Disconnect(networkidentifier, config.IpBan_msg);
    }, 3000)
})

import { green } from 'colors';
console.log(green('ban.js loaded'));
export {};
