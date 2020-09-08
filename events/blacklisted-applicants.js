const { bot, Discord, sendEmbedLog, LaezariaIconURL, errorLog } = require('../app');
const config = require("../bot-settings.json");

const { google } = require('googleapis');
const keys = require('../Laezaria-Bot-292d692ec77c.json');
const spreadsheetIdd = '1IgTspXysaKNfMfxTypk1UMysDo7KcgDLDq6eqS4M_G4';

//////////////////////////////////////////////////////////////////////////////////////////////
//                              BLACKLISTED APPLICANTS HANDLER                              //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on("message", async message => {

    if (message.channel.id != config.Application_ChannelID) return; // return if not application channel
    if (message.author.id != bot.user.id || !message.embeds[0] || !message.embeds[0].fields[0]) return;
    // return if message author is other than my application or message without embed or message embed without field[0]

    // console.log(`Yes, its application channel - Sent by the ${bot.user.tag} - with embed message including field[0]`);
    return accessSpreadsheet();
    //////////////////////////////////////////////////////////////////////////////////////////////

    function accessSpreadsheet() {
        // console.error(`checkSpreadsheet() - Triggered`);

        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        spreadsheet.authorize(function (error, tokens) {
            if (error) return console.error(error);
            // console.log(`Connected!`);
            gsrun(spreadsheet);
        });

        async function gsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl })

            let data = await gsapi.spreadsheets.values.get({
                spreadsheetId: spreadsheetIdd,
                range: 'E5:P500'
            })
                .catch(error => errorLog(`blacklisted-applicants.js:1 gsrun()\nGoogle Service backend error.`, error));

            // console.log(data.data.values);
            // console.error(data.data.values.length);
            let applicantNameValue = message.embeds[0].fields[0].value.toString().replace(/[► `]/g, ""); // replace embed name field value to an in-game name
            let TEA = data.data.values;

            // console.log(applicantNameValue);
            // console.log(TEA);

            // nick requirements: 3 minimal - 20 maximum
            // console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
            for (let i = 0; i < TEA.length; i++) {
                if (TEA[i][2]) {
                    if (TEA[i][2].length >= 3 && TEA[i][2].length <= 20) {
                        // console.log(`tested ${i}: ${TEA[i][2]}`);

                        if (TEA[i][2].toLowerCase() === applicantNameValue.toLowerCase()) {
                            // console.log(`Detected(${i} [${TEA[i][2]}]): applicant ${applicantNameValue}`);
                            return WarningMessage(message, TEA[i][2], TEA[i][0], TEA[i][4], TEA[i][8], TEA[i][9], TEA[i][10], TEA[i][11]);
                        }
                    }
                }
            }
            // console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');

        }
    }

    function WarningMessage(applicationMessage, Nick, WarningLevel, Reason, Evid1, Evid2, Evid3, Evid4) {

        if (WarningLevel == '') var WarningLevel = 'undefined';
        if (WarningLevel === 'g') var WarningLevel = 'GREEN\nWell, I have no idea what to type here xD';
        if (WarningLevel === 'y') var WarningLevel = 'YELLOW\nDespite having offenses on record, the player might be reasonable. Likely not a major problem. This is the stage where we should try to convince players to change their behavior and delete cheating programs. ';
        if (WarningLevel === 'r') var WarningLevel = 'RED\nLong list of offenses keeps growing, indicating consistent negative behavior. Also if a person is difficult to reason with and/or displays direct disrespect towards those trying to keep things fair. Their removal is loosely enforced but highly recommended.';
        if (WarningLevel === 'b') var WarningLevel = 'BLACK\nBanned players. This classification is separate from yellow and red. Simply accumulating a lot of basic offenses can not elevate one from red to black. Black level threats should be removed from absolutely everywhere, since contact with them may be dangerous.';

        if (Reason === '') var Reason = 'undefined';

        if (Evid2 === undefined) var Evid2 = '';
        if (Evid3 === undefined) var Evid3 = '';
        if (Evid4 === undefined) var Evid4 = '';

        let WarningLevelArray = WarningLevel.split('\n'); // split string on new lane
        // console.log('--------------------------------------------------------------------------------------------');
        // console.error(`Embed text input\nNick: ${Nick}\nWarning Level: ${WarningLevel}\nReason: ${Reason}\nEvidence#1: ${Evid1}\nEvidence#2: ${Evid2}\nEvidence#3: ${Evid3}\nEvidence#4: ${Evid4}`);

        // Modify the application message author field to add warning emojis
        const receivedEmbed = applicationMessage.embeds[0];
        const addWarning = new Discord.MessageEmbed(receivedEmbed).setAuthor(`⚠️ Laezaria Application: ${Nick} ⚠️`, LaezariaIconURL);
        applicationMessage.edit(addWarning);

        // define the embed: warning log
        let embed_warning_application = new Discord.MessageEmbed()
            .setColor(WarningLevelArray[0])
            .setAuthor(`⚠️ New application warning ⚠️`, LaezariaIconURL)
            .addFields(
                { name: 'Nickname', value: '```' + Nick + '```\n' + `[**Jump to application message**](${applicationMessage.url})`, inline: false },
                { name: 'Reason', value: Reason, inline: false },
                { name: `Warning level: ${WarningLevelArray[0]}`, value: WarningLevelArray[1], inline: false },
                { name: 'Evidence', value: `${Evid1}\n${Evid2}\n${Evid3}\n${Evid4}`, inline: false })
            .setFooter(`LOG:ID BlacklistedApplicantsJS_1`)
            .setThumbnail(message.author.avatarURL())
            .setTimestamp()
        sendEmbedLog(embed_warning_application, config.BotLog_ChannelID, 'Laezaria Bot - Logs');
    }
});