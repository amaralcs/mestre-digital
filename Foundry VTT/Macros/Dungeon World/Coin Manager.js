const macroVersion = 'v0.1';
/* Coin Manager
## Features
- Select a token and it'll be selected in the combo
- Choose the amount of coins to give or to remove.
- Send coins for everyone

source: https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Dungeon%20World/Coin%20Manager.js
icon: icons/commodities/currency/coins-plain-gold.webp
*/

main();

function main() {
  let playersNames = game.actors.entities.filter((t) => t.data.type === "character").map((p=> p.data.name)); 
  let playerNameList;
  let currentHeroPointsList = '';
  let playerSelected;
  if (actor) {   /* get selected token */
    playerSelected = canvas.tokens.controlled[0].actor.name;        
    playerNameList = `<option value="everyone">Everyone</option>`;  
  } else {
    playerNameList = `<option value="everyone" selected>Everyone</option>`;  
  }    
  playersNames.map((el) => {      
    if (el===playerSelected) {
      playerNameList += `<option value="${el}" selected>${el}</option>`;
    } else {
      playerNameList += `<option value="${el}">${el}</option>`;      
    }    
  });
  
  /* Show actual xp points*/
  let currentHeroPoints = checkHeroCoin();
  for (let i = 0; i < currentHeroPoints.length; i++) {
    currentHeroPointsList += '<li><b>' + currentHeroPoints[i][0] + ':</b> ' + currentHeroPoints[i][1] + '</li>';
  }  
  
  let template = `
  <h2>Choose</h2>
  <p><b>Hero:</b> <select id="playerName" style="width: 200px">${playerNameList}</select></p>
  <p>
    <b>How much coins do you want to give?</b> <input id="heroPoints" type="number" min="-10" max="10" style="width: 80px; box-sizing: border-box;border: none;background-color: #2d3748;color: white; text-align: center; " value=1>
  </p>    
  <h2>Current Coins</h2>
  <ul>
    ${currentHeroPointsList}
  </ul>
  `;
  
  new Dialog({
    title: `Coin Manager - ${macroVersion}`,
    content: template,
    buttons: {
      ok: {
        label: "Apply",
        callback: async (html) => {
          coinmanager(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);
}

async function coinmanager(html){
  let playerName = html.find("#playerName")[0].value;
  let heroPoints = html.find("#heroPoints")[0].value;  
  if (playerName=='everyone') {    
    updateAllHerosXP(heroPoints);
  } else { 
    updateHeroPoints(playerName, heroPoints);
  }
}

async function updateHeroPoints(playerName, heroPoints) {
  let character = game.actors.entities.filter((t) => t.data.type === "character").filter((v) => v.data.name === playerName)[0];
  let currentHeroPoints = parseInt( character.data.data.attributes.coin.value);
  let total = currentHeroPoints + parseInt( heroPoints );
  await character.update({['data.attributes.coin.value']: total});
  expMessage(character, heroPoints);
}

function updateAllHerosXP(heroPoints) {
  let players = game.actors.entities.filter((t) => t.data.type === "character");
  players.map(async player => {    
    let currentHeroPoints = parseInt( player.data.data.attributes.xp.value);
    let total = currentHeroPoints + parseInt( heroPoints );
    await player.update({['data.attributes.coin.value']: total});
    expMessage(player, heroPoints);  
  });
}

function checkHeroCoin() {
  let heros = [];
  let characters = game.actors.entities.filter((t) => t.data.type === "character");
  characters.forEach( (c) => {
    heros.push([c.data.name, c.data.data.attributes.coin.value]);
  }); 
  return heros;
}

function expMessage(player, points) {
  let message = `<h2>${player.data.name}</h2>`;  
  let plural = 'coin';
  if (parseInt(points)>1) {
    plural='coins';
  }
  message += `
  <div>
    <img style="vertical-align:middle" src="icons/commodities/currency/coins-plain-gold.webp" width="32" height="32">  
    <span>received <b>${points}</b> ${plural}.</</span>
  </div>     
  `;  
  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: message    
  };  
  ChatMessage.create(chatData, {});
}