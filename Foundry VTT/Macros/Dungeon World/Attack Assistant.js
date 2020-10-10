const macroVersion = 'v0.6.2';
/* Attack Assistant
Features
- Rolls damage if success. Offers Expose Yourself Damage in the chat.
- Check for Precise Tag. Uses DEX instead of STR if it is present.
- Check for Damage Tag. Adds the number of it to the weapon damage.
- Change Default Attribute for the move.
Class Features - Detects class features for attack
- Backstab, Herculean Appetites
Source: https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Dungeon%20World/Attack%20Assistant.js
Icon: https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Dungeon%20World/Attack%20Assistant.svg
*/
//

if (!actor) {
  ui.notifications.warn(`Select a token!`); // get selected token 
} else {
  main();
}

function main() {
  let weapons = canvas.tokens.controlled[0].actor.items.filter(el => el.data.type == "equipment").filter(el => el.data.data.itemType == "weapon");  
  let weaponsOptions = ""; //Display the Chat Card for the selected item
  for (let wep of weapons) {
    weaponsOptions += `<option value=${wep.id}>${wep.data.name}`
  }
  //  Classes  
  let extraOptions = ""; //Display the Chat Card for the selected item
  for (let opt of moveSearch("Backstab") ) {
    extraOptions += `<li style="display: inline-block;"><input type="checkbox" id="${opt.data.name}"/>${opt.data.name}</li>`;
  }
  for (let opt of moveSearch("Herculean Appetites") ) {
    extraOptions += `<li style="display: inline-block;"><input type="checkbox" id="${opt.data.name.replace(/\s/g, '')}"/>${opt.data.name}</li>`;
  }

  let dialogTemplate = `
  <h1>Select Weapon</h1>
  <p style="text-align:center; vertical-align:center"><select id="selectedweapon" style=" width:250px;">${weaponsOptions}</select></p>
  <h2>Modifiers</h2>  
  <table>
    <tr>
    <td style="text-align:center; vertical-align:center"><b>Move:</b> <input id="move_mod" type="number" min="-10" max="10" style="width: 80px" value=0></td>
    <td style="text-align:center; vertical-align:center"><b>Damage:</b> <input id="damage_mod" type="number" min="-10" max="10" style="width: 80px" value=0></td>
    </tr>
  </table>  
  
  <h2>Options</h2>  
  <ul style="display: inline-block; list-style-type: none;  list-style-type: none; text-align: left; margin: 0; padding: 0;">
    ${extraOptions}
  </ul>

  </br>
  <h2>Change Move Attribute</h2>
  <table>
    <tr>
    <td></td>
    <td style="text-align:center; vertical-align:center"><input type="radio" id="attribute" name="attribute" value="Default" checked="checked" />Default</td>    
    <td></td>
    </tr>
    <tr>
      <td style="text-align:center; vertical-align:center"><input type="radio" id="attribute" name="attribute" value="Strength" />Strength</td>
      <td style="text-align:center; vertical-align:center"><input type="radio" id="attribute" name="attribute" value="Dexterity"/>Dexterity</td>      
      <td style="text-align:center; vertical-align:center"><input type="radio" id="attribute" name="attribute" value="Constitution"/>Constitution</td>            
    </tr>
    <tr>    
      <td style="text-align:center; vertical-align:center"><input type="radio" id="attribute" name="attribute" value="Intelligence"/>Intelligence</td>      
      <td style="text-align:center; vertical-align:center"><input type="radio" id="attribute" name="attribute" value="Wisdom"/>Wisdom</td>      
      <td style="text-align:center; vertical-align:center"><input type="radio" id="attribute" name="attribute" value="Charisma"/>Charisma</td>          
    </tr>    
  </table>  
  `;


  new Dialog({
    title: `Attack Assistant - ${macroVersion}`,
    content: dialogTemplate,
    buttons: {
      Attack: {
        label: "Attack",
        callback: async (html) => {
          rollDamage(html);
        }
      },
      Cancel: {
        label: "Cancel"
      }
    }
  }).render(true);
}

// ==============================
// Main
// ==============================
async function rollDamage(html) {
  // form data
  let dice;
  let weapon = canvas.tokens.controlled[0].actor.items.filter(el => el.data._id == html.find("#selectedweapon")[0].value )[0];  
  
  let attributeChange = html.find('input[name="attribute"]:checked').val();  
  let move_mod = html.find("#move_mod")[0].value;
  let damage_mod = html.find("#damage_mod")[0].value; 
  // Classes
  let backstab = optionExist( html.find( "#Backstab" )[0] );
  let herculeanAppetites = optionExist( html.find( "#HerculeanAppetites" )[0] );
 
  // data
  let playerSelected = canvas.tokens.controlled[0].actor;
  let playerDamageDice = playerSelected.data.data.attributes.damage.value;
  let playerDamageMod = playerSelected.data.data.attributes.damage.misc;
  let attribute;
  let weaponTagDamage = tagCheckDamage(weapon);

  attribute = attributeSelect(weapon, attributeChange, playerSelected);
  
  // Output
  let msg = `<h2>${weapon.data.name}</h2>`;
  msg+=`<p><b>Weapon Tags:</b> ${weapon.data.data.tagsString}</p>`;
  if (attributeChange!='Default') { 
    msg+=`<p>Attribute used for the Move Roll is <b>${attributeChange}</b></p>`;
  }
  if (herculeanAppetites) { 
    dice = new Roll('1d6+1d8+' + attribute + '+' + move_mod).roll(); 
    msg+=herculeanAppetitesMesssage(dice); 
  } else {
    dice = new Roll('2d6+' + attribute + '+' + move_mod).roll();
  }
  let outcome = successCheck(dice);

  if (outcome==1) { // 6 or less - failure 
    msg+=`<h3 style="color:#b8950d">You failed!</h3>`;
    dice.toMessage({flavor: msg});  
  } else if (outcome==2) { // 7-9 - partial success
    let diceDamage = new Roll(playerDamageDice + '+' + weaponTagDamage + '+' + damage_mod).roll();
    msg+=`<h3 style="color:#00009c">Partial Success</h3>`    
    if (backstab) { msg+= backStab(outcome); }
    dice.toMessage({flavor: msg});                
    diceDamage.toMessage({flavor: `<h3 style="color:#d40023">Damage</h3>`});
  } else if (outcome==3) { // 10+ - success
    let diceDamage;    
    diceDamage = new Roll(playerDamageDice + '+' + weaponTagDamage + '+' + damage_mod).roll();   
    msg+=`<h3 style="color:#249c00">Success</h3>`
    msg+= exposeYourself();
    if (backstab) { msg+= backStab(outcome); }
    dice.toMessage({flavor: msg});                
    diceDamage.toMessage({flavor: `<h3 style="color:#d40023">Damage</h3>`});
  }
}

// ==============================
// Common Functions 
// ==============================
function optionExist(val) {
  if ( typeof(val) == 'undefined' ) {
    return false;
  } else {
    return val.checked;
  }
}

function tagCheckDamage(weapon) {
  let tags = weapon.data.data.tagsString.split(',');
  let tmp='';
  let output = 0;
  for (let i = 0; i < tags.length; i++) {
    tmp = tags[i].trim();
    if ( tmp.search(/damage/i)>-1 ) {      
      output = parseInt(tmp.match(/\d/i)[0]);
    }
  }
  return output;
}

function tagCheckPrecise(weapon) {
  let tags = weapon.data.data.tagsString.split(',');
  let tmp='';
  let output = false;
  for (let i = 0; i < tags.length; i++) {
    tmp = tags[i].trim();
    if ( tmp.search(/precise/i)>-1 ) {      
      output = true;
    }
  }
  return output;
}

function attributeSelect(weapon, attributeChange, playerSelected) {  
  if (attributeChange=='Default') { 
    if ( tagCheckPrecise(weapon) ) {
      return parseInt(playerSelected.data.data.abilities.dex['mod']);
    } else {
      return parseInt(playerSelected.data.data.abilities.str['mod']);
    }  
  } else if (attributeChange=='Strength') {
    return parseInt(playerSelected.data.data.abilities.str['mod']);
  } else if (attributeChange=='Dexterity') {
    return parseInt(playerSelected.data.data.abilities.dex['mod']);
  } else if (attributeChange=='Constitution') {
    return parseInt(playerSelected.data.data.abilities.con['mod']);
  } else if (attributeChange=='Intelligence') {
    return parseInt(playerSelected.data.data.abilities.int['mod']);
  } else if (attributeChange=='Wisdom') {
    return parseInt(playerSelected.data.data.abilities.wis['mod']);
  } else if (attributeChange=='Charisma') {
    return parseInt(playerSelected.data.data.abilities.cha['mod']);
  }
}

function successCheck(dicePool) {  
  let total = dicePool.total;
  if (total>=7 && total<=9) {
    return 2;
  } else if (total>=10) {
    return 3;
  } else if (total<=6) {
    return 1;
  }
}

function moveSearch(moveName) {
  return canvas.tokens.controlled[0].actor.items.filter(el => el.data.type == "move").filter(el => el.data.name == moveName);
}

function addEventListenerOnHtmlElement(element, event, func){    
    Hooks.once("renderChatMessage", (chatItem, html) => { // Use Hook to add event to chat message html element
        html[0].querySelector(element).addEventListener(event, func);        
    });
} // end addEventListenerOnHtmlElement
   
// ==============================
// Extra Functions
// ==============================
function exposeYourself() {  
  addEventListenerOnHtmlElement("#exposeYourselfButton", 'click', (e) => {    
    new Roll('1d6').roll().toMessage({flavor:`<h3 style="color:#d40023">Expose Yourself Damage</h3>`});
  });        
  return `<button style="background:#d10000;color:white" id="exposeYourselfButton">Expose Yourself Damage</button>`;
}
   
// ==============================
// Class Functions
// ==============================
function herculeanAppetitesMesssage(dicePool) {
  let temp = `<p><b>HerculeanAppetites</b> used.</p>`;
  if ( dicePool._dice[0].total > dicePool._dice[1].total ) { // d6>d8 
    temp+=`<p>The GM will also introduce a <b style="color:#d40023">complication or danger</b> that comes about due to your heedless pursuits.</p>`
  }
  return temp;
}

function backStab(success) {  
  addEventListenerOnHtmlElement("#backstabButton", 'click', (e) => {    
    new Roll('1d6').roll().toMessage({flavor:`<h3>Backstab Damage</h3>`});
  });        
  let tmp = ``;
  if(success==2) {
    tmp = `<h3>Choose one:</h3>`;
  } else if(success==3) {
    tmp = `<h3>Choose two:</h3>`;
  }
  return (tmp+`<ul>
<li>You don&rsquo;t get into melee with them</li>
<li>You deal your damage+1d6. [/roll 1d6] or [[/roll 1d6]] or [/r 1d6] or [[/r 1d6]]</li><button style="background:#d10000;color:white" id="backstabButton">Backstab Damage</button>
<li>You create an advantage, +1 forward to you or an ally acting on it</li>
<li>Reduce their armor by 1 until they repair it</li>
</ul>`);   
}


/* test stuff
  
  console.log('----------------------------');
  console.log(weapon);
  console.log(playerSelected);
  console.log(playerDamage);
  console.log('----------------------------');

canvas.tokens.controlled[0].actor
canvas.tokens.controlled[0].actor.data.data.attributes.damage.value;

canvas.tokens.controlled[0].actor.items.filter(el => el.data.type == "move").filter(el => el.data.name == "Backstab");
*/