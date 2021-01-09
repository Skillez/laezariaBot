const { bot, errorLog } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                                    READY EVENT HANDLER                                   //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', () => {
    setInterval(changeRoleColor, 60000 * 3);
    //////////////////////////////////////////////////////////////////////////////////////////////

    function changeRoleColor() {

        // Array with the Colors
        const ColorsArray = [
            'FF00EC', '7D10CB', '00FF32', 'FEFFFF', 'A700C1',
            '36EA54', '2CE4A7', 'B2F15C', 'E8B046', '1CFBE0',
            '010101', 'E6B7F2', '34F08E', '68E3C4', '8682B6',
            'E5C7CE', '2DFAB4', '5639CC', '2C69E5', '54A1E9'];
        const randomColor = ColorsArray[Math.floor(Math.random() * ColorsArray.length)];

        const role = bot.guilds.cache.get(config.laezariaServerID).roles.cache.get(config.roles.nitroRoleID);
        if (!role) return errorLog(`guild-nitro-rainbow-color.js:1 changeRoleColor()\nrole is undefined.`);

        role.edit({ color: randomColor })
            // .then(updated => console.log(`Changed ${updated.name} role color to ${role.hexColor}`))
            .catch(error => {
                if (error.message.includes('Internal Server Error')) return;
                errorLog(`guild-nitro-rainbow-color.js:1 changeRoleColor()\nError to change ${role.name} color.`, error)
            });
    }
});