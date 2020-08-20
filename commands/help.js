const { Discord, LaezariaIconURL, getCommands, getCommand, messageRemoverWithReact } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "help",
    description: "List all of commands.",
    type: "public",
    usage: `ℹ️ Format: **${config.BotPrefix}help commandName**\n\nℹ️ Examples:\n${config.BotPrefix}help\n${config.BotPrefix}help apply`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                     help commandName                                     //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args) {
        if (getCommand(args[0])) {
            return message.channel.send(`Help for the **${config.BotPrefix}${args[0]}** command:\nAccess Level: __${getCommand(args[0]).help.type.toUpperCase()}__\nDescription: ${getCommand(args[0]).help.description}\n\nUsage:\n${getCommand(args[0]).help.usage}`)
                .then(helpMessage => messageRemoverWithReact(helpMessage, message.author))
                .catch(() => { return });
        }
    }

    const ownerCommands = await getCommands().filter(command => command.help.type.includes('owner')).map(command => `**${command.help.name}**    ${command.help.description}`).join('\n');
    const managerCommands = await getCommands().filter(command => command.help.type.includes('manager')).map(command => `**${command.help.name}**    ${command.help.description}`).join('\n');
    const captainCommands = await getCommands().filter(command => command.help.type.includes('captain')).map(command => `**${command.help.name}**    ${command.help.description}`).join('\n');
    const publicCommands = await getCommands().filter(command => command.help.type.includes('public')).map(command => `**${command.help.name}**    ${command.help.description}`).join('\n');
    const disabledCommands = await getCommands().filter(command => command.help.type.includes('disabled')).map(command => `**${command.help.name}**    ${command.help.description}`).join('\n');

    if (!ownerCommands) managerCommands = 'There are no owner commands.';
    if (!managerCommands) managerCommands = 'There are no manager commands.';
    if (!captainCommands) managerCommands = 'There are no captain commands.';
    if (!publicCommands) publicCommands = 'There are no public commands.';

    // define the embed color by the role color
    const roleColor = message.guild.me.displayHexColor === "#000000" ? "#ffffff" : message.guild.me.displayHexColor;

    if (disabledCommands) {
        // define the embed: bot commands page (with disabled commands)
        const embed_botcommands = new Discord.MessageEmbed()
            .setColor(roleColor)
            .setAuthor(`${bot.user.username} Help - Bot prefix: ${config.BotPrefix}`, LaezariaIconURL)
            .setDescription(`Type **${config.BotPrefix}help commandName**\nto see description, usage and examples!`)
            .addFields(
                { name: '‏‏‎ ‎\n🚙 Owner commands:', value: ownerCommands, inline: false },
                { name: '‏‏‎ ‎\n🚗 Manager commands:', value: managerCommands, inline: false },
                { name: '‏‏‎ ‎\n🚕 Captains commands:', value: captainCommands, inline: false },
                { name: '‏‏‎ ‎\n📣 Public commands:', value: publicCommands, inline: false },
                { name: '‏‏‎ ‎\n❌ Disabled commands:', value: disabledCommands, inline: false },
            )
            .setFooter(`LOG:ID HelpJS_1`)
            .setThumbnail(LaezariaIconURL)
            .setTimestamp()
        return message.channel.send(embed_botcommands)
            .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
    } else {

        // define the embed: bot commands page (without disabled commands)
        const embed_botcommands = new Discord.MessageEmbed()
            .setColor(roleColor)
            .setAuthor(`${bot.user.username} Help - Bot prefix: ${config.BotPrefix}`, LaezariaIconURL)
            .setDescription(`Type **${config.BotPrefix}help commandName**\nto see description, usage and examples!`)
            .addFields(
                { name: '‏‏‎ ‎\n🚙 Owner commands:', value: ownerCommands, inline: false },
                { name: '‏‏‎ ‎\n🚗 Manager commands:', value: managerCommands, inline: false },
                { name: '‏‏‎ ‎\n🚕 Captains commands:', value: captainCommands, inline: false },
                { name: '‏‏‎ ‎\n📣 Public commands:‎', value: publicCommands, inline: false },
            )
            .setFooter(`LOG:ID HelpJS_2`)
            .setThumbnail(LaezariaIconURL)
            .setTimestamp()
        return message.channel.send(embed_botcommands)
            .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
    }
}