process.env.TZ = "America/Montreal";
//require('newrelic');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 8080;
const Discord = require("discord.js");
const client = new Discord.Client();
var CronJob = require('cron').CronJob;
var currentGuild;
var canBecome = false;
var audioFileURL = 'https://youtu.be/NRdq439C7JM';
app.use(bodyParser.urlencoded({extended: true}));

const token = 'Mjk2ODM2NjgyMDIyMzg3NzEy.C74COA.cqZSGLxHBBy6S_aRPYI9hPucjsY';

var voiceChannels;
var lateNightSquadChannel;
var members = [];

var startJob = null;
var endJob = null;
var pictureJob = null;
var numberOfPeople;

client.on('ready', () => {
  console.log(new Date());
  console.log(`Logged in as ${client.user.username}!`);

  voiceChannels = client.channels.filter(g => {
    return g.type == 'voice';
  });

  lateNightSquadChannel = client.channels.filter(g => {
    return g.type == 'text' && g.name == 'late_night_squad';
  }).first();
  
  if(startJob == null)
  {
    startJob = new CronJob('00 * 01 * * *', function() {
      canBecome = true;
      console.log("Time to begin late night squad for the day");
      for(var channel of voiceChannels.values())
      {
        for(var member of channel.members.values())
        {
          member.addRole(member.guild.roles.find('name', 'Late Night Squad'));
        }
      }
    }, null, true, 'America/Montreal');
  }

  if(endJob == null)
  {
      endJob = new CronJob('00 00 08 * * *', function() {
      canBecome = false;
      console.log("Time to end late night squad for the day");
      var guilds = client.guilds;
      for(var guild of guilds.values())
      {
        var roleMembers = guild.roles.find('name', 'Late Night Squad').members;
        for(var member of roleMembers.values())
        {
          member.removeRole(guild.roles.find('name', 'Late Night Squad'));
        }
      }

    }, null, true, 'America/Montreal');
  }

  if(pictureJob == null)
  {
      pictureJob = new CronJob('00 00 01 * * *', function() {
        lateNightSquadChannel.sendFile("https://cdn.discordapp.com/attachments/296658163334381568/296871309130989568/unknown.png");
        var highestSize = 0;
        var highestVoiceChannel = voiceChannels.first();
        for(var channel of voiceChannels.values())
        {
          if(channel.members.size > highestSize)
          {
            highestVoiceChannel = channel;
            highestSize = channel.members.size;
          }
        }
        console.log(highestSize);

        // play streams using ytdl-core
        const ytdl = require('ytdl-core');
        const streamOptions = { seek: 0, volume: 1 };
        highestVoiceChannel.join()
        .then(connection => {
          const stream = ytdl(audioFileURL, {filter : 'audioonly'});
          const dispatcher = connection.playStream(stream, streamOptions);
          dispatcher.once('end', () => {
            connection.disconnect();
          });
        })
        .catch(console.error);
    }, null, true, 'America/Montreal');
  }


});


client.on('message', msg => {
  if(canBecome)
  {
      if(!(msg.member.roles.find('name', 'Late Night Squad')))
      {
        msg.member.addRole(msg.member.guild.roles.find('name', 'Late Night Squad'));
        console.log("added role");
      }
      else{
        console.log("This user already has late night squad role");
      }
  }
  else {
    console.log("It's not late enough for this");
  }
  if(msg.content == '=pong')
  {
    msg.channel.sendMessage('=ping');
  }
  if(msg.content == 'Hey, Late Night Squad, who should Cailin duo with?')
  {
    msg.channel.sendMessage('Eric, of course!');
  }


});

client.login(token);

app.listen(port, function() {
    console.log('Our app is running on port:' + port);
});
