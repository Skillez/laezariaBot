const { bot, removeUserLastMessage, errorLog } = require('../laezariaBot');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                            HANDLER TO LOOK FOR CHAT COMMANDS                             //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (!message.content.startsWith(config.botPrefix)) return;

    // CHECK IF BOT HAS ENOUGH PERMISSIONS TO USE COMMANDS.
    if (!message.channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'ADD_REACTIONS', 'ATTACH_FILES'])) {  // check if bot has SEND MESSAGES / EMBED LINKS / MANAGE_MESSAGES / ADD_REACTIONS before sending an output
        return message.channel.send(`Missing one or more permissions!\n⭕ SEND_MESSAGES\n⭕ ATTACH_FILES\n⭕ EMBED_LINKS\n⭕ MANAGE_MESSAGES\n⭕ ADD_REACTIONS`).catch(() => { })
            .then(msg => {
                if (msg && msg.deletable) msg.delete({ timeout: 7000 }).catch(() => { });
                if (message && message.deletable) message.delete().catch(() => { });
            });
    }

    const args = message.content.slice(config.botPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let cmdFile = bot.commands.get(command);
    if (cmdFile) {
        removeUserLastMessage(message.author);

        switch (cmdFile.help.type) {
            case "owner": {
                if (message.author.id === config.botOwnerID) return cmdFile.run(bot, message, args);
                else return message.reply(`You have insufficient permissions!‏‏‎\nOnly the **bot owner** can use **${config.botPrefix}${cmdFile.help.name}** command!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            case "manager": {
                if (message.member.roles.cache.some(role => role.id === config.roles.managerRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.viceRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.senpaiRoleID)) return cmdFile.run(bot, message, args);
                else return message.reply(`You have insufficient permissions!‏‏‎\nOnly the **manager+** can use **${config.botPrefix}${cmdFile.help.name}** command!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            case "enforcer": {
                if (message.member.roles.cache.some(role => role.id === config.roles.enforcerRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.managerRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.viceRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.senpaiRoleID)) return cmdFile.run(bot, message, args);
                else return message.reply(`You have insufficient permissions!‏‏‎\nOnly the **enforcer+** can use **${config.botPrefix}${cmdFile.help.name}** command!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            case "captain": {
                if (message.member.roles.cache.some(role => role.id === config.roles.captainRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.enforcerRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.managerRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.viceRoleID)
                    || message.member.roles.cache.some(role => role.id === config.roles.senpaiRoleID)) return cmdFile.run(bot, message, args);
                else return message.reply(`You have insufficient permissions!‏‏‎\nOnly the **captain+** can use **${config.botPrefix}${cmdFile.help.name}** command!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            case "public": return cmdFile.run(bot, message, args);
            case "disabled": return message.reply(`**${config.botPrefix}${cmdFile.help.name}** command is currently **disabled**!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            default: return errorLog(`command-listener.js:1 command switch() default - no type was found for the ${cmdFile.help.name} command.`);
        }
    }
});