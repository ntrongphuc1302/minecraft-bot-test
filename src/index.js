const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const { GoalFollow } = goals;

const bot = mineflayer.createBot({
  host: "localhost", // Minecraft server IP
  port: 52883, // Minecraft server port
  username: "Bot", // Minecraft username
  version: "1.20.4", // Minecraft version (adjust to your server version)
});

// const { mineflayer: mineflayerViewer } = require("prismarine-viewer");
// bot.once("spawn", () => {
//   mineflayerViewer(bot, { port: 3007, firstPerson: false }); // port is the minecraft server port, if first person is false, you get a bird's-eye view
// });

// Load the pathfinder plugin
bot.loadPlugin(pathfinder);

bot.on("login", () => {
  console.log("Bot has logged in");
});

// Function to count players other than the bot
function countOtherPlayers() {
  return Object.keys(bot.players).filter((player) => player !== bot.username)
    .length;
}

bot.on("chat", (username, message) => {
  const lowerMessage = message.toLowerCase();

  // Follow commands
  if (
    ["follow", "follow me", "come", "come here", "come to me"].includes(
      lowerMessage
    )
  ) {
    const playerToFollow = bot.players[username]?.entity;
    if (playerToFollow) {
      const mcData = require("minecraft-data")(bot.version);
      const defaultMove = new Movements(bot, mcData);
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalFollow(playerToFollow, 1), true);
      bot.chat("Coming to you, " + username + "!");
    } else {
      bot.chat("I can't see you!");
    }
    return;
  }

  // Stop following command
  if (lowerMessage === "stop") {
    bot.pathfinder.setGoal(null);
    bot.chat("Stopped following you, " + username + ".");
    return;
  }

  // Greeting commands
  if (
    lowerMessage === `hi ${bot.username.toLowerCase()}` ||
    lowerMessage === "hi"
  ) {
    bot.chat("Hello " + username);
    return;
  }

  if (
    lowerMessage === `hello ${bot.username.toLowerCase()}` ||
    lowerMessage === "hello"
  ) {
    bot.chat("Hi " + username);
    return;
  }

  // Time command
  if (["what time", "time"].includes(lowerMessage)) {
    const date = new Date();
    const time = date.toLocaleTimeString();
    bot.chat("The current time is " + time);
    return;
  }

  // Health status response
  if (
    lowerMessage === `are you ok ${bot.username.toLowerCase()}` ||
    lowerMessage === "are you ok"
  ) {
    const healthStatus = getHealthStatus();
    bot.chat(healthStatus);
    return;
  }

  // Check if there's only one player and bot, respond automatically
  if (countOtherPlayers() === 0) {
    if (["follow", "come"].includes(lowerMessage)) {
      bot.chat("I'm coming!");
      // Implement movement logic if needed
    } else if (["stop"].includes(lowerMessage)) {
      bot.pathfinder.setGoal(null);
      bot.chat("I stopped.");
    } else if (["hi", "hello"].includes(lowerMessage)) {
      bot.chat(`Hi there!`);
    } else if (["what time", "time"].includes(lowerMessage)) {
      const date = new Date();
      const time = date.toLocaleTimeString();
      bot.chat(`It's currently ${time}`);
    } else if (lowerMessage === "are you ok") {
      const healthStatus = getHealthStatus();
      bot.chat(healthStatus);
    }
  }
});

// Function to determine bot's health status
function getHealthStatus() {
  if (bot.health >= 15) {
    return "I'm fine";
  } else if (bot.health >= 10) {
    return "I'm okay";
  } else if (bot.health >= 5) {
    return "I'm not feeling well";
  } else {
    return "I'm dying";
  }
}

bot.on("error", (err) => {
  console.log("Error encountered:", err);
});

bot.on("end", () => {
  console.log("Bot has ended");
});
