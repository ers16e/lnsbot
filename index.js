require('newrelic');
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
const Discord = require("discord.js");
const client = new Discord.Client();
var schedule = require('node-schedule');
var setrule = new schedule.RecurrenceRule();
var unsetRule = new schedule.RecurrenceRule();
var currentGuild;
setrule.hour = 5;
setrule.minute = 1;
unsetRule.hour = 12;
unsetRule.minute = 1;
var canBecome = true;

const token = 'Mjk2ODM2NjgyMDIyMzg3NzEy.C74COA.cqZSGLxHBBy6S_aRPYI9hPucjsY';

var voiceChannels;
var members = [];
client.on('ready', () => {
  console.log(new Date());
  console.log(`Logged in as ${client.user.username}!`);

  voiceChannels = client.channels.filter(g => {
    return g.type == 'voice';
  });

  var setLate = schedule.scheduleJob(setrule, function() {
    canBecome = true;
    console.log("whats good");
    for(var channel of voiceChannels.values())
    {
      for(var member of channel.members.values())
      {
        member.addRole(member.guild.roles.find('name', 'Late Night Squad'));
      }
    }
  });

  var unsetLate = schedule.scheduleJob(unsetRule, function() {
    canBecome = false;
    console.log("Not much");
    var guilds = client.guilds;
    for(var guild of guilds.values())
    {
      var roleMembers = guild.roles.find('name', 'Late Night Squad').members;
      for(var member of roleMembers.values())
      {
        member.removeRole(guild.roles.find('name', 'Late Night Squad'));
      }
    }

  });
});


client.on('message', msg => {
  if(canBecome)
  {
      msg.member.addRole(msg.member.guild.roles.find('name', 'Late Night Squad'));
      console.log("added role");
  }
  else {
    console.log("no sir!");
  }
});

client.login(token);

app.listen(port, function() {
    console.log('Our app is running on port:' + port);
});
