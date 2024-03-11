// Import document classes.
import { AeternumActor } from "./documents/actor.mjs";
import { AeternumItem } from "./documents/item.mjs";
// Import sheet classes.
import { AeternumActorSheet } from "./sheets/actor-sheet.mjs";
import { AeternumItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { AETERNUM } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.aeternum = {
    AeternumActor,
    AeternumItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.AETERNUM = AETERNUM;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20 + @abilities.dex.mod",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = AeternumActor;
  CONFIG.Item.documentClass = AeternumItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("aeternum", AeternumActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("aeternum", AeternumItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.aeternum.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "aeternum.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}


Hooks.on('ready', () => {
  // Define the roll function
  function aroll(value, bonus = 0) {
    const die = Math.ceil(Math.random()*100);
    const random_part = Math.floor(die * value / 100);
    const result = random_part + value + bonus;
    console.log('Rolled', result)
    return result;
  }

  // Handle chat messages
  Hooks.on('chatMessage', (chatLog, messageText) => {
    // Check if the message starts with "aroll"
    if (messageText.startsWith('aroll(')) {
      // Extract the values from the message
      let match = messageText.match(/aroll\((\d+),\s*(\d+)\)/);
      if (match) {
        let value = parseInt(match[1]);
        let bonus = parseInt(match[2]);
        
        // Perform the roll
        let rollResult = aroll(value, bonus);

        // Determine who to send the message to
        let chatData = {
          user: game.user._id,
          speaker: ChatMessage.getSpeaker(),
          content: `Rolled ${value} + ${bonus} = ${rollResult}`
        };
        if (game.user.isGM) {
          chatData.whisper = ChatMessage.getWhisperRecipients('GM');
        }

        // Send the message to the chat
        ChatMessage.create(chatData);
      }
    }
  });
});


Hooks.on('init', () => {
  // Register the /aroll chat command
  game.settings.register('my-game-system', 'aroll', {
    name: 'aroll',
    scope: 'world',
    config: false,
    default: '',
    type: String
  });
});

Hooks.on('ready', () => {
  // Handle chat messages
  Hooks.on('chatMessage', async (chatLog, messageText) => {
    // Check if the message starts with "/aroll"
    if (messageText.startsWith('/aroll')) {
      // Parse the command arguments
      let args = messageText.split(' ');
      // Remove the "/aroll" part from the arguments
      args.shift();

      let value = parseInt(args[0]);
      let bonus = 0; // default bonus value

      // Check if there is a bonus provided
      if (args.length > 1) {
        bonus = parseInt(args[1]);
      }

      // Roll the dice using Foundry VTT's built-in roll function
      let roll = new Roll(`1d100`);
      try {
        await roll.evaluate(); // Wait for the roll to be evaluated
      } catch (error) {
        console.error("Error evaluating roll:", error);
        return;
      }

      let rollResult = roll.total;
      let totalRoll = Math.floor(roll.total/100 * value) + value + bonus;

      // Create a chat message with the result
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: `Rolled ${value}d6 ${bonus >= 0 ? '+' : ''} ${bonus} = ${totalRoll}`
      });
    }
  });
});



