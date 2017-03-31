process.env.TZ = "America/Montreal";
require('newrelic');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 8080;
const Discord = require("discord.js");
const client = new Discord.Client();
var schedule = require('node-schedule');
var setRule = new schedule.RecurrenceRule();
var pictureRule = new schedule.RecurrenceRule();
var unsetRule = new schedule.RecurrenceRule();
var currentGuild;
setRule.hour = 5;
unsetRule.hour = 12;
unsetRule.minute = 1;
pictureRule.hour = 5;
pictureRule.minute = 0;
var canBecome = true;
app.use(bodyParser.urlencoded({extended: true}));

const token = 'Mjk2ODM2NjgyMDIyMzg3NzEy.C74COA.cqZSGLxHBBy6S_aRPYI9hPucjsY';

var voiceChannels;
var lateNightSquadChannel;
var members = [];
client.on('ready', () => {
  console.log(new Date());
  console.log(`Logged in as ${client.user.username}!`);

  voiceChannels = client.channels.filter(g => {
    return g.type == 'voice';
  });

  lateNightSquadChannel = client.channels.filter(g => {
    return g.type == 'text' && g.name == 'late_night_squad';
  }).first();

  var setLate = schedule.scheduleJob(setRule, function() {
    canBecome = true;
    console.log("Time to begin late night squad for the day");
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

  });

  var postPicture = schedule.scheduleJob(pictureRule, function() {
      lateNightSquadChannel.sendFile("https://cdn.discordapp.com/attachments/296658163334381568/296871309130989568/unknown.png");
  })

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
});

client.login(token);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/form.html');
})

app.post('/', function(req, res) {
  setRule.hour = req.body.starthour;
  unsetRule.hour = req.body.endhour;
  console.log("New Start Hour: " + setRule.hour);
  console.log("New End Hour: " + unsetRule.hour);
  res.sendFile(__dirname + '/submitted.html');
})

app.listen(port, function() {
    console.log('Our app is running on port:' + port);
});
