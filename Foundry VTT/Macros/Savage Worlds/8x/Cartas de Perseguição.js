const version = 'v1.0';

/* Cartas de Perseguição
Features
- Draw n cards placing them in the scene
- This macro can reset the table preventing from the error
- This macro can line up the cards
source: https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Savage%20Worlds/Cartas%20de%20Persegui%C3%A7%C3%A3o.js
icon: icons/sundries/gaming/playing-cards.webp
*/

getRequirements();

//console.warn("You are calling PlaceableObject.create which has been deprecated in favor of Document.create or Scene#createEmbeddedDocuments. Support will be removed in 0.9.0");

function getRequirements() {
  //How Many Cards to Draw
  //Width/Height
  //Which Table to Draw From
  let cardsList = "";
  Array.from(game.tables).map((el) => {
    cardsList += `<option value="${el.data.name}">${el.data.name}</option>`;
  });

  let template = `
  <p>Table to Draw From: <select id="tableName">${cardsList}</select></p>
  <p>
    Cards to Draw (Lines x Columns): <input id="dogFightLines" type="number" min="1" style="width: 50px;" value=1> x <input id="dogFightColumns" type="number" min="1" style="width: 50px;" value=9>
  </p>  
  <p>
    Height: <input id="height" type="number" min="1" style="width: 50px" value=150>
    Width: <input id="width" type="number" min="1" style="width: 50px" value=107>
  </p>
  <br />
  <p>
    <input type="checkbox" id="reset" checked/>
    Reset Table?
  </p> 
  <p>
    <input type="checkbox" id="stackupcards"/>
    Just stack up all cards
  </p>  
  <br />  
  <p>
    <h3>Horizontal spacing between cards</h3>
    <input id="spacingx" type="range" min="0" max="100" value="20" step="5">
  </p>
  <p>
    <h3>Vertical spacing between cards (dogfight only)</h3>
    <input id="spacingy" type="range" min="0" max="100" value="100" step="5">  
  </p>
  `;
  new Dialog({
    title: `Draw Cards To Table - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Draw",
        callback: async (html) => {
          makeTiles(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);
}

async function makeTiles(html) {  
  let spacingx = html.find("#spacingx")[0].value/100;
  let spacingy = html.find("#spacingy")[0].value/100;
  let dogFightLines = html.find("#dogFightLines")[0].value;
  let dogFightColumns = html.find("#dogFightColumns")[0].value;  
  let resetTable = html.find("#reset")[0].value;
  const stackupcards = html.find("#stackupcards")[0].checked;
  let tableName = html.find("#tableName")[0].value;
  let cardsToDraw = dogFightLines*dogFightColumns;
  let _height = html.find("#height")[0].value;
  let _width = html.find("#width")[0].value;

  if (resetTable=='on') {
    await game.tables.find((el) => el.data.name == tableName).reset();
  }

  let cardDraws = (
    await game.tables
      .find((el) => el.data.name == tableName)
      .drawMany(cardsToDraw)
  ).results;
      
  let centerX = game.scenes.active.data.width / 3;
  let centerY = game.scenes.active.data.height / 2;
  
  let deltaX = 0;
  let deltaY = 0;
  let counter = 0;
  
  //console.log(spacingx + '/' + spacingy + ' stackupcards:' + (stackupcards!='on'));
  for (let y = 0; y < dogFightLines; y++) {
    deltaY = ( _height*y + _height*spacingy*y );
    for (let x = 0; x < dogFightColumns; x++) {                
      deltaX = ( _width*x + _width*spacingx*x );            
      if (stackupcards) {
        deltaX = 0;
        deltaY = 0;        
      }
      await TileDocument.create({
        img: cardDraws[counter].img,
        width: _width,
        height: _height,
        x: centerX + deltaX,
        y: centerY + deltaY
      });      
      //console.log('x:' + x + ' y:' + y + ' counter:' + counter + ' deltaX:' + deltaX + ' deltaY:' + deltaY);
      counter = counter + 1;
      //console.log('centerX: ' + centerX + ' / deltaX: ' + deltaX + ' / centerX+deltaX:' + (centerX+deltaX) ); 
    }      
  }
}
/*

      TileDocument.create({
        img: 'systems/swade/assets/pokerDeck/10_of_clubs.svg',
        width: 400,
        height: 800,
        x: 400,
        y: 400
      })
      


      Tile.create({
        img: 'systems/swade/assets/pokerDeck/10_of_clubs.svg',
        width: 400,
        height: 800,
        x: 400,
        y: 400
      }, {parent : canvas.scene.id})
      
      oh.  But Tile.create is deprecated.  Your {parent: canvas.scene.id} is probably thrown away.  If you're using TileDocument.create, it needs to be {parent: canvas.scene}
