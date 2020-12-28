var { createPacket, netevent, sendPacket, PacketId, command } = require("bdsx");
var FormDataSaver = new Map;
var FormDataloader = new Map;
function send(networkIdentifier, form, handler = () => {}) {
  let modalFormRequestPacket = createPacket(PacketId.ModalFormRequest);
  let formId = Math.floor(Math.random() * 2147483647) + 1;
  modalFormRequestPacket.setUint32(formId, 0x28);
  modalFormRequestPacket.setCxxString(JSON.stringify(form), 0x30);
  sendPacket(networkIdentifier, modalFormRequestPacket);
  FormDataSaver.set(formId, handler);
  FormDataloader.set(networkIdentifier, formId);
  modalFormRequestPacket.dispose();
}
exports.send = send;
var nIt = new Map();
var nIt2 = new Map();
exports.nIt = nIt;
exports.nIt2 = nIt2;
netevent.after(PacketId.Login).on((ptr, networkIdentifier) => {
    const [xuid, username] = netevent.readLoginPacket(ptr);
    nIt.set(username, networkIdentifier);
    nIt2.set(networkIdentifier, username);
    console.log(`${username}> added Form Data`);
});
netevent.close.on(networkIdentifier => {
    const id = nIt2.get(networkIdentifier);
    nIt2.delete(networkIdentifier);
    nIt.delete(id);
    console.log(`${id}> deleted Form Data`);
});
var formlog = 'false';
command.hook.on((command, originName) => {
    if (originName == 'Server' && command.startsWith('/formlog ')) {
        var cmd = command.replace("/formlog ","");
        if (cmd == 'true') formlog = 'true';
        if (cmd == 'false') formlog = 'false';
        console.log(`FormLog: ${cmd}`);
        return 0;
    }
});
netevent.raw(PacketId.ModalFormResponse).on((ptr, size, networkIdentifier) => {
    let datas = {};
    ptr.move(1);
    datas.formId = ptr.readVarUint();
    datas.formData = ptr.readVarString();
    dataValue = FormDataloader.get(networkIdentifier);
    if (formlog == 'true') console.log(datas);
    if (datas.formId == dataValue) {
        var dataResult = FormDataSaver.get(dataValue);
        data = Number(datas.formData.replace("\n",""));
        FormDataSaver.delete(dataValue);
        FormDataloader.delete(networkIdentifier);
        dataResult(data);
    }
});