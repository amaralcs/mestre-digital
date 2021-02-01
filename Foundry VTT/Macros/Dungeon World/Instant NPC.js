/* Instant NPC - v1.4
Source: https://github.com/brunocalado/mestre-digital/tree/master/Foundry%20VTT/Macros/Dungeon%20World
Icon: https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Dungeon%20World/Instant%20NPC.svg
Icon2: icons/environment/people/commoner.webp
*/

(async () => {
  const NPCName = await drawFromTable('Names');
  const NPCKnack = await drawFromTable('Knacks');
  const NPCInstinct = await drawFromTable('Instincts');  
  const damageDieRolado = damageDie();
  const randomArmorRolado = randomArmor();
  
  
  let msg = `<h3>Personality</h3>`;
  msg += `<p><b>Instinct:</b> ${NPCInstinct}</p>`;
  msg += `<p><b>Knack:</b> ${NPCKnack}</p>`;
  msg += `<h3>Treasure</h3>`;
  msg += `<p>${treasureCoins(1,10)} coins.</p>`;
  let message;
  let npchp = randomHP(4,10);
    
  message = `<h2><b style="color: red">${NPCName}</b></h2>`;    
  message+=`<p><b>Damage Die:</b> ${damageDieRolado}</p>`;
  message+=`<p><b>Armor:</b> ${randomArmorRolado}</p>`;
  message+=msg;

  addEventListenerOnHtmlElement("#createNPC", 'click', (e) => {    
    createRandomNPC({
    name: NPCName,
    type: "npc",
    img: "",    
    sort: 12000,
    data: {},
    token: {},
    items: [],
    flags: {},
    data: {
      details: {
        biography: msg
      },
      attributes: {
        damage: {
          value: damageDieRolado
        },
        ac: {
          value: randomArmorRolado
        },
        hp: {
          max: npchp,
          value: npchp
        }           
      }      
    }
    });    
  });          
  
  message+=`<button style="background:#d10000;color:white" id="createNPC">Create NPC</button>`;
  
  let chatData = {
    user: game.user._id,    
    content: message,
    whisper : ChatMessage.getWhisperRecipients("GM")
  };  
  ChatMessage.create(chatData, {});  

})()

/* Functions */
async function drawFromTable(tableName) {

  let list_compendium = await game.packs.filter(p=>p.entity=='RollTable');      
  let inside = await list_compendium.filter( p=>p.metadata.label=='Tables' )[0].getContent();      
  const table = await inside.filter( p=>p._data['name']==tableName )[0];          
  
  if (!table) {
    ui.notifications.warn(`Table ${tableName} not found.`, {});
    return;
  }
  return await table.roll().results[0].text;  
}

function treasureCoins(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;  
}

function damageDie() {
  const dice = ['d4', 'd6', 'd8', 'd10', 'd12'];
  return dice[ Math.floor(Math.random() * (5 - 0) ) + 0 ];
}

function randomArmor() {
  return Math.floor(Math.random() * (3 - 0) ) + 0;
}

function randomHP(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;  
}

function addEventListenerOnHtmlElement(element, event, func){    
    Hooks.once("renderChatMessage", (chatItem, html) => { // Use Hook to add event to chat message html element
        html[0].querySelector(element).addEventListener(event, func);        
    });
} // end addEventListenerOnHtmlElement

async function createRandomNPC(data) {  
  const instantNPC = await Actor.create(data);
  await instantNPC.sheet.render(true);    
}