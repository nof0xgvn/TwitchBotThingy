const tmi = require('tmi.js');
const token = require('./token');
const fetch = require('node-fetch');
const fs = require('fs');

// Define configuration options
const opts = {
  identity: {
    username: 'nob0tgvn',
    password: token.OAUTH_TOKEN
  },
  channels: [
    '#nof0xgvn'
  ]
};

const apiOpts = {
  method: 'GET',
  headers: {
    'Client-ID': token.CLIENT_ID,
    'Authorization': 'Bearer ' + token.MAIL_TOKEN
    }
  };

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Variables
var text = '';
var deaths = parseInt(fs.readFileSync('./deaths.txt'));

// Called every time a message comes in
function onMessageHandler (channel, usr, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  if (msg.charAt(0) != '!') { return; } // skip if message doesn't start with !
  
  //msg to array
  var [command, ...rest] = msg.split(' ');
  command = command.toLowerCase();

  var text = rest.join(' ');
  var user = usr.username;

  if (text == '') {
    text = 'nof0xgvn';
  }

  // mod only commands go here!
  if (usr.mod || user == 'nof0xgvn') {

    switch (command) {
      case '!shoutout':
      case '!so':
        funShout(text, channel);
        break;

      case '!resetdeaths':
        deaths = 0;
        fs.writeFileSync('./deaths.txt', deaths.toString())
        client.say(channel, `Deaths have been reset.`);
        break;

        default:
        console.log(`* Unknown mod command ${command}`);
    }
  }

  // commands go here!
  switch (command) {
    case '!dice':
      const num = rollDice(text);
      client.say(channel, `You rolled a ${num}`);
      break;

    case '!coin':
      var flip = coinFlip();
      client.say(channel, `You flipped ${flip}!`)
      break;

    case '!discord':
    case '!dc':
      client.say(channel, `Holy shit, it's actually real. -> https://discord.gg/peVRssB29x`);
      break;

    case '!hug':
      var hug = funHug(user, text);
      client.say(channel, hug);
      break;

    case '!rehug':
      var rehug = funRehug(user, text);
      client.say(channel, rehug);
      break;

    case '!lurk':
      var lurk = funLurk(user);
      client.say(channel, lurk);
      break;

    case '!pat':
    case '!pats':
      var output = funPat(user, text)
      client.say(channel, output);
      break;

    case '!bonk':
      client.say(channel, `${user} bonks ${text}`);
      break;

    case '!pancake':
    case '!pancakes':
      client.say(channel, `:pancakes: https://www.chefkoch.de/rezepte/192291081610362/Pancakes.html :pancakes:`)
      break;

    case '!youdied':
      died(channel);
      break; 

    case '!deaths':
      totalDeaths(channel);
      break;

    case '!unlurk':
    case '!re':
    case '!back':
      var back = funBack(user);
      client.say(channel, back);
      break;

    case '!commands':
    client.say(channel, `Find all my commands here: https://nof0xgvn.github.io/Twitch/Bot/commands.html`)
      break;

    default:
      console.log(`* Unknown command ${command}`);
  }
}

// Functions
function rollDice (input) {
  var sides = parseInt(input);
  if (isNaN(sides)) {sides = 6;}
  return Math.floor(Math.random() * sides) + 1;
}

function coinFlip() {
  var coin = ['heads', 'tails']
  return coin[Math.floor(Math.random()*coin.length)];
}

function funPat(usr, target) {
    var pats = [`${target} gets headpats from ${usr}! :3`,
    `${usr} gives ${target} some headpats uwu`,
    `${usr} is patting ${target}s head`]

  return pats[Math.floor(Math.random()*pats.length)];
}

function funLurk(usr) {
  if (usr == 'gladioday') {
    return`${usr} does a gladio and falls asleep on stream`;
  } else {
    var lurks = [`${usr} is here!... but not really...`,
      `${usr} does a lurk`,
      `HI, ${usr}! Bye ${usr}!`,
      `${usr} activated 1µ2x mode.`,
      `${usr} is afk`];

    return lurks[Math.floor(Math.random()*lurks.length)];
  }
}
//Kneti gae weil wegen boifren undso.
function funHug(usr, target) {
  var hugs = [`${usr} gives ${target} a hug`,
  `${usr} hugs ${target}.`,
  `${target} gets a big hug from ${usr}!`]

  return hugs[Math.floor(Math.random()*hugs.length)];
}

function funRehug(usr, target) {
  var rehugs = [`${usr} returns the hug to ${target}`,
  `${usr} hugs ${target} back`,
  `${usr} also hugs ${target}`];

  return rehugs[Math.floor(Math.random()*rehugs.length)];
}

async function getChID(usr) {
  var usrInfo = await fetch(`https://api.twitch.tv/helix/users?login=${usr}`, apiOpts)
  .then(usrInfo =>usrInfo.json());
  return usrInfo.data[0].id;
}

async function getChGame(usrID) {
  var chInfo = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${usrID}`, apiOpts)
  .then(chInfo =>chInfo.json());
  return chInfo.data[0].game_name;
}

async function funShout(usr, channel) {
  var id, game;
  getChID(usr).then(result => {
    id = result;
    getChGame(id).then(result2 => {
       game = result2;
       client.say(channel, `Check out ${usr}, they are playing ${game} at https://twitch.tv/${usr}`);
    })
  })
}

function died(channel) {
  deaths++;
  fs.writeFileSync('./deaths.txt', deaths.toString());
  client.say(channel, `You died! This is the ${deaths} time fØx has died.`);
}

function totalDeaths(channel) {
   client.say(channel, `fØx died ${deaths} times so far.`);
 } 


 function funBack(usr) {
   var unlurk = [`${usr} crawls back from the shadows`,
   `Welcome back ${usr}`,
   `${usr} reappears out of magic`];

    return unlurk[Math.floor(Math.random()*unlurk.length)];
 }

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
