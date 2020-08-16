const fs = require('fs');

module.exports = (bot) => {

    fs.readdir('./handlers/', (err, files) => {
        if (err) console.error(err);
        let jsfiles = files.filter(f => f.split('.').pop() === 'js');
        if (jsfiles.length <= 0) return console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nThere are no events to load...\n\n');

        console.log(`▬▬▬▬▬▬▬▬ LOADED EVENTS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
        jsfiles.forEach((f, i) => {
            require(`./handlers/${f}`);
            console.log(`${i + 1}: ${f}`);
        });
        console.log('\n');
    });

    fs.readdir('./commands/', (err, files) => {
        if (err) console.error(err);

        let jsfiles = files.filter(f => f.split('.').pop() === 'js');
        if (jsfiles.length <= 0) return console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nThere are no commands to load...\n\n');

        console.log(`▬▬▬▬▬▬▬▬ LOADED COMMANDS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
        jsfiles.forEach((f, i) => {

            let props = require(`./commands/${f}`);
            console.log(`${i + 1}: ${props.help.type} - ${f}`);
            bot.commands.set(props.help.name, props);
        });
        console.log('\n');
    });
};