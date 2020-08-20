const { bot, removeUserLastMessage, errorLog } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                            HANDLER TO LOOK FOR CHAT COMMANDS                             //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (!message.content.startsWith(config.BotPrefix)) return;

    // CHECK IF BOT HAS ENOUGH PERMISSIONS TO USE COMMANDS.
    if (!message.channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'ADD_REACTIONS'])) {

        return message.channel.send(`Missing one or more permissions!\n⭕ SEND_MESSAGES\n⭕ EMBED_LINKS\n⭕ MANAGE_MESSAGES\n⭕ ADD_REACTIONS`).catch(() => { return; })
            .then(message => message.delete({ timeout: 7000 })).catch(() => { return; }); // check if bot has SEND MESSAGES / EMBED LINKS / MANAGE_MESSAGES / ADD_REACTIONS before sending an output
    }

    const args = message.content.slice(config.BotPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let cmdFile = bot.commands.get(command);
    if (cmdFile) {
        removeUserLastMessage(message.author);

        switch (cmdFile.help.type) {
            case "owner": {
                if (message.author.id === config.BotOwnerID) return cmdFile.run(bot, message, args);
                else return message.reply(`You have insufficient permissions!‏‏‎\nOnly the **bot owner** can use **${config.BotPrefix}${cmdFile.help.name}** command!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            case "manager": {
                if (message.member.roles.cache.some(role => role.id === config.ManagerRoleID)
                    || message.member.roles.cache.some(role => role.id === config.ViceRoleID)
                    || message.member.roles.cache.some(role => role.id === config.SenpaiRoleID)) return cmdFile.run(bot, message, args);
                else return message.reply(`You have insufficient permissions!‏‏‎\nOnly the **manager** can use **${config.BotPrefix}${cmdFile.help.name}** command!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            case "captain": {
                if (message.member.roles.cache.some(role => role.id === config.CaptainRoleID)
                    || message.member.roles.cache.some(role => role.id === config.ManagerRoleID)
                    || message.member.roles.cache.some(role => role.id === config.ViceRoleID)
                    || message.member.roles.cache.some(role => role.id === config.SenpaiRoleID)) return cmdFile.run(bot, message, args);
                else return message.reply(`You have insufficient permissions!‏‏‎\nOnly the **captain** can use **${config.BotPrefix}${cmdFile.help.name}** command!`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            case "public": return cmdFile.run(bot, message, args);
            case "disabled": return message.reply(`**${config.BotPrefix}${cmdFile.help.name}** command is currently **disabled**!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            default: return errorLog(`command-listener.js:1 command switch() default - no type was found for the ${cmdFile.help.name} command.`);
        }
    }
});