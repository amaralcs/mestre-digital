const macroVersion = 'v0.1';
/* Treasure
Features
- Choose damage and monster type to roll the table
source: 
icon: icons/containers/chest/chest-simple-walnut.webp
*/

(async () => { 
  let monsterType = [
  'Hoarder', 'Far from home', 'Magical', 'Divine', 'Planar', 'Lord over others', 'Ancient and noteworthy' 
  ].sort();
  let monsterTypeList = ``;
  let tmp;
  monsterType.map((el) => {  
    tmp = el.split(' ').join('').toLowerCase();      
    monsterTypeList+=`<li class="meuitem"><input type="checkbox" id="${tmp}"><label for="${tmp}">${el}</label></li>`;    
  });
  
  let template = `
  <style>  
  #dungeonworldmacrocss header {
    background: #060f52;
    border-radius: 0;    
    border: none;    
    margin-bottom: 2px;
    font-size: .75rem;
  }
  #dungeonworldmacrocss form {
    margin-bottom: 30px;   
  }
  #dungeonworldmacrocss .window-content {    
       
  }  
  #dungeonworldmacrocss .form-fields.buttons {
    justify-content: flex-start !important;
  }
  #dungeonworldmacrocss .button {
    height: 35px;
    box-shadow: inset 0 0 0 1px #1111FF,inset 0 0 0 1.5px var(--tertiary),inset 0 0 0 1px #1111FF;
    font-size: 12px;
    padding: 0;
    background: #eb34b7;
    color: white;
    cursor: pointer;
  }
  #dungeonworldmacrocss .button:hover {
    box-shadow: 0 0 4px red;
  }
  #dungeonworldmacrocss .meuitem input[type="radio"] {
    opacity: 0;
    position: fixed;
    width: 0;  
  }
  #dungeonworldmacrocss .minhalista {    
    display: inline-block;
    list-style-type: none; 
    text-align: left; 
    margin: 0; 
    padding: 0; 
    width: 100%;
  }
  #dungeonworldmacrocss .meuitem {    
    display: inline-block;    
    padding: 2px; 
  }  
  #dungeonworldmacrocss .meuitem label {    
    cursor: pointer;    
    margin: 0px 3px ;
    
    height: 100%;
    width: 100%;
    border-radius: 3px;
    font-size: 16px;
    font-family: "Signika", sans-serif;  
    background: #060f52;        
    color: white;    
  }
  
  #dungeonworldmacrocss .checkbox label i {
    margin-right: 5px;
    color: white;
    background: #6d729c;
  }
  #dungeonworldmacrocss .meuitem label:hover {
    box-shadow: 0 0 14px black;
  }
  #dungeonworldmacrocss .meuitem input[type="checkbox"]:selected + label {
    background: rgba(0, 0, 150, 0.7);
  }
  #dungeonworldmacrocss .dialog-button {
    height: 50px;
    background: #060f52;
    color: white;
    justify-content: space-evenly;
    align-items: center;
    cursor: pointer;
  }    
  </style>
  
  <h2>Choose</h2>

<table>
  <tr>
    <td><b style="color:red">Damage Die:</b> <input id="damageDiceID" type="text" style="width: 90px; box-sizing: border-box;border: none;background-color: #2d3748;color: white; text-align: center;" value="1d6"></td>
    <td><b style="color:red">Damage Bonus: </b> <input id="damageBonusID" type="number" min="-10" max="10" style="width: 70px; box-sizing: border-box;border: none;background-color: #2d3748;color: white; text-align: center;" value=0></td>    
  </tr>
<table>
  
  
  
  <h2>Monster Type</h2>
    <div class="form-fields">

    <ul class="minhalista">
      ${monsterTypeList}    
    </ul>
  </div>
  </br>
  `;
  
  new Dialog({
    title: `Treasure - ${macroVersion}`,
    content: template,
    buttons: {
      ok: {
        label: "Roll",
        callback: async (html) => {
          treasureRoller(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
    default: "ok"    
  }, { id: 'dungeonworldmacrocss'}).render(true);
})()

async function treasureRoller(html){
  let damageDice = html.find("#damageDiceID")[0].value;
  let damageBonus = html.find("#damageBonusID")[0].value;
  
  let hoarder = html.find("#hoarder")[0].checked;  
  let farfromhome = html.find("#farfromhome")[0].checked;
  let magical = html.find("#magical")[0].checked;
  let divine = html.find("#divine")[0].checked;
  let planar = html.find("#planar")[0].checked;
  let lordoverothers = html.find("#lordoverothers")[0].checked;
  let ancientandnoteworthy = html.find("#ancientandnoteworthy")[0].checked; 
  
  const options = {'hoarder':hoarder, 'farfromhome': farfromhome, 'magical': magical, 'divine': divine, 'planar': planar, 'lordoverothers': lordoverothers, 'ancientandnoteworthy': ancientandnoteworthy  }; 
  
  let result = rollDamage(damageDice, damageBonus, options);
  
  //rollTreasureTable( result, options );
  
  rollTreasureTable( 10, options );
  rollTreasureTable( 14, options );
  rollTreasureTable( 17, options );


  console.log('----------------');
  console.log( result );
  console.log( options );
  
  console.log('----------------');
}


/* Functions */
function rollDamage(damageDice, damageBonus, options) {
  let result;
  let dicePart1 = damageDice.match(/\d+/g)[0];
  let dicePart2 = damageDice.match(/\d+/g)[1];
  let newDice = damageDice;
  let extraDice='';
  
  if ( options['hoarder'] ) {
    newDice = parseInt( damageDice.match(/\d+/g)[0] ) * 2 + 'd' + damageDice.match(/\d+/g)[1] + 'kh';    
  }
  if ( options['lordoverothers'] ) {
    extraDice += '+1d4';    
  }
  if ( options['ancientandnoteworthy'] ) {
    extraDice += '+1d4';    
  }
  
  result = new Roll(newDice + '+' + damageBonus + extraDice).roll().total;
  
  if (isNaN(result)) {
    result = -1;
  } else if (result<1) {
    result = 1;
  } else if (result>18) {
    result = 18;
  } else {
    result = result-1;
  }
  return result;  
}

function rollTreasureTable(result, options) { 
  let treasureTb = [
`A few coins, 2d8 [<b style="color:red">${autoRoll('2d8')}</b>] or so`,
  `An item useful to the current situation`,
  `Several coins, about 4d10 [<b style="color:red">${autoRoll('4d10')}</b>]`,
  `A small item (gem, art) of considerable value, worth as much as 2d10×10 coins [<b style="color:red">${autoRoll('2d10*10')}</b>], 0 weight`,
  `Some minor magical trinket`,
  `Useful information (in the form of clues, notes, etc.)`,
  `A bag of coins, 1d4×100 [<b style="color:red">${autoRoll('1d4*100')}</b>] or thereabouts. 1 weight per 100.`,
  `A very valuable small item (gem, art) worth 2d6×100 [<b style="color:red">${autoRoll('2d6*100')}</b>], 0 weight`,
  `A chest of coins and other small valuables. 1 weight but worth 3d6×100 coins [<b style="color:red">${autoRoll('3d6*100')}</b>].`,
  `A magical item or magical effect`,
  `Many bags of coins for a total of 2d4×100 [<b style="color:red">${autoRoll('2d4*100')}</b>] or so`,
  `A sign of office (crown, banner) worth at least 3d4×100 coins [<b style="color:red">${autoRoll('3d4*100')}</b>]`,
  `A large art item worth 4d4×100 coins [<b style="color:red">${autoRoll('4d4*100')}</b>], 1 weight`,
  `A unique item worth at least 5d4×100 coins [<b style="color:red">${autoRoll('5d4*100')}</b>]`,
  `All the information needed to learn a new spell and <b>roll again</b>`,
  `A portal or secret path (or directions to one) and <b>roll again</b>`,
  `Something relating to one of the characters and <b>roll again</b>`,
  `A hoard: 1d10×1000 coins [<b style="color:red">${autoRoll('1d10*100')}</b>] and 1d10×10 [<b style="color:red">${autoRoll('1d10*10')}</b>] gems worth 2d6×100 [<b style="color:red">${autoRoll('2d6*100')}</b>] each`
  ];
  
  let message = `
  <h2>Treasure</h2>
  <div>
    <img style="vertical-align:middle" src="icons/containers/chest/chest-simple-walnut.webp" width="32" height="32">  
    <span>${treasureTb[result]}</span>    
  </div>      
  `;  

  if ( options['farfromhome'] ) {
    message+= `<p><b>Far from home:</b> add at least one ration (usable by anyone with similar taste<p>`;
  }
  if ( options['magical'] ) {
    message+= `<p><b>Magical:</b> some strange item, possibly magical<p>`;
  }
  if ( options['divine'] ) {
    message+= `<p><b>Divine:</b> a sign of a deity (or deities)<p>`;
  }
  if ( options['magical'] ) {
    message+= `<p><b>Planar:</b> something not of this earth<p>`;
  }

  let chatData = {
    user: game.user._id,    
    content: message,
    whisper : ChatMessage.getWhisperRecipients("GM")
  };  
  ChatMessage.create(chatData, {});  
}

function autoRoll(diceToRoll) {
 return new Roll(diceToRoll).roll().total; 
}