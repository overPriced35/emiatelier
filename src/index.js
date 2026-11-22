require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
  Client, GatewayIntentBits, PermissionFlagsBits, ChannelType,
  EmbedBuilder, REST, Routes, SlashCommandBuilder
} = require("discord.js");

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});
const configPath = path.join(__dirname, "..", "config.json");
const readConfig = () => {
  try { return JSON.parse(fs.readFileSync(configPath, "utf8")); }
  catch { return {}; }
};
const writeConfig = (config) => fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
const pink = 0xF4B8CF;
const purple = 0xC9B6E4;

const welcomeEmbed = (guild) => new EmbedBuilder()
  .setColor(pink)
  .setTitle("୨୧ Welcome to the shrine!")
  .setDescription("A little corner for cosplay, creativity, and good company.\n\n♡ Read the rules\n♡ Introduce yourself\n♡ Share your projects and enjoy your stay!")
  .setThumbnail(guild.iconURL({ size: 256 }))
  .setFooter({ text: "Emi Atelier • made with love" })
  .setTimestamp();

const rulesEmbed = () => new EmbedBuilder()
  .setColor(purple)
  .setTitle("୨୧ Shrine guidelines")
  .setDescription(
    "**01 — Be kind**\nTreat everyone with respect. No harassment, bullying, or hate.\n\n" +
    "**02 — Keep it safe**\nNo doxxing, threats, or sharing private information.\n\n" +
    "**03 — Keep it appropriate**\nUse the right channels and mark sensitive content.\n\n" +
    "**04 — No spam**\nAvoid flooding chats or unsolicited advertising.\n\n" +
    "**05 — Respect creators**\nCredit artists and cosplayers. Ask before reposting their work.\n\n" +
    "**06 — Listen to staff**\nFollow moderator guidance and ask if something is unclear.\n\n" +
    "Help us keep this community welcoming."
  )
  .setFooter({ text: "Emi Atelier • thank you for being here ♡" });

const channelPlan = [
  { name: "🌸・welcome", topic: "A warm welcome to the shrine." },
  { name: "📜・rules", topic: "Please read our community guidelines." },
  { name: "📢・announcements", topic: "Official Emi Atelier announcements." },
  { name: "💬・general", topic: "Chat, meet people, and make yourself at home." },
  { name: "🎀・introductions", topic: "Tell the community a little about yourself." },
  { name: "🤖・bot-commands", topic: "A home for bot commands." }
];

async function ensureChannel(guild, category, info) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === info.name
  );
  if (!channel) {
    channel = await guild.channels.create({
      name: info.name, type: ChannelType.GuildText,
      parent: category.id, topic: info.topic
    });
  } else if (channel.parentId !== category.id) {
    await channel.setParent(category.id);
  }
  return channel;
}

async function ensureEmbed(channel, title, embed) {
  const messages = await channel.messages.fetch({ limit: 30 }).catch(() => null);
  const existing = messages && messages.find((message) =>
    message.author.id === client.user.id &&
    message.embeds.some((item) => item.title === title)
  );
  if (existing) await existing.edit({ embeds: [embed] });
  else await channel.send({ embeds: [embed] });
}

async function setupShrine(guild) {
  await guild.channels.fetch();
  let category = guild.channels.cache.find((channel) =>
    channel.type === ChannelType.GuildCategory && channel.name === "⛩️・THE SHRINE"
  );
  if (!category) {
    category = await guild.channels.create({
      name: "⛩️・THE SHRINE", type: ChannelType.GuildCategory
    });
  }

  const channels = {};
  for (const info of channelPlan) {
    channels[info.name] = await ensureChannel(guild, category, info);
  }
  await ensureEmbed(channels["🌸・welcome"], "୨୧ Welcome to the shrine!", welcomeEmbed(guild));
  await ensureEmbed(channels["📜・rules"], "୨୧ Shrine guidelines", rulesEmbed());

  const config = readConfig();
  config[guild.id] = {
    categoryId: category.id,
    welcomeChannelId: channels["🌸・welcome"].id
  };
  writeConfig(config);
}

const setupCommand = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Create the Emi Atelier shrine server template.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

client.once("ready", async () => {
  console.log("Logged in as " + client.user.tag);
  try {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [setupCommand.toJSON()]
    });
    console.log("Registered /setup.");
  } catch (error) {
    console.error("Could not register slash commands:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "setup") return;
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "You need Administrator permission to use this command.",
      ephemeral: true
    });
  }
  await interaction.deferReply({ ephemeral: true });
  try {
    await setupShrine(interaction.guild);
    await interaction.editReply("୨୧ Your shrine is ready! Channels and embeds are in place.");
  } catch (error) {
    console.error("Setup failed:", error);
    await interaction.editReply(
      "Setup failed. Check that I have Manage Channels, View Channels, Send Messages, Embed Links, and Read Message History permissions."
    );
  }
});

client.on("guildMemberAdd", async (member) => {
  const channelId = readConfig()[member.guild.id]?.welcomeChannelId;
  if (!channelId) return;
  const channel = await member.guild.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;
  const embed = new EmbedBuilder()
    .setColor(pink)
    .setTitle("୨୧ A new guest has arrived!")
    .setDescription("Welcome " + member.toString() + " to **" + member.guild.name + "**! Make yourself at home ♡")
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: "Emi Atelier • made with love" })
    .setTimestamp();
  await channel.send({ embeds: [embed] }).catch(console.error);
});

client.on("guildMemberRemove", async (member) => {
  const channelId = readConfig()[member.guild.id]?.welcomeChannelId;
  if (!channelId) return;
  const channel = await member.guild.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;
  const embed = new EmbedBuilder()
    .setColor(purple)
    .setTitle("୨୧ A guest has left the shrine")
    .setDescription("**" + member.user.username + "** has left us. Wishing them well ♡")
    .setTimestamp();
  await channel.send({ embeds: [embed] }).catch(console.error);
});

client.login(DISCORD_TOKEN);
