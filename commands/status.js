const { Discord, embedColors, errorLog, messageRemoverWithReact } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "status",
    description: "Shows some information about the user.",
    type: "Public",
    usage: `ℹ️ Format: **${config.BotPrefix}status userID/mention**\n\nℹ️ Examples:\n${config.BotPrefix}status ${config.BotOwnerID}\n${config.BotPrefix}status @mention`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                    status user/mention                                   //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args[0]) {

        let user2check = message.mentions.users.first() || args[0];
        return CheckUserStatus(user2check);
    } else return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function CheckUserStatus(user2status) {
        let ReplaceMentionToID = user2status.toString().replace(/[\\<>@#&!]/g, ""); // replace mention to an ID

        bot.users.fetch(ReplaceMentionToID).then(UserStatus => {
            let UserAvatarURL = UserStatus.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

            // define the embed: information while no playing
            let embed_status_information_no_game = new Discord.MessageEmbed()
                .setColor(embedColors.StatusMessage)
                .setTitle('User Status!')
                .setDescription(`Command: ** ${config.BotPrefix}status **\nChannel: ${message.channel} \n\nStatus: ** ${UserStatus.presence.status.toUpperCase()}**`)

                .addFields(
                    { name: 'Nickname', value: `${UserStatus} `, inline: true },
                    { name: 'ID', value: `${UserStatus.id} `, inline: true },
                    { name: 'Tag', value: `${UserStatus.tag} `, inline: true },
                    { name: 'Highest role', value: `${message.channel.guild.members.cache.get(UserStatus.id).roles.highest.name}`, inline: true },
                    { name: 'Created', value: `${UserStatus.createdAt.getDate()} ${UserStatus.createdAt.toLocaleString('default', { month: 'long' })} ${UserStatus.createdAt.getFullYear()}`, inline: true })

                .setFooter(`LOG: ID statusLog_1`)
                .setThumbnail(UserAvatarURL)
                .setTimestamp()

            if (!UserStatus.presence.activities[0]) { // USER DONT HAVE STATUS AND DONT PLAY GAMES
                // console.log(`1: THIS USER DONT HAVE STATUS AND DONT PLAY GAMES`);
                return message.channel.send(embed_status_information_no_game)
                    .then(statusMessage => messageRemoverWithReact(statusMessage, message.author))
                    .catch(() => { return });
            }
            else if (UserStatus.presence.activities[0] != "Custom Status") { // IF USER IS PLAYING BUT WITHOUT STATUS

                let GameTitle = UserStatus.presence.activities[0];

                // define the embed: information while playing
                let embed_status_information_game = new Discord.MessageEmbed()
                    .setColor(embedColors.StatusMessage)
                    .setTitle('User Status!')
                    .setDescription(`Command: ** ${config.BotPrefix}status **\nChannel: ${message.channel} \n\nStatus: ** ${UserStatus.presence.status.toUpperCase()}**\nPlaying: ${GameTitle}`)
                    .addFields(
                        { name: 'Nickname', value: `${UserStatus} `, inline: true },
                        { name: 'ID', value: `${UserStatus.id} `, inline: true },
                        { name: 'Tag', value: `${UserStatus.tag} `, inline: true },
                        { name: 'Highest role', value: `${message.channel.guild.members.cache.get(UserStatus.id).roles.highest.name}`, inline: true },
                        { name: 'Created', value: `${UserStatus.createdAt.getDate()} ${UserStatus.createdAt.toLocaleString('default', { month: 'long' })} ${UserStatus.createdAt.getFullYear()}`, inline: true })
                    .setFooter(`LOG: ID statusLog_2`)
                    .setThumbnail(UserAvatarURL)
                    .setTimestamp()

                // console.log(`2: THIS USER IS PLAYING BUT WITHOUT STATUS`);
                return message.channel.send(embed_status_information_game)
                    .then(statusMessage => messageRemoverWithReact(statusMessage, message.author))
                    .catch(() => { return });
            }
            else if (UserStatus.presence.activities[0] == "Custom Status" && !UserStatus.presence.activities[1]) { // IF USER HAVE STATUS BUT NOT PLAYING GAMES
                // console.log(`3: THIS USER HAVE STATUS BUT NOT PLAYING GAMES`);
                return message.channel.send(embed_status_information_no_game)
                    .then(statusMessage => messageRemoverWithReact(statusMessage, message.author))
                    .catch(() => { return });
            }
            else if (UserStatus.presence.activities[1]) { // IF USER HAVE STATUS AND PLAYING GAMES

                let GameTitle = UserStatus.presence.activities[1];

                // define the embed: information while playing
                let embed_status_information_game = new Discord.MessageEmbed()
                    .setColor(embedColors.StatusMessage)
                    .setTitle('User Status!')
                    .setDescription(`Command: ** ${config.BotPrefix}status **\nChannel: ${message.channel} \n\nStatus: ** ${UserStatus.presence.status.toUpperCase()}**\nPlaying: ${GameTitle}`)
                    .addFields(
                        { name: 'Nickname', value: `${UserStatus} `, inline: true },
                        { name: 'ID', value: `${UserStatus.id} `, inline: true },
                        { name: 'Tag', value: `${UserStatus.tag} `, inline: true },
                        { name: 'Highest role', value: `${message.channel.guild.members.cache.get(UserStatus.id).roles.highest.name}`, inline: true },
                        { name: 'Created', value: `${UserStatus.createdAt.getDate()} ${UserStatus.createdAt.toLocaleString('default', { month: 'long' })} ${UserStatus.createdAt.getFullYear()}`, inline: true })
                    .setFooter(`LOG: ID statusLog_3`)
                    .setThumbnail(UserAvatarURL)
                    .setTimestamp()

                // console.log(`4: THIS USER HAVE STATUS AND PLAYING GAMES`);
                return message.channel.send(embed_status_information_game)
                    .then(statusMessage => messageRemoverWithReact(statusMessage, message.author))
                    .catch(() => { return });
            }
        }).catch(error => errorLog(`status.js:1 CheckUserStatus()\nUnknown error in the CheckUserStatus() function.`, error));
    }
}