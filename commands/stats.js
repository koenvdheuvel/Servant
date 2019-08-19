const { version } = require("discord.js");
const moment = require("moment");
const fs = require('fs');
require("moment-duration-format");

function getBuildHash() {
  return new Promise(resolve => {
    fs.readFile('./build.txt', 'utf8', (err, data) => {
      if (err) {
        resolve('Unk');
        return;
      }
      const details = data.split('\n');
      const hash = `${details[0]}/${details[1].slice(0,10)}`;
      resolve(hash);
    });
  });
}

exports.run = async (client, message, args, level) => {
  const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
  const build = await getBuildHash();

  message.channel.send(`= STATISTICS =
• Bot        :: Servant
• Build      :: ${build}
• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime     :: ${duration}
• Users      :: ${client.users.size.toLocaleString()}
• Servers    :: ${client.guilds.size.toLocaleString()}
• Channels   :: ${client.channels.size.toLocaleString()}
• Discord.js :: v${version}
• Node       :: ${process.version}
• Author     :: Danskbog#0001
• Maintainer :: Westar#0001`, {code: "asciidoc"});
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "stats",
  category: "Miscellaneous",
  description: "Shows stupid bot stats",
  usage: "stats"
};
