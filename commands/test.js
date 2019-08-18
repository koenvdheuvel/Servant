const Discord = require("discord.js");
const request = require("request");

exports.run = async (client, message, args, level) => {
  const clientId = client.config.twitchToken;
  const twitchuri = 'https://api.twitch.tv/helix/streams?user_login=';

  const options = {
        method: 'GET',
        url: twitchuri + args[0],
        headers:
        {
            'Client-ID': clientId,
        }
      }

  const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

    request(options, function (error, response, body) {
      if (error) return console.log(error);
      const data = JSON.parse(body);
      console.log(data.data[0]);

      const strem = data.data[0];
      const thumb = strem.thumbnail_url.replace('{width}x{height}', '192x108');

      message.channel.send(thumb);
    });

};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "test",
  category: "Miscellaneous",
  description: "unset",
  usage: "test"
};
