const { bot, errorLog } = require('../laezariaBot');

//////////////////////////////////////////////////////////////////////////////////////////////
//                                    RATE LIMIT HANDLER                                    //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on("rateLimit", (rateLimitInfo) => {
    if (rateLimitInfo.timeout <= 10000) return;

    errorLog(`rate-limits.js:1 rateLimit Event\nRatelimited: ${rateLimitInfo.route}\nReached its limit of ${rateLimitInfo.limit} requests.\nTimeleft: ${msConversion(rateLimitInfo.timeout)} (${rateLimitInfo.timeout} ms).`, undefined);
    console.error(rateLimitInfo);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //Role.edit: 86400ms is the absolutely minimum

    function msConversion(millis) {
        let sec = Math.floor(millis / 1000);
        let hrs = Math.floor(sec / 3600);
        sec -= hrs * 3600;
        let min = Math.floor(sec / 60);
        sec -= min * 60;

        if (hrs > 1) {
            if (min === 1 && sec === 1) return `${hrs} hours` + " " + `${min} minute` + " " + `${sec} second`;
            if (min === 1) return `${hrs} hours` + " " + `${min} minute` + " " + `${sec} seconds`;
            if (sec === 1) return `${hrs} hours` + " " + `${min} minutes` + " " + `${sec} second`;
            return `${hrs} hours` + " " + `${min} minutes` + " " + `${sec} seconds`;
        }

        if (hrs === 1) {
            if (min === 1 && sec === 1) return `${hrs} hour` + " " + `${min} minute` + " " + `${sec} second`;
            if (min === 1) return `${hrs} hour` + " " + `${min} minute` + " " + `${sec} seconds`;
            if (sec === 1) return `${hrs} hour` + " " + `${min} minutes` + " " + `${sec} second`;
            return `${hrs} hour` + " " + `${min} minutes` + " " + `${sec} seconds`;
        }

        if (hrs < 1) {
            if (min === 1 && sec === 1) return `${min} minute` + " " + `${sec} second`;
            if (min === 1) return `${min} minute` + " " + `${sec} seconds`;
            if (sec === 1) return `${min} minutes` + " " + `${sec} second`;
            return `${min} minutes` + " " + `${sec} seconds`;
        }
    }
});