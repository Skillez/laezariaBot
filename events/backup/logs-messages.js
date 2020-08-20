const { bot, Discord, LogsWebhook, ownerDM } = require('../app');

//////////////////////////////////////////////////////////////////////////////////////////////
//                                      CHANNEL EVENT                                       //
//////////////////////////////////////////////////////////////////////////////////////////////

// message delete event
bot.on("messageDelete", async function (message) {
    if (!message.author) return;
    if (message.webhookID) return;

    if (message.content.length > 1900) {
        let splitMessage = message.content.match(/.{1,1900}/g);

        //define the embed: message deleted but too long
        let embed_message_deleted_too_long = new Discord.MessageEmbed()
            .setColor('RED')
            .setAuthor(message.author.tag, message.author.avatarURL())
            .setTitle(`Message deleted in #${message.channel.name}`)
            .setDescription("```" + `${splitMessage[0]}...` + "```")
            .setFooter(`Author ID: ${message.author.id}`)
            .setTimestamp()

        return await LogsWebhook.send(embed_message_deleted_too_long)
            .catch(error => {
                console.error(`logs-messages:1 LogsWebhook issue`);
                ownerDM(`logs-messages:1 ❌ LogsWebhook issue occurred\n${error}`);
                console.error(error);
            });
    }

    //define the embed: message deleted
    let embed_message_deleted = new Discord.MessageEmbed()
        .setColor('RED')
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setTitle(`Message deleted in #${message.channel.name}`)
        .setDescription("```" + message.content + "```")
        .setFooter(`Author ID: ${message.author.id}`)
        .setTimestamp()

    await LogsWebhook.send(embed_message_deleted)
        .catch(error => {
            console.error(`logs-messages:1 LogsWebhook issue`);
            ownerDM(`logs-messages:1 ❌ LogsWebhook issue occurred\n${error}`);
            console.error(error);
        });

});

// message delete bulk event
bot.on("messageDeleteBulk", async function (message) {
    // console.log(message);

    //define the embed: message deleted bulk
    let embed_message_deleted_bulk = new Discord.MessageEmbed()
        .setColor('RED')
        .setAuthor(bot.user.tag, bot.user.displayAvatarURL())
        .setTitle(`${message.size} messages purged in #${message.array()[0].channel.name}`)
        // .setDescription("```" + message.content + "```")
        // .setFooter(`Author ID: ${message.author.id}`)
        .setTimestamp()

    await LogsWebhook.send(embed_message_deleted_bulk)
        .catch(error => {
            console.error(`logs-messages:1 LogsWebhook issue`);
            ownerDM(`logs-messages:1 ❌ LogsWebhook issue occurred\n${error}`);
            console.error(error);
        });
});

// message update event
bot.on("messageUpdate", async function (oldMessage, newMessage) {
    console.log(oldMessage);
    console.log(newMessage);
    console.error(newMessage.author);


    if (newMessage.author === null) {
        if (!oldMessage.content || !newMessage.content) return;
        if (oldMessage.content.length > 900 || newMessage.content.length > 900) {
            let oldMessageSplit = oldMessage.content.match(/.{1,900}/g);
            let newMessageSplit = newMessage.content.match(/.{1,900}/g);

            //define the embed: message deleted but too long without author
            let embed_message_updated_too_long_without_author = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setAuthor(bot.user.tag, bot.user.displayAvatarURL())
                .setTitle(`Message edited in #${newMessage.channel.name}`)
                .setDescription("**Before**\n```" + `${oldMessageSplit[0]}..` + "```" + "\n**After**\n```" + `${newMessageSplit[0]}...` + "```")
                .setTimestamp()

            return await LogsWebhook.send(embed_message_updated_too_long_without_author)
                .catch(error => {
                    console.error(`logs-messages:1 LogsWebhook issue`);
                    ownerDM(`logs-messages:1 ❌ LogsWebhook issue occurred\n${error}`);
                    console.error(error);
                });
        }
    }








    if (!oldMessage.content || !newMessage.content) return;
    if (oldMessage.content.length > 900 || newMessage.content.length > 900) {
        let oldMessageSplit = oldMessage.content.match(/.{1,900}/g);
        let newMessageSplit = newMessage.content.match(/.{1,900}/g);


        // if (newMessage.author === null) {
        //     // console.log(`author null`);
        //     //define the embed: message deleted but too long without author
        //     let embed_message_updated_too_long_without_author = new Discord.MessageEmbed()
        //         .setColor('BLUE')
        //         .setAuthor(bot.user.author.tag, bot.user.displayAvatarURL())
        //         .setTitle(`Message edited in #${newMessage.channel.name}`)
        //         .setDescription("**Before**\n```" + `${oldMessageSplit[0]}..` + "```" + "\n**After**\n```" + `${newMessageSplit[0]}...` + "```")
        //         .setFooter(`Author ID: ${newMessage.author.id}`)
        //         .setTimestamp()

        //     return await LogsWebhook.send(embed_message_updated_too_long_without_author)
        //         .catch(error => {
        //             console.error(`logs-messages:1 LogsWebhook issue`);
        //             ownerDM(`logs-messages:1 ❌ LogsWebhook issue occurred\n${error}`);
        //             console.error(error);
        //         });
        // }

        //define the embed: message deleted but too long
        let embed_message_updated_too_long = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setAuthor(newMessage.author.tag, newMessage.author.avatarURL())
            .setTitle(`Message edited in #${newMessage.channel.name}`)
            .setDescription("**Before**\n```" + `${oldMessageSplit[0]}..` + "```" + "\n**After**\n```" + `${newMessageSplit[0]}...` + "```")
            .setFooter(`Author ID: ${newMessage.author.id}`)
            .setTimestamp()

        return await LogsWebhook.send(embed_message_updated_too_long)
            .catch(error => {
                console.error(`logs-messages:1 LogsWebhook issue`);
                ownerDM(`logs-messages:1 ❌ LogsWebhook issue occurred\n${error}`);
                console.error(error);
            });
    }


    //define the embed: message updated
    let embed_message_updated = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setAuthor(newMessage.author.tag, newMessage.author.avatarURL())
        .setTitle(`Message edited in #${newMessage.channel.name}`)
        .setDescription("Before\n```" + newMessage.content + "```" + "After\n```" + newMessage.content + "```")
        .setFooter(`Author ID: ${newMessage.author.id}`)
        .setTimestamp()

    await LogsWebhook.send(embed_message_updated)
        .catch(error => {
            console.error(`logs-messages:1 LogsWebhook issue`);
            ownerDM(`logs-messages:1 ❌ LogsWebhook issue occurred\n${error}`);
            console.error(error);
        });
});