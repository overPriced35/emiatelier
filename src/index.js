require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
  Client, GatewayIntentBits, PermissionFlagsBits, ChannelType,
  EmbedBuilder, REST, Routes, SlashCommandBuilder, MessageFlags,
  ActionRowBuilder, ButtonBuilder, ButtonStyle
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


const rolePlan = [
  // Staff roles are assigned manually to trusted people only.
  { name: "⛩️・Guuji", color: 0xE8A2C8, permissions: [PermissionFlagsBits.Administrator] },
  { name: "🌸・Senior Shrine Maiden", color: 0xE6A0B4, permissions: [
    PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewAuditLog
  ] },
  { name: "🦊・Shrine Maiden", color: 0xB69AD8, permissions: [
    PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ViewAuditLog
  ] },
  { name: "🪷・Miko Apprentice", color: 0xD9B8E8, permissions: [] },
  { name: "🎀・Cosplayer", color: 0xF4B8CF, selfAssignable: true },
  { name: "🎨・Artist", color: 0xE8B7D2, selfAssignable: true },
  { name: "📸・Photographer", color: 0xB8C6E8, selfAssignable: true },
  { name: "🧵・Crafter", color: 0xD9B8A7, selfAssignable: true },
  { name: "✨・Shrine Visitor", color: 0xE9D6A5 },
  { name: "🌱・New Arrival", color: 0xA9D8C8 },
  { name: "📢・Announcement Pings", color: 0xF1C7A8, mentionable: true, selfAssignable: true },
  { name: "🎉・Event Pings", color: 0xC8B6E8, mentionable: true, selfAssignable: true }
];

const selfRoleButtons = [
  { id: "selfrole_cosplayer", label: "Cosplayer", emoji: "🎀", role: "🎀・Cosplayer" },
  { id: "selfrole_artist", label: "Artist", emoji: "🎨", role: "🎨・Artist" },
  { id: "selfrole_photographer", label: "Photographer", emoji: "📸", role: "📸・Photographer" },
  { id: "selfrole_crafter", label: "Crafter", emoji: "🧵", role: "🧵・Crafter" },
  { id: "selfrole_announcements", label: "Announcement pings", emoji: "📢", role: "📢・Announcement Pings" },
  { id: "selfrole_events", label: "Event pings", emoji: "🎉", role: "🎉・Event Pings" }
];

async function ensureRole(guild, info) {
  let role = guild.roles.cache.find((item) => item.name === info.name);
  const options = {
    name: info.name,
    colors: { primaryColor: info.color },
    permissions: info.permissions || [],
    mentionable: Boolean(info.mentionable),
    reason: "Shrine Assistant server setup"
  };
  if (role) {
    await role.edit(options);
    return role;
  }
  role = await guild.roles.create(options);
  return role;
}

function buildSelfRoleRows() {
  const buttons = selfRoleButtons.map((item) =>
    new ButtonBuilder()
      .setCustomId(item.id)
      .setLabel(item.label)
      .setEmoji(item.emoji)
      .setStyle(ButtonStyle.Secondary)
  );
  return [
    new ActionRowBuilder().addComponents(buttons.slice(0, 4)),
    new ActionRowBuilder().addComponents(buttons.slice(4, 6))
  ];
}

const selfRoleEmbed = () => new EmbedBuilder()
  .setColor(pink)
  .setTitle("୨୧ Choose your shrine roles")
  .setDescription(
    "Pick the roles that suit you! Tap a button again to remove that role.\n\n" +
    "**Community interests**\n🎀 Cosplayer • 🎨 Artist • 📸 Photographer • 🧵 Crafter\n\n" +
    "**Optional notifications**\n📢 Announcement pings • 🎉 Event pings\n\n" +
    "These roles are optional. Staff roles are assigned by the server team only."
  )
  .setFooter({ text: "Emi Atelier • choose what fits you ♡" });

const channelPlan = [
  { name: "🌸・welcome", topic: "A warm welcome to the shrine." },
  { name: "📜・rules", topic: "Please read our community guidelines." },
  { name: "📢・announcements", topic: "Official Emi Atelier announcements." },
  { name: "💬・general", topic: "Chat, meet people, and make yourself at home." },
  { name: "🎀・introductions", topic: "Tell the community a little about yourself." },
  { name: "🎭・choose-roles", topic: "Choose your own community and notification roles." },
  { name: "🤖・bot-commands", topic: "A home for bot commands." }
];

async function ensureCategory(guild, name, permissionOverwrites) {
  let category = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildCategory && item.name === name
  );
  if (!category) {
    category = await guild.channels.create({
      name, type: ChannelType.GuildCategory,
      permissionOverwrites: permissionOverwrites || []
    });
  } else if (permissionOverwrites) {
    await category.permissionOverwrites.set(permissionOverwrites);
  }
  return category;
}

async function ensureChannel(guild, category, info, permissionOverwrites) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === info.name
  );
  if (!channel) {
    channel = await guild.channels.create({
      name: info.name, type: ChannelType.GuildText,
      parent: category.id, topic: info.topic,
      permissionOverwrites: permissionOverwrites || []
    });
  } else {
    if (channel.parentId !== category.id) await channel.setParent(category.id);
    if (permissionOverwrites) await channel.permissionOverwrites.set(permissionOverwrites);
    if (info.topic) await channel.setTopic(info.topic);
  }
  return channel;
}

async function ensureForumChannel(guild, category, info, permissionOverwrites) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildForum && item.name === info.name
  );
  const options = {
    name: info.name, type: ChannelType.GuildForum, parent: category.id,
    topic: info.topic, permissionOverwrites,
    availableTags: info.tags.map((name) => ({ name, moderated: false }))
  };
  if (!channel) {
    channel = await guild.channels.create(options);
  } else {
    if (channel.parentId !== category.id) await channel.setParent(category.id);
    await channel.edit({ topic: info.topic, availableTags: options.availableTags });
    await channel.permissionOverwrites.set(permissionOverwrites);
  }
  return channel;
}

function galleryPermissions(guild, postingRole, staffRoles) {
  const overwrites = [{
    id: guild.roles.everyone.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions],
    deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads]
  }, {
    id: client.user.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages]
  }];
  for (const roleName of [postingRole, ...staffRoles]) {
    const role = guild.roles.cache.find((item) => item.name === roleName);
    if (role) overwrites.push({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
    });
  }
  return overwrites;
}

function staffChannelPermissions(guild, allowedRoleNames) {
  const overwrites = [{
    id: guild.roles.everyone.id,
    deny: [PermissionFlagsBits.ViewChannel]
  }, {
    id: client.user.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ManageMessages]
  }];
  for (const roleName of allowedRoleNames) {
    const role = guild.roles.cache.find((item) => item.name === roleName);
    if (role) overwrites.push({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
    });
  }
  return overwrites;
}

async function ensureRolePanel(channel) {
  const messages = await channel.messages.fetch({ limit: 30 }).catch(() => null);
  const existing = messages && messages.find((message) =>
    message.author.id === client.user.id &&
    message.embeds.some((item) => item.title === "୨୧ Choose your shrine roles")
  );
  if (existing) {
    await existing.edit({ embeds: [selfRoleEmbed()], components: buildSelfRoleRows() });
  } else {
    await channel.send({ embeds: [selfRoleEmbed()], components: buildSelfRoleRows() });
  }
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
  await guild.roles.fetch();

  const mainCategory = await ensureCategory(guild, "⛩️・THE SHRINE");
  const galleryCategory = await ensureCategory(guild, "🌸・COMMUNITY GALLERY");
  const staffCategory = await ensureCategory(guild, "⛩️・SHRINE STAFF", [{
    id: guild.roles.everyone.id,
    deny: [PermissionFlagsBits.ViewChannel]
  }, {
    id: client.user.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
  }]);

  for (const info of rolePlan) await ensureRole(guild, info);

  const channels = {};
  for (const info of channelPlan) {
    channels[info.name] = await ensureChannel(guild, mainCategory, info);
  }

  const staffNames = ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"];
  const forumChannels = [
    {
      name: "🎀・cosplay-showcase",
      topic: "Share finished cosplays, progress, and costume reveals.",
      postingRole: "🎀・Cosplayer",
      tags: ["Finished Cosplay", "Work in Progress", "Help Needed", "Convention Photos"]
    },
    {
      name: "🎨・art-gallery",
      topic: "Share illustrations, sketches, designs, and other artwork.",
      postingRole: "🎨・Artist",
      tags: ["Finished Artwork", "Work in Progress", "Sketch", "Feedback Wanted"]
    }
  ];
  for (const info of forumChannels) {
    channels[info.name] = await ensureForumChannel(
      guild, galleryCategory, info,
      galleryPermissions(guild, info.postingRole, staffNames)
    );
  }

  const standardGallery = [
    { name: "📸・photography", topic: "Share photos, discuss techniques, and talk about photography.", postingRole: "📸・Photographer" },
    { name: "🧵・crafting-corner", topic: "Share crafting projects, works in progress, questions, and techniques.", postingRole: "🧵・Crafter" }
  ];
  for (const info of standardGallery) {
    channels[info.name] = await ensureChannel(
      guild, galleryCategory, info,
      galleryPermissions(guild, info.postingRole, staffNames)
    );
  }

  channels["💬・gallery-chat"] = await ensureChannel(guild, galleryCategory, {
    name: "💬・gallery-chat",
    topic: "Chat about gallery posts, share ideas, and give creators encouragement."
  });

  const staffChannels = [
    { name: "🔒・guuji-office", topic: "Private office for the Guuji.", roles: ["⛩️・Guuji"] },
    { name: "🌸・senior-shrine-maiden", topic: "Private coordination for senior shrine staff.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden"] },
    { name: "🦊・shrine-maiden-office", topic: "Staff coordination for shrine maidens.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"] },
    { name: "🪷・miko-training", topic: "Training and guidance for miko apprentices.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden", "🪷・Miko Apprentice"] }
  ];
  for (const info of staffChannels) {
    channels[info.name] = await ensureChannel(
      guild, staffCategory, info, staffChannelPermissions(guild, info.roles)
    );
  }

  await ensureEmbed(channels["🌸・welcome"], "୨୧ Welcome to the shrine!", welcomeEmbed(guild));
  await ensureEmbed(channels["📜・rules"], "୨୧ Shrine guidelines", rulesEmbed());
  await ensureRolePanel(channels["🎭・choose-roles"]);

  const config = readConfig();
  config[guild.id] = {
    categoryId: mainCategory.id,
    welcomeChannelId: channels["🌸・welcome"].id,
    roleChannelId: channels["🎭・choose-roles"].id,
    galleryCategoryId: galleryCategory.id,
    staffCategoryId: staffCategory.id
  };
  writeConfig(config);
}
const setupCommand = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Create the Emi Atelier shrine server template.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

client.once("clientReady", async () => {
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
  if (interaction.isButton() && interaction.customId.startsWith("selfrole_")) {
    const choice = selfRoleButtons.find((item) => item.id === interaction.customId);
    if (!choice || !interaction.inGuild()) return;
    const role = interaction.guild.roles.cache.find((item) => item.name === choice.role);
    if (!role) {
      return interaction.reply({ content: "That role isn't available yet. Please ask a moderator to run /setup.", flags: MessageFlags.Ephemeral });
    }
    if (!role.editable) {
      return interaction.reply({ content: "I can't manage that role yet. Please ask an admin to move my bot role above the self-assignable roles.", flags: MessageFlags.Ephemeral });
    }
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const hasRole = member.roles.cache.has(role.id);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (hasRole) {
      await member.roles.remove(role, "Member used the self-role panel");
      await interaction.editReply("୨୧ Removed **" + role.name + "** from your roles.");
    } else {
      await member.roles.add(role, "Member used the self-role panel");
      await interaction.editReply("୨୧ Added **" + role.name + "** to your roles!");
    }
    return;
  }

  if (!interaction.isChatInputCommand() || interaction.commandName !== "setup") return;
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "You need Administrator permission to use this command.",
      flags: MessageFlags.Ephemeral
    });
  }
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    await setupShrine(interaction.guild);
    await interaction.editReply("୨୧ Your shrine is ready! Channels, roles, and embeds are in place.");
  } catch (error) {
    console.error("Setup failed:", error);
    await interaction.editReply(
      "Setup failed. Check that I have Manage Roles, Manage Channels, View Channels, Send Messages, Embed Links, and Read Message History permissions. Also make sure my bot role is above the roles it needs to create."
    );
  }
});

client.on("guildMemberAdd", async (member) => {
  const communityRole = member.guild.roles.cache.find((role) => role.name === "✨・Shrine Visitor");
  if (communityRole && communityRole.editable) {
    await member.roles.add(communityRole, "Automatic community member role on joining").catch(console.error);
  }
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
