module.exports.help = {
    name: "add",
    description: "Test command to emit a new member message.",
    type: "owner",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           add                                            //
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Random User (for testing)
    // const user = message.guild.members.cache.random();
    
    bot.emit("guildMemberAdd", message.member);

    return message.channel.send(`ℹ️ guildMemberAdd() - Test`)
        .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
}