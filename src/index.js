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
  .setDescription("Welcome to Atelier de Emi, the community from Emi Atelier. This is Emi's creative space for cosplay, art, photography, crafting and community.\n\nThe elegance and playful spirit of the Grand Narukami Shrine inspire the atmosphere, while Emi's creative journey and projects are at the heart of the atelier. Everyone is welcome to share their own creativity too. No Genshin knowledge required!")
  .setThumbnail(guild.iconURL({ size: 256 }))
  .setFooter({ text: "Atelier de Emi • made with love" })
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
  .setFooter({ text: "Atelier de Emi • thank you for being here ♡" });


const startHereEmbed = () => new EmbedBuilder()
  .setColor(pink)
  .setTitle("୨୧ Your first steps at the shrine")
  .setDescription(
    "**01 — Read the guidelines**\nVisit 📜・rules to learn how we keep the shrine welcoming.\n\n" +
    "**02 — Introduce yourself**\nSay hello in 🎀・introductions. Share only what you're comfortable sharing.\n\n" +
    "**03 — Choose your interests**\nVisit 🎭・choose-roles and select Cosplayer, Artist, Photographer, or Crafter. These roles unlock posting in their matching gallery spaces.\n\n" +
    "**04 — Explore and join in**\nBrowse the gallery and 🎐・creative-prompts, chat in 💬・general, and use 💬・gallery-chat to talk about creative posts.\n\n" +
    "**05 — Make a creator profile**\nUse /profile-set to introduce your creative interests and work. Browse shared profiles with /creators, or view one with /profile-view. This is optional, and you can remove your profile at any time with /profile-clear.\n\n" +
    "**06 — Share an idea or need help?**\nUse /suggest to share an idea, or /report to contact staff privately. You can also ask a shrine staff member for help. Never share passwords or sensitive personal information.\n\n**A little note**\nAtelier de Emi is Emi's creative space, with a look and atmosphere inspired by Yae Miko and the Grand Narukami Shrine. Emi's projects and creative journey are part of its identity, while every member is encouraged to share their own work and interests. You do not need to know Genshin Impact to belong here."
  )
  .setFooter({ text: "Atelier de Emi • make yourself at home ♡" });

const staffGuideEmbed = () => new EmbedBuilder()
  .setColor(purple)
  .setTitle("୨୧ Shrine Assistant — staff command guide")
  .setDescription("Use commands responsibly. Add a clear, factual reason to every moderation action. Commands are limited by Discord role hierarchy and the bot's permissions.")
  .addFields(
    { name: "Warnings", value: "`/warn member reason` — record a warning\n`/warnings member` — view warning history\n`/clearwarnings member` — clear recorded warnings", inline: false },
    { name: "Member actions", value: "`/timeout member minutes reason` — apply a timeout (up to 28 days)\n`/untimeout member reason` — remove a timeout\n`/kick member reason` — remove a member\n`/ban member reason` — ban a member", inline: false },
    { name: "Channel tools", value: "`/clear amount` — delete up to 100 recent messages (not messages older than 14 days)\n`/lock reason` and `/unlock` — lock or restore the current channel\n`/slowmode seconds` — set slowmode; use 0 to disable", inline: false },
    { name: "Community features", value: "`/prompt title theme description deadline` — publish a creative prompt\n`/spotlight member category link message` — celebrate a creator\n`/event-create` — schedule a community event", inline: false },
    { name: "Information", value: "`/userinfo member` — view basic member information\n`/staffhelp` — show this guide", inline: false },
    { name: "Role permissions", value: "Shrine Maiden: warnings, warning history, timeouts, message clearing.\nSenior Shrine Maiden: all of the above plus kicks.\nGuuji: full administration, including bans and channel management.\nMiko Apprentice: staff spaces and guidance only; no moderation powers.", inline: false },
    { name: "Staff expectations", value: "Keep reasons professional, do not share staff-only information, and escalate uncertain or serious cases to the Guuji. Never use moderation tools to settle personal disagreements.", inline: false }
  )
  .setFooter({ text: "Atelier de Emi • internal staff reference" });


const rolePlan = [
  // Staff roles are assigned manually to trusted people only.
  { name: "⛩️・Guuji", color: 0xE8A2C8, permissions: [PermissionFlagsBits.Administrator] },
  { name: "🌸・Senior Shrine Maiden", color: 0xE6A0B4, permissions: [
    PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.KickMembers, PermissionFlagsBits.ViewAuditLog
  ] },
  { name: "🦊・Shrine Maiden", color: 0xB69AD8, permissions: [
    PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers
  ] },
  { name: "🪷・Miko Apprentice", color: 0xD9B8E8, permissions: [] },
  { name: "🎀・Cosplayer", color: 0xF4B8CF, selfAssignable: true },
  { name: "🎨・Artist", color: 0xE8B7D2, selfAssignable: true },
  { name: "📸・Photographer", color: 0xB8C6E8, selfAssignable: true },
  { name: "🧵・Crafter", color: 0xD9B8A7, selfAssignable: true },
  { name: "✨・Shrine Visitor", color: 0xE9D6A5 },
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
  .setFooter({ text: "Atelier de Emi • choose what fits you ♡" });

const channelPlan = [
  { name: "🌱・start-here", topic: "New to the shrine? Start here for the welcome guide, rules, roles, and where to go next." },
  { name: "🌸・welcome", topic: "A warm welcome to the shrine." },
  { name: "📜・rules", topic: "Please read our community guidelines." },
  { name: "📢・announcements", topic: "Official Atelier de Emi announcements." },
  { name: "💬・general", topic: "Chat, meet people, and make yourself at home." },
  { name: "🎀・introductions", topic: "Tell the community a little about yourself." },
  { name: "🎭・choose-roles", topic: "Choose your own community and notification roles." },
  { name: "🤖・bot-commands", topic: "A home for Shrine Assistant commands and helpful tools." },
  { name: "💡・suggestions", topic: "Community ideas submitted through /suggest." },
  { name: "🌟・creator-spotlights", topic: "Community members and their creative work, celebrated by Emi Atelier and the Atelier de Emi team." },
  { name: "🎐・creative-prompts", topic: "Creative challenges and inspiration from Emi Atelier. Join in at your own pace and share your work in the gallery." }
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
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.SendMessagesInThreads, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages]
  }];
  for (const roleName of [postingRole, ...staffRoles]) {
    const role = guild.roles.cache.find((item) => item.name === roleName);
    if (role) overwrites.push({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions, PermissionFlagsBits.SendMessages, PermissionFlagsBits.SendMessagesInThreads, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.AttachFiles]
    });
  }
  return overwrites;
}

function standardChannelPermissions(guild, mode) {
  const everyone = {
    id: guild.roles.everyone.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
    deny: []
  };
  if (mode === "readOnly") {
    everyone.allow.push(PermissionFlagsBits.AddReactions);
    everyone.deny.push(PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads);
  } else {
    everyone.allow.push(PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.CreatePublicThreads);
  }
  return [everyone, {
    id: client.user.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages]
  }];
}

function staffReadOnlyPermissions(guild, allowedRoleNames) {
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
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [PermissionFlagsBits.SendMessages]
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
    const readOnly = ["🌸・welcome", "📜・rules", "📢・announcements", "🎭・choose-roles", "🌟・creator-spotlights", "🎐・creative-prompts"].includes(info.name);
    const overwrites = standardChannelPermissions(guild, readOnly ? "readOnly" : "chat");
    if (["📢・announcements", "🌟・creator-spotlights", "🎐・creative-prompts"].includes(info.name)) {
      for (const roleName of ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"]) {
        const staffRole = guild.roles.cache.find(role => role.name === roleName);
        if (staffRole) overwrites.push({
          id: staffRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles]
        });
      }
    }
    channels[info.name] = await ensureChannel(guild, mainCategory, info, overwrites);
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
  }, standardChannelPermissions(guild, "chat"));

  channels[moderationLogName] = await ensureChannel(guild, staffCategory, {
    name: moderationLogName,
    topic: "Private audit trail for moderation actions taken by Shrine Assistant."
  }, staffReadOnlyPermissions(guild, ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"]));

  channels["💡・suggestions"] = await ensureChannel(guild, mainCategory, { name: "💡・suggestions", topic: "Community ideas submitted through /suggest." }, standardChannelPermissions(guild, "readOnly"));

  const staffChannels = [
    { name: "📖・staff-command-guide", topic: "Private reference for Shrine Assistant staff commands and moderation expectations.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden", "🪷・Miko Apprentice"] },
    { name: "📨・member-reports", topic: "Private reports and support requests submitted to Shrine Assistant.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"] },
    { name: "🔒・guuji-office", topic: "Private office for the Guuji.", roles: ["⛩️・Guuji"] },
    { name: "🌸・senior-shrine-maiden", topic: "Private coordination for senior shrine staff.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden"] },
    { name: "🦊・shrine-maiden-office", topic: "Staff coordination for shrine maidens.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"] },
    { name: "🪷・miko-training", topic: "Training and guidance for miko apprentices.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden", "🪷・Miko Apprentice"] }
  ];
  for (const info of staffChannels) {
    const permissions = info.name === "📖・staff-command-guide"
      ? staffReadOnlyPermissions(guild, info.roles)
      : staffChannelPermissions(guild, info.roles);
    channels[info.name] = await ensureChannel(guild, staffCategory, info, permissions);
  }

  await ensureEmbed(channels["🌱・start-here"], "୨୧ Your first steps at the shrine", startHereEmbed());
  await ensureEmbed(channels["🌸・welcome"], "୨୧ Welcome to the shrine!", welcomeEmbed(guild));
  await ensureEmbed(channels["📜・rules"], "୨୧ Shrine guidelines", rulesEmbed());
  await ensureEmbed(channels["📖・staff-command-guide"], "୨୧ Shrine Assistant — staff command guide", staffGuideEmbed());
  await ensureRolePanel(channels["🎭・choose-roles"]);

  const config = readConfig();
  config[guild.id] = {
    ...(config[guild.id] || {}),
    categoryId: mainCategory.id,
    welcomeChannelId: channels["🌸・welcome"].id,
    roleChannelId: channels["🎭・choose-roles"].id,
    galleryCategoryId: galleryCategory.id,
    staffCategoryId: staffCategory.id
  };
  writeConfig(config);
}

const moderationLogName = "📋・moderation-logs";
const moderationCommands = [
  new SlashCommandBuilder().setName("warn").setDescription("Issue a formal member warning.")
    .addUserOption(o => o.setName("member").setDescription("Member to warn").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the warning").setRequired(true)),
  new SlashCommandBuilder().setName("warnings").setDescription("View a member's warning history.")
    .addUserOption(o => o.setName("member").setDescription("Member to check").setRequired(true)),
  new SlashCommandBuilder().setName("clearwarnings").setDescription("Clear a member's warning history.")
    .addUserOption(o => o.setName("member").setDescription("Member to clear").setRequired(true)),
  new SlashCommandBuilder().setName("timeout").setDescription("Temporarily timeout a member.")
    .addUserOption(o => o.setName("member").setDescription("Member to timeout").setRequired(true))
    .addIntegerOption(o => o.setName("minutes").setDescription("Duration in minutes (1–40320)").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true)),
  new SlashCommandBuilder().setName("untimeout").setDescription("Remove a member's timeout.")
    .addUserOption(o => o.setName("member").setDescription("Member to untimeout").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(false)),
  new SlashCommandBuilder().setName("kick").setDescription("Remove a member from the server.")
    .addUserOption(o => o.setName("member").setDescription("Member to kick").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true)),
  new SlashCommandBuilder().setName("ban").setDescription("Ban a member from the server.")
    .addUserOption(o => o.setName("member").setDescription("Member to ban").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true)),
  new SlashCommandBuilder().setName("clear").setDescription("Bulk-delete recent messages (up to 100).")
    .addIntegerOption(o => o.setName("amount").setDescription("Number of messages (2–100)").setMinValue(2).setMaxValue(100).setRequired(true)),
  new SlashCommandBuilder().setName("lock").setDescription("Prevent members from sending messages in this channel.")
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(false)),
  new SlashCommandBuilder().setName("unlock").setDescription("Restore member messaging in this channel."),
  new SlashCommandBuilder().setName("slowmode").setDescription("Set channel slowmode in seconds.")
    .addIntegerOption(o => o.setName("seconds").setDescription("0 to disable; maximum 21600").setMinValue(0).setMaxValue(21600).setRequired(true)),
  new SlashCommandBuilder().setName("userinfo").setDescription("View basic information about a server member.")
    .addUserOption(o => o.setName("member").setDescription("Member to inspect").setRequired(false)),
  new SlashCommandBuilder().setName("staffhelp").setDescription("Show the Shrine Assistant staff command guide."),
  new SlashCommandBuilder().setName("help").setDescription("See what Shrine Assistant can help you with."),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Learn about the Atelier de Emi community."),
  new SlashCommandBuilder().setName("suggest").setDescription("Send an idea to the Atelier de Emi team.")
    .addStringOption(o => o.setName("idea").setDescription("Your suggestion for the community").setMaxLength(1000).setRequired(true)),
  new SlashCommandBuilder().setName("report").setDescription("Privately contact shrine staff about a concern.")
    .addStringOption(o => o.setName("details").setDescription("Tell staff what happened").setMaxLength(1500).setRequired(true)),
  new SlashCommandBuilder().setName("event-create").setDescription("Create a community event (staff only).")
    .addStringOption(o => o.setName("title").setDescription("Name of the event").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("start").setDescription("Start date and time in ISO 8601 format, e.g. 2026-12-01T18:00:00+01:00").setRequired(true))
    .addIntegerOption(o => o.setName("duration").setDescription("Duration in minutes (15–1440)").setMinValue(15).setMaxValue(1440).setRequired(true))
    .addStringOption(o => o.setName("location").setDescription("Where the event takes place (online or venue)").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("description").setDescription("What members can expect").setMaxLength(1000).setRequired(false)),
  new SlashCommandBuilder().setName("events").setDescription("See upcoming Atelier de Emi community events."),
  new SlashCommandBuilder().setName("prompt").setDescription("Publish a creative prompt for the community (staff only).")
    .addStringOption(o => o.setName("title").setDescription("Short name for the prompt").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("theme").setDescription("Cosplay, art, photography, crafting or anything goes").setMaxLength(80).setRequired(true))
    .addStringOption(o => o.setName("description").setDescription("What should members create or try?").setMaxLength(1200).setRequired(true))
    .addStringOption(o => o.setName("deadline").setDescription("Optional deadline, e.g. 15 December or no deadline").setMaxLength(80).setRequired(false)),
  new SlashCommandBuilder().setName("kudos").setDescription("Give a community member a little public appreciation.")
    .addUserOption(o => o.setName("member").setDescription("The creator you want to appreciate").setRequired(true))
    .addStringOption(o => o.setName("message").setDescription("What would you like to appreciate them for?").setMaxLength(400).setRequired(true)),
  new SlashCommandBuilder().setName("profile-set").setDescription("Create or update your creator profile.")
    .addStringOption(o => o.setName("interests").setDescription("Your creative interests").setMaxLength(120).setRequired(true))
    .addStringOption(o => o.setName("about").setDescription("A short introduction about you and your work").setMaxLength(400).setRequired(true))
    .addStringOption(o => o.setName("portfolio").setDescription("Optional HTTPS link to your portfolio or socials").setMaxLength(500).setRequired(false))
    .addStringOption(o => o.setName("looking-for").setDescription("Optional: friends, collabs, feedback, advice, etc.").setMaxLength(160).setRequired(false)),
  new SlashCommandBuilder().setName("profile-view").setDescription("View a creator profile.")
    .addUserOption(o => o.setName("member").setDescription("Member whose profile you want to see").setRequired(false)),
  new SlashCommandBuilder().setName("profile-clear").setDescription("Delete your creator profile."),
  new SlashCommandBuilder().setName("creators").setDescription("Browse members who have shared a creator profile."),
  new SlashCommandBuilder().setName("spotlight").setDescription("Celebrate a community member's creative work (staff only).")
    .addUserOption(o => o.setName("member").setDescription("Creator to feature").setRequired(true))
    .addStringOption(o => o.setName("category").setDescription("Type of creative work").setRequired(true)
      .addChoices(
        { name: "Cosplay", value: "Cosplay" },
        { name: "Art", value: "Art" },
        { name: "Photography", value: "Photography" },
        { name: "Crafting", value: "Crafting" },
        { name: "Other creativity", value: "Other creativity" }
      ))
    .addStringOption(o => o.setName("link").setDescription("Link to the creator's work").setMaxLength(500).setRequired(true))
    .addStringOption(o => o.setName("message").setDescription("A short note about the work or creator").setMaxLength(500).setRequired(false))
].map(command => command.toJSON());

function getWarnings(config, guildId, userId) {
  return config[guildId]?.warnings?.[userId] || [];
}

async function sendModerationLog(guild, title, description, color = purple) {
  const logChannel = guild.channels.cache.find(channel =>
    channel.type === ChannelType.GuildText && channel.name === moderationLogName
  );
  if (!logChannel) return;
  const embed = new EmbedBuilder().setColor(color).setTitle(title)
    .setDescription(description).setTimestamp();
  await logChannel.send({ embeds: [embed] }).catch(console.error);
}

async function handleModerationCommand(interaction) {
  const command = interaction.commandName;
  const memberUser = interaction.options.getUser("member");
  const reason = interaction.options.getString("reason") || "No reason provided";
  const config = readConfig();
  const guildData = config[interaction.guild.id] ||= {};
  guildData.warnings ||= {};

  if (command === "prompt") {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: "Only shrine staff can publish creative prompts.", flags: MessageFlags.Ephemeral });
    }
    const title = interaction.options.getString("title", true);
    const theme = interaction.options.getString("theme", true);
    const description = interaction.options.getString("description", true);
    const deadline = interaction.options.getString("deadline");
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "🎐・creative-prompts");
    if (!channel) return interaction.reply({ content: "The creative prompts channel is not set up yet. Ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Atelier creative prompt: " + title)
      .setDescription(description)
      .addFields({ name: "Creative direction", value: theme, inline: true })
      .setFooter({ text: "A little inspiration from Emi Atelier • interpret it your way ♡" })
      .setTimestamp();
    if (deadline) embed.addFields({ name: "Deadline", value: deadline, inline: true });
    await channel.send({ content: "୨୧ A new creative prompt has arrived! Share your take in the relevant gallery channel.", embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "୨୧ Your creative prompt has been posted in 🎐・creative-prompts!", flags: MessageFlags.Ephemeral });
  }

  if (command === "kudos") {
    const recipient = interaction.options.getUser("member", true);
    const message = interaction.options.getString("message", true);
    if (recipient.id === interaction.user.id) return interaction.reply({ content: "Kudos are for celebrating someone else — give another creator their moment!", flags: MessageFlags.Ephemeral });
    if (recipient.bot) return interaction.reply({ content: "Let's save the kudos for a fellow human creator ♡", flags: MessageFlags.Ephemeral });
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "🌟・creator-spotlights");
    if (!channel) return interaction.reply({ content: "The creator spotlights channel isn't set up yet. Ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ A little appreciation!")
      .setDescription(message)
      .addFields(
        { name: "For", value: recipient.toString(), inline: true },
        { name: "From", value: interaction.user.toString(), inline: true }
      )
      .setThumbnail(recipient.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "Emi Atelier • kindness looks good on everyone ♡" })
      .setTimestamp();
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "୨୧ Your kudos have been shared in 🌟・creator-spotlights!", flags: MessageFlags.Ephemeral });
  }

  if (command === "profile-set") {
    const interests = interaction.options.getString("interests", true);
    const about = interaction.options.getString("about", true);
    const portfolio = interaction.options.getString("portfolio");
    const lookingFor = interaction.options.getString("looking-for");
    let parsed;
    if (portfolio) {
      try { parsed = new URL(portfolio); } catch {}
      if (!parsed || parsed.protocol !== "https:") {
        return interaction.reply({ content: "Please use a valid HTTPS link for your portfolio or social page.", flags: MessageFlags.Ephemeral });
      }
    }
    guildData.profiles ||= {};
    guildData.profiles[interaction.user.id] = {
      interests, about, portfolio: portfolio || null, lookingFor: lookingFor || null,
      updatedAt: new Date().toISOString()
    };
    writeConfig(config);
    return interaction.reply({ content: "୨୧ Your creator profile has been saved! Use /profile-view to preview it. You can update it any time with /profile-set or remove it with /profile-clear.", flags: MessageFlags.Ephemeral });
  }

  if (command === "profile-view") {
    const targetUser = interaction.options.getUser("member") || interaction.user;
    const profile = readConfig()[interaction.guild.id]?.profiles?.[targetUser.id];
    if (!profile) return interaction.reply({ content: targetUser.id === interaction.user.id ? "You haven't created a profile yet. Use /profile-set to introduce your creative work." : "That member hasn't created a creator profile yet.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Creator profile")
      .setDescription(profile.about)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Creator", value: targetUser.toString(), inline: true },
        { name: "Creative interests", value: profile.interests, inline: true }
      )
      .setFooter({ text: "Emi Atelier • every creator has a story ♡" });
    if (profile.lookingFor) embed.addFields({ name: "Open to", value: profile.lookingFor, inline: false });
    if (profile.portfolio) embed.addFields({ name: "Portfolio / socials", value: "[Visit link](" + profile.portfolio + ")", inline: false });
    return interaction.reply({ embeds: [embed] });
  }

  if (command === "creators") {
    const profiles = readConfig()[interaction.guild.id]?.profiles || {};
    const entries = Object.entries(profiles).slice(0, 10);
    if (!entries.length) return interaction.reply({ content: "No creator profiles have been shared yet. Be the first with /profile-set!", flags: MessageFlags.Ephemeral });
    const lines = [];
    for (const [userId, profile] of entries) {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) continue;
      lines.push("**" + member.displayName + "** — " + profile.interests + "\n" + profile.about.slice(0, 180) + "\nUse /profile-view to see their full profile.");
    }
    if (!lines.length) return interaction.reply({ content: "There are no currently available creator profiles.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(purple).setTitle("୨୧ Meet the creators of Atelier de Emi")
      .setDescription(lines.join("\n\n"))
      .setFooter({ text: "Emi Atelier • shared by creators, for creators ♡" });
    return interaction.reply({ embeds: [embed] });
  }

  if (command === "profile-clear") {
    const profiles = guildData.profiles || {};
    if (!profiles[interaction.user.id]) return interaction.reply({ content: "You don't have a creator profile to remove.", flags: MessageFlags.Ephemeral });
    delete profiles[interaction.user.id];
    writeConfig(config);
    return interaction.reply({ content: "୨୧ Your creator profile has been deleted.", flags: MessageFlags.Ephemeral });
  }

  if (command === "spotlight") {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: "Only shrine staff can publish creator spotlights.", flags: MessageFlags.Ephemeral });
    }
    const creator = interaction.options.getUser("member", true);
    const category = interaction.options.getString("category", true);
    const link = interaction.options.getString("link", true);
    const message = interaction.options.getString("message") || "Thank you for sharing your creativity with Atelier de Emi!";
    let parsed;
    try { parsed = new URL(link); } catch {}
    if (!parsed || parsed.protocol !== "https:") {
      return interaction.reply({ content: "Please provide a valid HTTPS link to the creator's work.", flags: MessageFlags.Ephemeral });
    }
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "🌟・creator-spotlights");
    if (!channel) return interaction.reply({ content: "The creator spotlight channel is not set up yet. Ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Creator spotlight: " + creator.username)
      .setDescription(message)
      .addFields(
        { name: "Featured creator", value: creator.toString(), inline: true },
        { name: "Creative corner", value: category, inline: true },
        { name: "View their work", value: "[Open featured work](" + link + ")" }
      )
      .setThumbnail(creator.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "Atelier de Emi • celebrating the creativity in our community ♡" })
      .setTimestamp();
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "୨୧ Spotlight published in 🌟・creator-spotlights!", flags: MessageFlags.Ephemeral });
  }

  if (command === "event-create") {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({ content: "Only event managers and shrine staff can create community events.", flags: MessageFlags.Ephemeral });
    }
    const title = interaction.options.getString("title", true);
    const startInput = interaction.options.getString("start", true);
    const duration = interaction.options.getInteger("duration", true);
    const location = interaction.options.getString("location", true);
    const description = interaction.options.getString("description") || "Join the Atelier de Emi community for this event!";
    const start = new Date(startInput);
    if (!Number.isFinite(start.getTime()) || start.getTime() <= Date.now()) {
      return interaction.reply({ content: "Please provide a valid future date and time in ISO 8601 format, including your UTC offset (for example, 2026-12-01T18:00:00+01:00).", flags: MessageFlags.Ephemeral });
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const event = await interaction.guild.scheduledEvents.create({
        name: title,
        description,
        scheduledStartTime: start,
        scheduledEndTime: new Date(start.getTime() + duration * 60 * 1000),
        privacyLevel: 2,
        entityType: 3,
        entityMetadata: { location },
        reason: "Community event created by " + interaction.user.tag
      });
      await interaction.editReply("୨୧ Event created: **" + event.name + "**\n" + event.url + "\nMembers can open the event to mark themselves as interested.");
    } catch (error) {
      await interaction.editReply("I couldn't create that event. Please check that I have the Manage Events permission and that the date, time and location are valid.");
      console.error("Event creation failed:", error);
    }
    return;
  }

  if (command === "events") {
    const events = await interaction.guild.scheduledEvents.fetch().catch(() => null);
    if (!events) return interaction.reply({ content: "I couldn't retrieve the event list just now.", flags: MessageFlags.Ephemeral });
    const upcoming = [...events.values()]
      .filter(event => event.scheduledStartTimestamp > Date.now())
      .sort((a, b) => a.scheduledStartTimestamp - b.scheduledStartTimestamp)
      .slice(0, 10);
    if (!upcoming.length) return interaction.reply({ content: "There are no upcoming community events scheduled yet. Keep an eye on 📢・announcements!", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Upcoming at Atelier de Emi")
      .setDescription(upcoming.map(event =>
        "**" + event.name + "**\n<t:" + Math.floor(event.scheduledStartTimestamp / 1000) + ":F> • " +
        (event.entityMetadata?.location || "Location to be announced") + "\n[View event](" + event.url + ")"
      ).join("\n\n"))
      .setFooter({ text: "Open an event to mark yourself as interested ♡" });
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  if (command === "help") {
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Shrine Assistant — help")
      .setDescription("Hello! I help keep Atelier de Emi organised and welcoming.")
      .addFields(
        { name: "Community", value: "`/suggest` — send an idea to the team\n`/report` — privately contact shrine staff\n`/serverinfo` — learn about this community\n`/events` — see upcoming community events\n`/kudos member message` — appreciate a fellow creator\n`/profile-set` — create or update your creator profile\n`/profile-view` — view a creator profile\n`/profile-clear` — remove your profile\n`/creators` — browse shared creator profiles\n`/userinfo` — view member information", inline: false },
        { name: "Getting started", value: "Read 📜・rules, introduce yourself in 🎀・introductions, and choose your interests in 🎭・choose-roles. Browse 🎐・creative-prompts for inspiration, then share your take in the Community Gallery!", inline: false }
      ).setFooter({ text: "Emi Atelier • shrine-inspired, creator-friendly • everyone is welcome ♡" });
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  if (command === "serverinfo") {
    const guild = interaction.guild;
    const embed = new EmbedBuilder().setColor(purple).setTitle("୨୧ Welcome to " + guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setDescription("Atelier de Emi is the community space from Emi Atelier — Emi's creator identity and creative journey are at its heart. The atmosphere takes inspiration from Yae Miko and the Grand Narukami Shrine, while welcoming everyone to share cosplay, art, photography and crafts. No Genshin knowledge required.")
      .addFields(
        { name: "Members", value: String(guild.memberCount), inline: true },
        { name: "Created", value: "<t:" + Math.floor(guild.createdTimestamp / 1000) + ":D>", inline: true },
        { name: "Explore", value: "Cosplay • Art • Photography • Crafting • Community", inline: false }
      ).setFooter({ text: "Emi Atelier • creator of Atelier de Emi ♡" });
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  if (command === "suggest") {
    const idea = interaction.options.getString("idea", true);
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "💡・suggestions");
    if (!channel) return interaction.reply({ content: "The suggestions channel is not set up yet. Please ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Community suggestion")
      .setDescription(idea).addFields({ name: "Submitted by", value: interaction.user.toString() })
      .setFooter({ text: "Atelier de Emi • thank you for helping the community grow ♡" }).setTimestamp();
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "Thank you! Your idea has been shared in 💡・suggestions.", flags: MessageFlags.Ephemeral });
  }

  if (command === "report") {
    const details = interaction.options.getString("details", true);
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "📨・member-reports");
    if (!channel) return interaction.reply({ content: "The private report channel is not set up yet. Please contact a shrine staff member directly.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(0xD98B8B).setTitle("୨୧ Private member report")
      .setDescription(details).addFields(
        { name: "Submitted by", value: interaction.user.tag + " (" + interaction.user.id + ")" },
        { name: "Where", value: interaction.channel ? interaction.channel.toString() : "Not available" }
      ).setTimestamp();
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "Your report has been sent privately to the shrine staff. Thank you for letting us know.", flags: MessageFlags.Ephemeral });
  }

  if (command === "staffhelp") {
    if (!interaction.member.roles.cache.some(role => ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden", "🪷・Miko Apprentice"].includes(role.name))) {
      return interaction.reply({ content: "This guide is for shrine staff only.", flags: MessageFlags.Ephemeral });
    }
    return interaction.reply({ embeds: [staffGuideEmbed()], flags: MessageFlags.Ephemeral });
  }

  if (command === "userinfo") {
    const user = memberUser || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: "I couldn't find that member in this server.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(purple).setTitle("୨୧ Member information")
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Member", value: user.tag, inline: true },
        { name: "User ID", value: user.id, inline: true },
        { name: "Joined server", value: member.joinedAt ? "<t:" + Math.floor(member.joinedAt.getTime() / 1000) + ":R>" : "Unknown", inline: true },
        { name: "Account created", value: "<t:" + Math.floor(user.createdAt.getTime() / 1000) + ":R>", inline: true },
        { name: "Roles", value: member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => role.toString()).join(", ").slice(0, 1000) || "None" }
      );
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  if (command === "warn" || command === "warnings" || command === "clearwarnings") {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "You need Moderate Members permission to use this command.", flags: MessageFlags.Ephemeral });
    }
  }

  if (command === "warn") {
    if (memberUser.id === interaction.user.id || memberUser.id === client.user.id || memberUser.id === interaction.guild.ownerId) {
      return interaction.reply({ content: "You cannot issue a warning to that account.", flags: MessageFlags.Ephemeral });
    }
    const warningTarget = await interaction.guild.members.fetch(memberUser.id).catch(() => null);
    if (!warningTarget) {
      return interaction.reply({ content: "Warnings can only be issued to current server members.", flags: MessageFlags.Ephemeral });
    }
    if (interaction.guild.ownerId !== interaction.user.id &&
        interaction.member.roles.highest.comparePositionTo(warningTarget.roles.highest) <= 0) {
      return interaction.reply({ content: "You can only warn members whose highest role is below yours.", flags: MessageFlags.Ephemeral });
    }
    const list = getWarnings(config, interaction.guild.id, memberUser.id);
    const entry = { reason, moderatorId: interaction.user.id, at: new Date().toISOString() };
    list.push(entry);
    guildData.warnings[memberUser.id] = list;
    writeConfig(config);
    await sendModerationLog(interaction.guild, "୨୧ Member warned", "**Member:** " + memberUser.toString() + "\n**Moderator:** " + interaction.user.toString() + "\n**Reason:** " + reason + "\n**Warnings on record:** " + list.length, 0xE9D6A5);
    return interaction.reply({ content: "୨୧ Warning recorded for " + memberUser.toString() + ". They now have **" + list.length + "** warning(s) on record.", flags: MessageFlags.Ephemeral });
  }

  if (command === "warnings" || command === "clearwarnings") {
    const list = getWarnings(config, interaction.guild.id, memberUser.id);
    if (command === "warnings") {
      if (!list.length) return interaction.reply({ content: "୨୧ No warnings are recorded for " + memberUser.toString() + ".", flags: MessageFlags.Ephemeral });
      const description = list.slice(-10).map((entry, index) =>
        "**" + (index + 1) + ".** " + entry.reason + "\nModerator: <@" + entry.moderatorId + "> • <t:" + Math.floor(new Date(entry.at).getTime() / 1000) + ":R>"
      ).join("\n\n");
      const embed = new EmbedBuilder().setColor(purple).setTitle("୨୧ Warning history: " + memberUser.username)
        .setDescription(description).setFooter({ text: list.length + " warning(s) on record; showing the latest 10" });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "You need Moderate Members permission to clear warnings.", flags: MessageFlags.Ephemeral });
    }
    delete guildData.warnings[memberUser.id];
    writeConfig(config);
    await sendModerationLog(interaction.guild, "୨୧ Warning history cleared", "**Member:** " + memberUser.toString() + "\n**Moderator:** " + interaction.user.toString());
    return interaction.reply({ content: "୨୧ Cleared the warning history for " + memberUser.toString() + ".", flags: MessageFlags.Ephemeral });
  }

  const target = memberUser ? await interaction.guild.members.fetch(memberUser.id).catch(() => null) : null;
  if (["timeout", "untimeout", "kick", "ban"].includes(command) && !target) {
    return interaction.reply({ content: "I couldn't find that member in this server.", flags: MessageFlags.Ephemeral });
  }
  if (target && (target.id === interaction.user.id || target.id === client.user.id || target.id === interaction.guild.ownerId)) {
    return interaction.reply({ content: "That member cannot be targeted with this command.", flags: MessageFlags.Ephemeral });
  }
  if (target && interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0 && interaction.guild.ownerId !== interaction.user.id) {
    return interaction.reply({ content: "You can only moderate members whose highest role is below yours.", flags: MessageFlags.Ephemeral });
  }

  try {
    if (command === "timeout") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) throw new Error("You need Moderate Members permission.");
      const minutes = interaction.options.getInteger("minutes");
      await target.timeout(minutes * 60 * 1000, reason);
      await sendModerationLog(interaction.guild, "୨୧ Member timed out", "**Member:** " + memberUser.toString() + "\n**Moderator:** " + interaction.user.toString() + "\n**Duration:** " + minutes + " minutes\n**Reason:** " + reason, 0xE9D6A5);
      return interaction.reply({ content: "୨୧ Timed out " + memberUser.toString() + " for **" + minutes + " minutes**.", flags: MessageFlags.Ephemeral });
    }
    if (command === "untimeout") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) throw new Error("You need Moderate Members permission.");
      await target.timeout(null, reason);
      await sendModerationLog(interaction.guild, "୨୧ Timeout removed", "**Member:** " + memberUser.toString() + "\n**Moderator:** " + interaction.user.toString() + "\n**Reason:** " + reason);
      return interaction.reply({ content: "୨୧ Removed the timeout for " + memberUser.toString() + ".", flags: MessageFlags.Ephemeral });
    }
    if (command === "kick") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) throw new Error("You need Kick Members permission.");
      await target.kick(reason);
      await sendModerationLog(interaction.guild, "୨୧ Member kicked", "**Member:** " + memberUser.tag + "\n**Moderator:** " + interaction.user.toString() + "\n**Reason:** " + reason, 0xD98B8B);
      return interaction.reply({ content: "୨୧ Kicked **" + memberUser.tag + "**.", flags: MessageFlags.Ephemeral });
    }
    if (command === "ban") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) throw new Error("You need Ban Members permission.");
      await interaction.guild.members.ban(memberUser.id, { reason });
      await sendModerationLog(interaction.guild, "୨୧ Member banned", "**Member:** " + memberUser.tag + "\n**Moderator:** " + interaction.user.toString() + "\n**Reason:** " + reason, 0xD98B8B);
      return interaction.reply({ content: "୨୧ Banned **" + memberUser.tag + "**.", flags: MessageFlags.Ephemeral });
    }
    if (command === "clear") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) throw new Error("You need Manage Messages permission.");
      const amount = interaction.options.getInteger("amount");
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await sendModerationLog(interaction.guild, "୨୧ Messages cleared", "**Moderator:** " + interaction.user.toString() + "\n**Channel:** " + interaction.channel.toString() + "\n**Deleted:** " + deleted.size);
      return interaction.reply({ content: "୨୧ Deleted **" + deleted.size + "** recent messages. Messages older than 14 days cannot be bulk-deleted.", flags: MessageFlags.Ephemeral });
    }
    if (command === "lock" || command === "unlock") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) throw new Error("You need Manage Channels permission.");
      if (command === "unlock" && ["🎀・cosplay-showcase", "🎨・art-gallery", "📸・photography", "🧵・crafting-corner"].includes(interaction.channel.name)) {
        throw new Error("This is a role-gated gallery space. Use /setup to restore its intended posting permissions.");
      }
      const everyone = interaction.guild.roles.everyone;
      await interaction.channel.permissionOverwrites.edit(everyone, {
        SendMessages: command === "unlock" ? null : false,
        CreatePublicThreads: command === "unlock" ? null : false,
        CreatePrivateThreads: command === "unlock" ? null : false
      }, { reason: command === "lock" ? reason : "Channel unlocked by " + interaction.user.tag });
      await sendModerationLog(interaction.guild, command === "lock" ? "୨୧ Channel locked" : "୨୧ Channel unlocked", "**Moderator:** " + interaction.user.toString() + "\n**Channel:** " + interaction.channel.toString());
      return interaction.reply({ content: command === "lock" ? "୨୧ This channel is now locked for @everyone." : "୨୧ This channel has been unlocked for @everyone.", flags: MessageFlags.Ephemeral });
    }
    if (command === "slowmode") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) throw new Error("You need Manage Channels permission.");
      const seconds = interaction.options.getInteger("seconds");
      await interaction.channel.setRateLimitPerUser(seconds, "Slowmode set by " + interaction.user.tag);
      await sendModerationLog(interaction.guild, "୨୧ Slowmode updated", "**Moderator:** " + interaction.user.toString() + "\n**Channel:** " + interaction.channel.toString() + "\n**Slowmode:** " + seconds + " seconds");
      return interaction.reply({ content: "୨୧ Slowmode set to **" + seconds + " seconds**.", flags: MessageFlags.Ephemeral });
    }
  } catch (error) {
    return interaction.reply({ content: "I couldn't complete that action: " + error.message, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}

const setupCommand = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Set up the Atelier de Emi creative community.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

client.once("clientReady", async () => {
  console.log("Logged in as " + client.user.tag);
  try {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [setupCommand.toJSON(), ...moderationCommands]
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

  if (interaction.isChatInputCommand() && interaction.commandName !== "setup") {
    await handleModerationCommand(interaction);
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
    .setFooter({ text: "Atelier de Emi • made with love" })
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
