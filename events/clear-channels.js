const { bot, errorLog } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                                CLEAR DELVE CHANNEL HANDLER                               //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', () => {
    // Clear messages older than 3 hours on the delve lfg channel every 14 minutes.
    bot.setInterval(() => { // timer every 14 minutes to trigger function in brackets
        CleanTheApplicationProcessChannel(config.application.processChannelID, 11) // clears #laezaria-apply messages that are older than 11 minutes.
    }, 60000 * 15);

    //////////////////////////////////////////////////////////////////////////////////////////////

    async function CleanTheApplicationProcessChannel(channelID, timeInMinutes) {

        let appProcessChannel = await bot.guilds.cache.get(config.laezariaServerID).channels.cache.find(ch => ch.id === channelID);
        if (!appProcessChannel) return errorLog(`clear-channels.js:1 CleanTheApplicationProcessChannel()\nappProcessChannel is not found.`, undefined);

        // Get messages and filter by createdTimestamp && pinned && author.bot
        appProcessChannel.messages.fetch({ limit: 50 })
            .then(messages => {
                let TimeToDelete = Math.floor(Date.now() - 60000 * timeInMinutes)
                let OldMessages = messages.filter(m => m.createdTimestamp < TimeToDelete && m.pinned === false && m.author.bot === false);

                if (OldMessages.size > 0) {
                    appProcessChannel.bulkDelete(OldMessages)
                        .catch(error => errorLog(`clear-channels.js:2 CleanTheApplicationProcessChannel()\nCan't remove mesages probably too old.`, error));
                }
            })
            .catch(error => {
                if (error.message.includes('Internal Server Error')) return;
                errorLog(`clear-channels.js:3 CleanTheApplicationProcessChannel()\nCatch any remaining errors.`, error)
            });
    }
});