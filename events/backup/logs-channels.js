const { bot, Discord, LogsWebhook, ownerDM } = require('../laezariaBot');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                                      CHANNEL EVENT                                       //
//////////////////////////////////////////////////////////////////////////////////////////////

// channel create event
bot.on("channelCreate", async function (channel) {
    if (channel.type === "dm") return;
    // console.error(channel);

    if (channel.type === "text") {
        if (channel.parent) {
            //define the embed: channel created with parent
            let embed_channel_created_with_parent = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Text channel created`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** ${channel.parent.name}‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_created_with_parent)
                .catch(error => {
                    console.error(`logs-channel:1 LogsWebhook issue`);
                    ownerDM(`logs-channel:1 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        } else {
            //define the embed: channel created without parent
            let embed_channel_created_without_parent = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Text channel created`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** None‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_created_without_parent)
                .catch(error => {
                    console.error(`logs-channel:2 LogsWebhook issue`);
                    ownerDM(`logs-channel:2 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }
    }

    if (channel.type === "voice") {
        if (channel.parent) {
            //define the embed: channel created with parent
            let embed_channel_created_with_parent = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Voice channel created`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** ${channel.parent.name}‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_created_with_parent)
                .catch(error => {
                    console.error(`logs-channel:3 LogsWebhook issue`);
                    ownerDM(`logs-channel:3 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        } else {
            //define the embed: channel created without parent
            let embed_channel_created_without_parent = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Voice channel created`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** None‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_created_without_parent)
                .catch(error => {
                    console.error(`logs-channel:4 LogsWebhook issue`);
                    ownerDM(`logs-channel:4 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }
    }
});

// channel delete event
bot.on("channelDelete", async function (channel) {
    if (channel.type === "dm") return;
    // console.error(channel);

    if (channel.type === "text") {
        if (channel.parent) {
            //define the embed: channel deleted with parent
            let embed_channel_deleted_with_parent = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`Text channel deleted`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** ${channel.parent.name}‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_deleted_with_parent)
                .catch(error => {
                    console.error(`logs-channel:5 LogsWebhook issue`);
                    ownerDM(`logs-channel:5 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        } else {
            //define the embed: channel deleted without parent
            let embed_channel_deleted_without_parent = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`Text channel deleted`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** None‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_deleted_without_parent)
                .catch(error => {
                    console.error(`logs-channel:6 LogsWebhook issue`);
                    ownerDM(`logs-channel:6 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }
    }

    if (channel.type === "voice") {
        if (channel.parent) {
            //define the embed: channel deleted with parent
            let embed_channel_deleted_with_parent = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`Voice channel deleted`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** ${channel.parent.name}‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_deleted_with_parent)
                .catch(error => {
                    console.error(`logs-channel:7 LogsWebhook issue`);
                    ownerDM(`logs-channel:7 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        } else {
            //define the embed: channel deleted without parent
            let embed_channel_deleted_without_parent = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`Voice channel deleted`)
                .setDescription(`**Name:** ${channel.name}\n**Category:** None‏‏‎‎`)
                .setFooter(`Channel ID: ${channel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_deleted_without_parent)
                .catch(error => {
                    console.error(`logs-channel:8 LogsWebhook issue`);
                    ownerDM(`logs-channel:8 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }
    }
});

// channel update event
bot.on("channelUpdate", async function (oldChannel, newChannel) {
    // console.error(channel);

    if (newChannel.type === "text") {
        if (oldChannel.name != newChannel.name) {
            //define the embed: channel update without parent
            let embed_channel_name_update = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle(`Text channel updated`)
                .setDescription(`**Name before:** ${oldChannel.name}\n**Name after:** ${newChannel.name}`)
                .setFooter(`Channel ID: ${newChannel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_name_update)
                .catch(error => {
                    console.error(`logs-channel:9 LogsWebhook issue`);
                    ownerDM(`logs-channel:9 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }

        if (oldChannel.topic != newChannel.topic) {
            //define the embed: channel update without parent
            let embed_channel_name_update = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle(`Text channel updated`)
                .setDescription(`**Topic before:** ${oldChannel.topic}\n**Topic after:** ${newChannel.topic}`)
                .setFooter(`Channel ID: ${newChannel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_name_update)
                .catch(error => {
                    console.error(`logs-channel:10 LogsWebhook issue`);
                    ownerDM(`logs-channel:10 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }
    }

    if (newChannel.type === "voice") {
        if (oldChannel.name != newChannel.name) {
            //define the embed: channel update
            let embed_channel_name_update = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle(`Voice channel updated`)
                .setDescription(`**Name before:** ${oldChannel.name}\n**Name after:** ${newChannel.name}`)
                .setFooter(`Channel ID: ${newChannel.id}`)
                .setTimestamp()

            await LogsWebhook.send(embed_channel_name_update)
                .catch(error => {
                    console.error(`logs-channel:11 LogsWebhook issue`);
                    ownerDM(`logs-channel:11 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }
    }
});