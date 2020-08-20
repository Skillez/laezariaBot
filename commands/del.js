module.exports.help = {
    name: "del",
    description: "Test command to emit member left message.",
    type: "owner",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           del                                            //
    //////////////////////////////////////////////////////////////////////////////////////////////

    bot.emit("guildMemberRemove", message.member)

    return message.channel.send(`ℹ️ guildMemberRemove() - Test`)
        .then(message => { message.delete({ timeout: 5000 }).catch(() => { return }) });
}