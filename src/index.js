require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
  Client, GatewayIntentBits, PermissionFlagsBits, ChannelType,
  EmbedBuilder, REST, Routes, SlashCommandBuilder, MessageFlags,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder
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
const writeConfig = (config) => {
  const tempPath = configPath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(config, null, 2));
  fs.renameSync(tempPath, configPath);
};
const pink = 0xF4B8CF;
const purple = 0xC9B6E4;

const welcomeEmbed = (guild) => new EmbedBuilder()
  .setColor(pink)
  .setTitle("୨୧ Welcome to the shrine!")
  .setDescription("Welcome to Atelier de Emi, the community from Emi Atelier. This is Emi's creative space for cosplay, art, photography, crafting and community.\n\nThe elegance and playful spirit of the Grand Narukami Shrine inspire the atmosphere, while Emi's creative journey and projects are at the heart of the atelier. Everyone is welcome to share their own creativity too. No Genshin knowledge required!")
  .setThumbnail(guild.iconURL({ size: 256 }))
  .setFooter({ text: "Atelier de Emi • made with love" })
  .setTimestamp();

const introductionEmbed = () => new EmbedBuilder()
  .setColor(pink)
  .setTitle("୨୧ A little introduction")
  .setDescription("We are happy you are here! Share as much or as little as you like. You can use these little prompts to get started:\n\n**♡ What should we call you?**\nA nickname is perfect — no need to share your real name.\n\n**♡ What do you enjoy creating?**\nCosplay, art, photography, crafting, writing, gaming, or something completely different?\n\n**♡ What are you working on lately?**\nA current project, a future dream, or just something you are excited about.\n\n**♡ What brought you to the atelier?**\nFriends, inspiration, creative support, or curiosity?\n\nNo pressure to answer everything. Be kind, say hello, and make yourself at home!")
  .setFooter({ text: "Atelier de Emi • every creator has a story ♡" });

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
    "**06 — Follow Emi's creative journey**\nVisit 📓・emi-updates for Emi Atelier project news and personal creative progress.\n\n" +
    "**07 — Share an idea or need help?**\nUse /suggest to share a community idea, visit 🆘・contact-staff to open a private conversation with staff, or use /report for a private concern. Never share passwords or sensitive personal information.\n\n**Help shape the community**\nUse /suggest to share an idea, /feedback to tell us what is working or could be better, or /bug-report to let the shrine team know when something is broken. Submissions go privately to staff.\n\n**A little note**\nAtelier de Emi is Emi's creative space, with a look and atmosphere inspired by Yae Miko and the Grand Narukami Shrine. Emi's projects and creative journey are part of its identity, while every member is encouraged to share their own work and interests. You do not need to know Genshin Impact to belong here."
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
    { name: "Community features", value: "`/prompt title theme description deadline` — publish a creative prompt\n`/spotlight member category link message` — celebrate a creator\n`/event-create` — schedule a community event\n`/event-cancel` — cancel a scheduled event", inline: false },
    { name: "Community support", value: "`/bug-report` — privately report a bot or server issue\n`/feedback` — privately share feedback about the community or bot\n`/report` — privately contact staff about a concern", inline: false },
    { name: "Information", value: "`/userinfo member` — view basic member information\n`/staffhelp` — show this guide", inline: false },
    { name: "Role permissions", value: "Shrine Maiden: warnings, warning history, timeouts, message clearing.\nSenior Shrine Maiden: all of the above plus kicks and community event management.\nGuuji: full administration, including bans and channel management.\nMiko Apprentice: staff spaces and guidance only; no moderation powers.", inline: false },
    { name: "Community feedback workflow", value: "Review bug reports and feedback in 🛠️・community-feedback. Acknowledge useful reports, reproduce issues where possible, record what happened and what changed, and keep private submissions within staff.", inline: false },
    { name: "Support conversations", value: "Members can open private tickets in 🆘・contact-staff. Use Claim conversation to take ownership, keep replies in the private channel, and use Close conversation when resolved. Closed conversations remain read-only for the member and are recorded in moderation logs.", inline: false },
    { name: "Staff expectations", value: "Keep reasons professional, do not share staff-only information, and escalate uncertain or serious cases to the Guuji. Never use moderation tools to settle personal disagreements.", inline: false }
  )
  .setFooter({ text: "Atelier de Emi • internal staff reference" });


const rolePlan = [
  // Staff roles are assigned manually to trusted people only.
  { name: "⛩️・Guuji", color: 0xE8A2C8, permissions: [PermissionFlagsBits.Administrator] },
  { name: "🌸・Senior Shrine Maiden", color: 0xE6A0B4, permissions: [
    PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.KickMembers, PermissionFlagsBits.ViewAuditLog, PermissionFlagsBits.ManageEvents
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
  { name: "🎉・Event Pings", color: 0xC8B6E8, mentionable: true, selfAssignable: true },
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
  { name: "💡・suggestions", topic: "Community ideas submitted through /suggest. React with 👍 to support an idea or 👎 if it is not a fit." },
  { name: "🆘・contact-staff", topic: "Need a hand? Open a private conversation with the shrine team here." },
  { name: "🌟・creator-spotlights", topic: "Community members and their creative work, celebrated by Emi Atelier and the Atelier de Emi team." },
  { name: "🎐・creative-prompts", topic: "Creative challenges and inspiration from Emi Atelier. Join in at your own pace and share your work in the gallery." },
  { name: "📓・emi-updates", topic: "Updates from Emi Atelier: personal cosplay projects, creative progress, plans and announcements from Emi." }
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

async function ensureStartHereLinks(channel, guild, channels) {
  const messages = await channel.messages.fetch({ limit: 30 }).catch(() => null);
  const existing = messages && messages.find(message =>
    message.author.id === client.user.id &&
    message.embeds.some(embed => embed.title === "୨୧ Your first steps at the shrine")
  );
  if (!existing) return;
  const links = [
    { label: "Read the rules", channel: channels["📜・rules"] },
    { label: "Choose roles", channel: channels["🎭・choose-roles"] },
    { label: "Say hello", channel: channels["🎀・introductions"] },
    { label: "Explore the gallery", channel: channels["🎀・cosplay-showcase"] }
  ].filter(item => item.channel);
  const row = new ActionRowBuilder().addComponents(links.map(item =>
    new ButtonBuilder()
      .setLabel(item.label)
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.com/channels/" + guild.id + "/" + item.channel.id)
  ));
  await existing.edit({ components: [row] });
}

async function ensureTicketPanel(channel) {
  const messages = await channel.messages.fetch({ limit: 30 }).catch(() => null);
  const existing = messages && messages.find(message =>
    message.author.id === client.user.id &&
    message.embeds.some(embed => embed.title === "୨୧ Contact the shrine team")
  );
  const embed = new EmbedBuilder()
    .setColor(purple)
    .setTitle("୨୧ Contact the shrine team")
    .setDescription("Need a little help? Open a private conversation with the shrine staff. Choose the option that best fits your request, and a private channel will be created for you and the team.\n\n**Please note:** Be respectful, share only information needed to explain the issue, and never post passwords or sensitive personal details.")
    .addFields(
      { name: "General help", value: "Questions about the community or finding your way around", inline: true },
      { name: "Member concern", value: "A private concern about another member or community safety", inline: true },
      { name: "Bot or server issue", value: "Something not working as expected", inline: true },
      { name: "Collaboration", value: "A community project or partnership enquiry", inline: true }
    )
    .setFooter({ text: "Atelier de Emi • we're happy to help ♡" });
  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_create")
    .setPlaceholder("Choose what you need help with…")
    .addOptions(
      { label: "General help", value: "General Help", description: "Questions about the community" },
      { label: "Member concern", value: "Member Concern", description: "A private member or safety concern" },
      { label: "Bot or server issue", value: "Bot or Server Issue", description: "Report something that is not working" },
      { label: "Collaboration", value: "Collaboration", description: "Discuss a community project or partnership" }
    );
  const row = new ActionRowBuilder().addComponents(menu);
  if (existing) await existing.edit({ embeds: [embed], components: [row] });
  else await channel.send({ embeds: [embed], components: [row] });
}

async function setupShrine(guild) {
  await guild.channels.fetch();
  await guild.roles.fetch();
  // Remove the retired private beta spaces and role during an ordinary setup update.
  for (const legacyName of ["🧪・tester-guide", "🧪・tester-lounge", "🧪・tester-feedback"]) {
    const legacy = guild.channels.cache.find(item => item.name === legacyName);
    if (legacy) await legacy.delete("Retiring the separate tester programme");
  }
  const legacyTesterRole = guild.roles.cache.find(role => role.name === "🧪・Shrine Tester");
  if (legacyTesterRole && legacyTesterRole.editable) await legacyTesterRole.delete("Retiring the separate tester programme");

  const mainCategory = await ensureCategory(guild, "⛩️・THE SHRINE");
  const communityCategory = await ensureCategory(guild, "🏮・COMMUNITY HALL");
  const creatorCategory = await ensureCategory(guild, "🎐・CREATOR'S CORNER");
  const galleryCategory = await ensureCategory(guild, "🎨・COMMUNITY GALLERY");
  const staffCategory = await ensureCategory(guild, "🏯・SHRINE STAFF", [{
    id: guild.roles.everyone.id,
    deny: [PermissionFlagsBits.ViewChannel]
  }, {
    id: client.user.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
  }]);

  for (const info of rolePlan) await ensureRole(guild, info);
  const botMember = await guild.members.fetch(client.user.id);
  const botHighestRole = botMember.roles.highest;
  if (botHighestRole.position <= rolePlan.length) {
    throw new Error("Move Shrine Assistant's bot role higher in Server Settings → Roles before running setup.");
  }
  await guild.roles.setPositions(rolePlan.map((info, index) => ({
    role: guild.roles.cache.find(role => role.name === info.name).id,
    position: botHighestRole.position - 1 - index
  })));

  const channels = {};
  const communityChannels = ["💬・general", "🎀・introductions", "🤖・bot-commands", "🆘・contact-staff"];
  const creatorChannels = ["🌟・creator-spotlights", "🎐・creative-prompts", "📓・emi-updates"];
  for (const info of channelPlan) {
    const category = communityChannels.includes(info.name) ? communityCategory
      : creatorChannels.includes(info.name) ? creatorCategory : mainCategory;
    const readOnly = ["🌸・welcome", "📜・rules", "📢・announcements", "🎭・choose-roles", "🆘・contact-staff", ...creatorChannels].includes(info.name);
    const overwrites = standardChannelPermissions(guild, readOnly ? "readOnly" : "chat");
    if (["📢・announcements", ...creatorChannels].includes(info.name)) {
      for (const roleName of ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"]) {
        const staffRole = guild.roles.cache.find(role => role.name === roleName);
        if (staffRole) overwrites.push({
          id: staffRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles]
        });
      }
    }
    channels[info.name] = await ensureChannel(guild, category, info, overwrites);
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



  channels[moderationLogName] = await ensureChannel(guild, staffCategory, {
    name: moderationLogName,
    topic: "Private audit trail for moderation actions taken by Shrine Assistant."
  }, staffReadOnlyPermissions(guild, ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"]));

  channels["💡・suggestions"] = await ensureChannel(guild, communityCategory, { name: "💡・suggestions", topic: "Community ideas submitted through /suggest. React with 👍 to support an idea or 👎 if it is not a fit." }, standardChannelPermissions(guild, "readOnly"));
  channels["💬・gallery-chat"] = await ensureChannel(guild, galleryCategory, {
    name: "💬・gallery-chat",
    topic: "Chat about gallery posts, share ideas, and give creators encouragement."
  }, standardChannelPermissions(guild, "chat"));

  const staffChannels = [
    { name: "📖・staff-command-guide", topic: "Private reference for Shrine Assistant staff commands and moderation expectations.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden", "🪷・Miko Apprentice"] },
    { name: "📨・member-reports", topic: "Private reports and support requests submitted to Shrine Assistant.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"] },
    { name: "🛠️・community-feedback", topic: "Private bug reports and community feedback submitted through Shrine Assistant.", roles: ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"] },
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
  await ensureStartHereLinks(channels["🌱・start-here"], guild, channels);
  await ensureEmbed(channels["🌸・welcome"], "୨୧ Welcome to the shrine!", welcomeEmbed(guild));
  await ensureEmbed(channels["🎀・introductions"], "୨୧ A little introduction", introductionEmbed());
  await ensureEmbed(channels["📜・rules"], "୨୧ Shrine guidelines", rulesEmbed());
  await ensureEmbed(channels["📖・staff-command-guide"], "୨୧ Shrine Assistant — staff command guide", staffGuideEmbed());
  await ensureRolePanel(channels["🎭・choose-roles"]);
  await ensureTicketPanel(channels["🆘・contact-staff"]);

  const config = readConfig();
  config[guild.id] = {
    ...(config[guild.id] || {}),
    categoryId: mainCategory.id,
    communityCategoryId: communityCategory.id,
    creatorCategoryId: creatorCategory.id,
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
  new SlashCommandBuilder().setName("bug-report").setDescription("Privately report a Shrine Assistant or server issue.")
    .addStringOption(o => o.setName("area").setDescription("Where did it happen? e.g. /setup, roles, welcome").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("details").setDescription("What happened, and what did you expect?").setMaxLength(1500).setRequired(true))
    .addStringOption(o => o.setName("steps").setDescription("Optional steps to reproduce the issue").setMaxLength(1000).setRequired(false))
    .addStringOption(o => o.setName("severity").setDescription("How much does this affect the experience?").addChoices(
      { name: "Low — minor issue", value: "Low" },
      { name: "Normal — feature partly affected", value: "Normal" },
      { name: "High — blocks a core feature", value: "High" }
    ).setRequired(true)),
  new SlashCommandBuilder().setName("feedback").setDescription("Privately share feedback about the server or bot.")
    .addStringOption(o => o.setName("topic").setDescription("What is your feedback about?").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("details").setDescription("What works well, or what could be better?").setMaxLength(1500).setRequired(true)),
  new SlashCommandBuilder().setName("icebreaker").setDescription("Share a fun conversation starter in the community."),
  new SlashCommandBuilder().setName("event-create").setDescription("Create a community event (staff only).")
    .addStringOption(o => o.setName("title").setDescription("Name of the event").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("start").setDescription("Start date and time in ISO 8601 format, e.g. 2026-12-01T18:00:00+01:00").setRequired(true))
    .addIntegerOption(o => o.setName("duration").setDescription("Duration in minutes (15–1440)").setMinValue(15).setMaxValue(1440).setRequired(true))
    .addStringOption(o => o.setName("location").setDescription("Where the event takes place (online or venue)").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("description").setDescription("What members can expect").setMaxLength(1000).setRequired(false)),
  new SlashCommandBuilder().setName("events").setDescription("See upcoming Atelier de Emi community events."),
  new SlashCommandBuilder().setName("event-cancel").setDescription("Cancel a scheduled community event (staff only).")
    .addStringOption(o => o.setName("event_id").setDescription("ID shown by /events").setMaxLength(25).setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Why the event is being cancelled").setMaxLength(300).setRequired(false)),
  new SlashCommandBuilder().setName("prompt").setDescription("Publish a creative prompt for the community (staff only).")
    .addStringOption(o => o.setName("title").setDescription("Short name for the prompt").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("theme").setDescription("Cosplay, art, photography, crafting or anything goes").setMaxLength(80).setRequired(true))
    .addStringOption(o => o.setName("description").setDescription("What should members create or try?").setMaxLength(1200).setRequired(true))
    .addStringOption(o => o.setName("deadline").setDescription("Optional deadline, e.g. 15 December or no deadline").setMaxLength(80).setRequired(false)),
  new SlashCommandBuilder().setName("emi-update").setDescription("Share an update from Emi Atelier (creator only).")
    .addStringOption(o => o.setName("title").setDescription("Update title").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("update").setDescription("Project progress, plans or news").setMaxLength(1800).setRequired(true))
    .addStringOption(o => o.setName("link").setDescription("Optional HTTPS link to photos or a project page").setMaxLength(500).setRequired(false)),
  new SlashCommandBuilder().setName("project-update").setDescription("Share a progress update on your creative project.")
    .addStringOption(o => o.setName("project").setDescription("Project name").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("progress").setDescription("What have you worked on or learned?").setMaxLength(1200).setRequired(true))
    .addStringOption(o => o.setName("link").setDescription("Optional HTTPS link to a photo or project").setMaxLength(500).setRequired(false)),
  new SlashCommandBuilder().setName("feedback-request").setDescription("Ask the community for feedback on a creative project.")
    .addStringOption(o => o.setName("project").setDescription("Project name").setMaxLength(100).setRequired(true))
    .addStringOption(o => o.setName("question").setDescription("What feedback would help you?").setMaxLength(800).setRequired(true))
    .addStringOption(o => o.setName("link").setDescription("Optional HTTPS link to your work").setMaxLength(500).setRequired(false)),
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
  new SlashCommandBuilder().setName("creators").setDescription("Browse members who have shared a creator profile.")
    .addIntegerOption(o => o.setName("page").setDescription("Page of creator profiles to view").setMinValue(1).setMaxValue(1000).setRequired(false)),
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

  if (command === "emi-update") {
    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ content: "Only the server owner can publish official Emi Atelier creator updates.", flags: MessageFlags.Ephemeral });
    }
    const title = interaction.options.getString("title", true);
    const update = interaction.options.getString("update", true);
    const link = interaction.options.getString("link");
    let parsed;
    if (link) {
      try { parsed = new URL(link); } catch {}
      if (!parsed || parsed.protocol !== "https:") return interaction.reply({ content: "Please provide a valid HTTPS link.", flags: MessageFlags.Ephemeral });
    }
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "📓・emi-updates");
    if (!channel) return interaction.reply({ content: "The Emi updates channel isn't set up yet. Ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ From Emi Atelier: " + title)
      .setDescription(update)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "Emi Atelier • creator updates from the heart of the atelier ♡" })
      .setTimestamp();
    if (link) embed.addFields({ name: "More to explore", value: "[Open project link](" + link + ")" });
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "୨୧ Your Emi Atelier update has been published in 📓・emi-updates!", flags: MessageFlags.Ephemeral });
  }

  if (command === "project-update") {
    const project = interaction.options.getString("project", true);
    const progress = interaction.options.getString("progress", true);
    const link = interaction.options.getString("link");
    let parsed;
    if (link) {
      try { parsed = new URL(link); } catch {}
      if (!parsed || parsed.protocol !== "https:") return interaction.reply({ content: "Please provide a valid HTTPS link.", flags: MessageFlags.Ephemeral });
    }
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "💬・gallery-chat");
    if (!channel) return interaction.reply({ content: "The gallery chat isn't set up yet. Ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(purple).setTitle("୨୧ Project journal: " + project)
      .setDescription(progress)
      .addFields({ name: "Creator", value: interaction.user.toString() })
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "Atelier de Emi • every little step counts ♡" })
      .setTimestamp();
    if (link) embed.addFields({ name: "Project link", value: "[Take a look](" + link + ")" });
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "୨୧ Your project update has been shared in 💬・gallery-chat!", flags: MessageFlags.Ephemeral });
  }

  if (command === "feedback-request") {
    const project = interaction.options.getString("project", true);
    const question = interaction.options.getString("question", true);
    const link = interaction.options.getString("link");
    let parsed;
    if (link) {
      try { parsed = new URL(link); } catch {}
      if (!parsed || parsed.protocol !== "https:") return interaction.reply({ content: "Please provide a valid HTTPS link.", flags: MessageFlags.Ephemeral });
    }
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "💬・gallery-chat");
    if (!channel) return interaction.reply({ content: "The gallery chat isn't set up yet. Ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Feedback requested: " + project)
      .setDescription(question)
      .addFields({ name: "Creator", value: interaction.user.toString() })
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "Atelier de Emi • kind, constructive feedback only ♡" })
      .setTimestamp();
    if (link) embed.addFields({ name: "View the project", value: "[Take a look](" + link + ")" });
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "୨୧ Your feedback request has been shared in 💬・gallery-chat!", flags: MessageFlags.Ephemeral });
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
    const sorted = Object.entries(profiles).sort((a, b) =>
      new Date(b[1].updatedAt || 0).getTime() - new Date(a[1].updatedAt || 0).getTime()
    );
    if (!sorted.length) return interaction.reply({ content: "No creator profiles have been shared yet. Be the first with /profile-set!", flags: MessageFlags.Ephemeral });
    const page = interaction.options.getInteger("page") || 1;
    const pageSize = 10;
    const pageEntries = sorted.slice((page - 1) * pageSize, page * pageSize);
    if (!pageEntries.length) {
      const lastPage = Math.max(1, Math.ceil(sorted.length / pageSize));
      return interaction.reply({ content: "There aren't that many pages yet. There are currently **" + sorted.length + "** creator profiles across **" + lastPage + "** page(s).", flags: MessageFlags.Ephemeral });
    }
    const lines = [];
    for (const [userId, profile] of pageEntries) {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) continue;
      lines.push("**" + member.displayName + "** — " + profile.interests + "\n" + profile.about.slice(0, 180) + "\nUse /profile-view and choose this creator to see their full profile.");
    }
    if (!lines.length) return interaction.reply({ content: "There are no currently available creator profiles on this page.", flags: MessageFlags.Ephemeral });
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const embed = new EmbedBuilder().setColor(purple).setTitle("୨୧ Meet the creators of Atelier de Emi")
      .setDescription(lines.join("\n\n"))
      .setFooter({ text: "Page " + page + " of " + totalPages + " • " + sorted.length + " shared profiles • use /creators page:N to browse ♡" });
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
        (event.entityMetadata?.location || "Location to be announced") + "\n[View event](" + event.url + ") • ID: `" + event.id + "`"
      ).join("\n\n"))
      .setFooter({ text: "Open an event to mark yourself as interested ♡" });
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  if (command === "event-cancel") {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({ content: "Only event managers and shrine staff can cancel community events.", flags: MessageFlags.Ephemeral });
    }
    const eventId = interaction.options.getString("event_id", true).trim();
    const reason = interaction.options.getString("reason") || "Cancelled by " + interaction.user.tag;
    if (!/^\d{17,20}$/.test(eventId)) {
      return interaction.reply({ content: "Please provide the numeric event ID shown by /events.", flags: MessageFlags.Ephemeral });
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const event = await interaction.guild.scheduledEvents.fetch(eventId).catch(() => null);
      if (!event) return interaction.editReply("I couldn't find that scheduled event. It may already have ended or been removed.");
      const eventName = event.name;
      await event.delete(reason);
      await sendModerationLog(interaction.guild, "୨୧ Community event cancelled", "**Event:** " + eventName + "\n**Event ID:** " + eventId + "\n**Cancelled by:** " + interaction.user.toString() + "\n**Reason:** " + reason, 0xD98B8B);
      return interaction.editReply("୨୧ **" + eventName + "** has been cancelled and removed from the server's event list.");
    } catch (error) {
      console.error("Event cancellation failed:", error);
      return interaction.editReply("I couldn't cancel that event. Please check my Manage Events permission and try again.");
    }
  }

  if (command === "help") {
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ Shrine Assistant — help")
      .setDescription("Hello! I help keep Atelier de Emi organised and welcoming.")
      .addFields(
        { name: "Emi Atelier", value: "`/emi-update` — publish a creator update (owner only)", inline: false },
        { name: "Community", value: "`/suggest` — send an idea to the team\n`/report` — privately contact shrine staff\n`🆘・contact-staff` — open a private support conversation\n`/bug-report` — privately report a bot/server issue\n`/feedback` — privately share community feedback\n`/icebreaker` — post a fun conversation starter\n`/serverinfo` — learn about this community\n`/events` — see upcoming community events (includes event IDs for staff)\n`/project-update project progress link` — share your creative progress\n`/feedback-request project question link` — ask for constructive feedback\n`/kudos member message` — appreciate a fellow creator\n`/profile-set` — create or update your creator profile\n`/profile-view` — view a creator profile\n`/profile-clear` — remove your profile\n`/creators page` — browse shared creator profiles\n`/userinfo` — view member information", inline: false },
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
    const suggestionMessage = await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    await suggestionMessage.react("👍").catch(() => {});
    await suggestionMessage.react("👎").catch(() => {});
    return interaction.reply({ content: "Thank you! Your idea has been shared in 💡・suggestions. Members can react with 👍 or 👎 to give feedback.", flags: MessageFlags.Ephemeral });
  }

  if (command === "icebreaker") {
    const prompts = [
      "What is one creative skill you would love to learn this year?",
      "If you could bring any character to life as a cosplay, who would you choose?",
      "What is your favourite little detail in something you have made?",
      "What music, show, or game has been inspiring you lately?",
      "Would you rather spend a day sewing, painting, photographing, or crafting props?",
      "What is one project idea you keep coming back to?",
      "What is a small creative win you are proud of?",
      "If you could collaborate with any creator, what would you make together?"
    ];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "💬・general");
    if (!channel) return interaction.reply({ content: "The community chat is not set up yet. Ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ A little conversation starter").setDescription(prompt).setFooter({ text: "Atelier de Emi • join in whenever you like ♡" });
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({ content: "A conversation starter has been posted in 💬・general!", flags: MessageFlags.Ephemeral });
  }

  if (command === "bug-report" || command === "feedback") {
    const channel = interaction.guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === "🛠️・community-feedback");
    if (!channel) return interaction.reply({ content: "The private community-feedback channel is not set up yet. Please ask an admin to run /setup.", flags: MessageFlags.Ephemeral });
    let embed;
    if (command === "bug-report") {
      const area = interaction.options.getString("area", true);
      const details = interaction.options.getString("details", true);
      const steps = interaction.options.getString("steps");
      const severity = interaction.options.getString("severity", true);
      embed = new EmbedBuilder()
        .setColor(severity === "High" ? 0xD98B8B : severity === "Normal" ? 0xE9D6A5 : purple)
        .setTitle("୨୧ Shrine Assistant issue report")
        .setDescription(details)
        .addFields(
          { name: "Area", value: area, inline: true },
          { name: "Impact", value: severity, inline: true },
          { name: "Submitted by", value: interaction.user.tag + " (" + interaction.user.id + ")" }
        )
        .setTimestamp();
      if (steps) embed.addFields({ name: "Steps to reproduce", value: steps });
    } else {
      const topic = interaction.options.getString("topic", true);
      const details = interaction.options.getString("details", true);
      embed = new EmbedBuilder()
        .setColor(pink)
        .setTitle("୨୧ Community feedback: " + topic)
        .setDescription(details)
        .addFields({ name: "Submitted by", value: interaction.user.tag + " (" + interaction.user.id + ")" })
        .setTimestamp();
    }
    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return interaction.reply({
      content: command === "bug-report"
        ? "Thank you! Your bug report has been sent privately to the shrine team."
        : "Thank you! Your feedback has been sent privately to the shrine team.",
      flags: MessageFlags.Ephemeral
    });
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

async function resetShrine(guild) {
  await guild.channels.fetch();
  await guild.roles.fetch();
  const botMember = await guild.members.fetch(client.user.id);
  const preservedRoleIds = new Set([guild.roles.everyone.id, ...botMember.roles.cache.map(role => role.id)]);
  const channels = [...guild.channels.cache.values()].sort((a, b) => Number(a.type === ChannelType.GuildCategory) - Number(b.type === ChannelType.GuildCategory));
  for (const channel of channels) await channel.delete("Fresh Atelier de Emi setup reset");
  const roles = [...guild.roles.cache.values()].filter(role => !preservedRoleIds.has(role.id) && role.name !== "new role" && !role.managed).sort((a, b) => b.position - a.position);
  for (const role of roles) {
    if (!role.editable) throw new Error("I cannot delete the role " + role.name + ". Move the Shrine Assistant bot role above it, then try again.");
    await role.delete("Fresh Atelier de Emi setup reset");
  }
  await setupShrine(guild);
}
const setupCommand = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Rebuild the Atelier de Emi server from a clean slate.")
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
  if (interaction.isButton() && (interaction.customId.startsWith("setup_reset_") || interaction.customId.startsWith("setup_update:"))) {
    const isUpdate = interaction.customId.startsWith("setup_update:");
    const [action, ownerId] = isUpdate ? ["update", interaction.customId.split(":")[1]] : interaction.customId.replace("setup_reset_", "").split(":");
    if (interaction.user.id !== ownerId) return interaction.reply({ content: "Only the administrator who started setup can use these buttons.", flags: MessageFlags.Ephemeral });
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "You need Administrator permission to run setup.", flags: MessageFlags.Ephemeral });
    if (action === "cancel") return interaction.update({ content: "୨୧ Setup cancelled. Nothing in the server was changed.", components: [] });
    const freshReset = action === "confirm";
    await interaction.update({ content: freshReset ? "୨୧ Fresh shrine reset started. I am rebuilding channels and roles now…" : "୨୧ Setup update started. I am checking channels, roles and permissions…", components: [] });
    try {
      if (freshReset) await resetShrine(interaction.guild);
      else await setupShrine(interaction.guild);
      await interaction.editReply({ content: freshReset ? "୨୧ Fresh setup complete! Your categories, channels, roles, permissions and welcome panels are ready." : "୨୧ Setup update complete! Existing channels and messages have been kept.", components: [] });
    } catch (error) {
      console.error("Setup failed:", error);
      await interaction.editReply({ content: "Setup stopped partway through: " + error.message + ". Check the bot permissions and role hierarchy, then send me the PowerShell error.", components: [] }).catch(() => {});
    }
    return;
  }

  if (interaction.isButton() && interaction.customId === "ticket_claim") {
    if (!interaction.inGuild() || !interaction.channel) return;
    const staffNames = ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"];
    const isStaff = interaction.member.roles.cache.some(role => staffNames.includes(role.name));
    if (!isStaff) return interaction.reply({ content: "Only shrine staff can claim a support conversation.", flags: MessageFlags.Ephemeral });
    const topic = interaction.channel.topic || "";
    if (!topic.includes("Status: open")) return interaction.reply({ content: "This conversation is not open.", flags: MessageFlags.Ephemeral });
    if (topic.includes("Claimed by:")) return interaction.reply({ content: "This conversation has already been claimed.", flags: MessageFlags.Ephemeral });
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await interaction.channel.setTopic(topic + " | Claimed by: " + interaction.user.id);
    await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(purple).setTitle("୨୧ Conversation claimed").setDescription(interaction.user.toString() + " is now looking after this request.").setTimestamp()], allowedMentions: { users: [interaction.user.id] } });
    await sendModerationLog(interaction.guild, "୨୧ Support conversation claimed", "**Channel:** " + interaction.channel.toString() + "\n**Claimed by:** " + interaction.user.toString());
    return interaction.editReply("୨୧ You've claimed this support conversation.");
  }

  if (interaction.isButton() && interaction.customId === "ticket_close") {
    if (!interaction.inGuild() || !interaction.channel) return;
    const topic = interaction.channel.topic || "";
    const ownerMatch = topic.match(/Ticket owner: (\d+)/);
    if (!ownerMatch) return interaction.reply({ content: "I couldn't verify who opened this ticket. Please contact staff.", flags: MessageFlags.Ephemeral });
    const ownerId = ownerMatch[1];
    const staffNames = ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"];
    const isStaff = interaction.member.roles.cache.some(role => staffNames.includes(role.name));
    if (interaction.user.id !== ownerId && !isStaff) {
      return interaction.reply({ content: "Only the person who opened this ticket or shrine staff can close it.", flags: MessageFlags.Ephemeral });
    }
    if (topic.includes("Status: closed")) {
      return interaction.reply({ content: "This ticket is already closed.", flags: MessageFlags.Ephemeral });
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const owner = await interaction.guild.members.fetch(ownerId).catch(() => null);
    if (owner) {
      await interaction.channel.permissionOverwrites.edit(owner, {
        ViewChannel: true, ReadMessageHistory: true, SendMessages: false, AttachFiles: false
      });
    }
    await interaction.channel.setTopic(topic.replace("Status: open", "Status: closed"));
    await interaction.channel.setName(("closed-" + interaction.channel.name).slice(0, 100));
    await interaction.channel.send({
      embeds: [new EmbedBuilder().setColor(purple).setTitle("୨୧ Ticket closed")
        .setDescription("This support conversation has been closed. The channel remains available as a read-only record for you and the shrine team.")
        .setTimestamp()],
      allowedMentions: { parse: [] }
    });
    await sendModerationLog(interaction.guild, "୨୧ Support conversation closed", "**Channel:** " + interaction.channel.toString() + "\n**Closed by:** " + interaction.user.toString() + "\n**Ticket owner:** <@" + ownerId + ">");
    await interaction.editReply("୨୧ Ticket closed. Thank you for reaching out!");
    return;
  }

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

  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_create") {
    if (!interaction.inGuild()) return interaction.reply({ content: "Tickets can only be opened inside the server.", flags: MessageFlags.Ephemeral });
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
    const guild = interaction.guild;
    const existing = guild.channels.cache.find(channel =>
      channel.type === ChannelType.GuildText &&
      channel.topic?.includes("Ticket owner: " + interaction.user.id) &&
      channel.topic.includes("Status: open")
    );
    if (existing) {
      return interaction.editReply("You already have an open support conversation: " + existing.toString() + ". Please continue there or close it before opening another.");
    }
    const category = guild.channels.cache.find(channel => channel.type === ChannelType.GuildCategory && channel.name === "🏯・SHRINE STAFF");
    if (!category) return interaction.editReply("The staff area is not set up yet. Please ask an administrator to run /setup.");
    const kind = interaction.values[0];
    const staffNames = ["⛩️・Guuji", "🌸・Senior Shrine Maiden", "🦊・Shrine Maiden"];
    const overwrites = [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] },
      { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.EmbedLinks] }
    ];
    for (const roleName of staffNames) {
      const role = guild.roles.cache.find(item => item.name === roleName);
      if (role) overwrites.push({ id: role.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] });
    }
    const slug = interaction.user.username.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 35) || "member";
    const channel = await guild.channels.create({
      name: ("ticket-" + slug).slice(0, 90),
      type: ChannelType.GuildText,
      parent: category.id,
      topic: "Ticket owner: " + interaction.user.id + " | Category: " + kind + " | Status: open",
      permissionOverwrites: overwrites
    });
    const embed = new EmbedBuilder().setColor(pink).setTitle("୨୧ " + kind)
      .setDescription("Hello " + interaction.user.toString() + "! A member of the shrine team will be with you as soon as possible. Please explain what you need help with below.\n\n**A few reminders**\n• Keep the conversation respectful.\n• Do not share passwords or sensitive personal information.\n• For a member concern, share only the details staff need to look into it.")
      .addFields({ name: "Opened by", value: interaction.user.toString(), inline: true }, { name: "Request type", value: kind, inline: true })
      .setFooter({ text: "Atelier de Emi • private support conversation ♡" }).setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ticket_claim").setLabel("Claim conversation").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("ticket_close").setLabel("Close conversation").setStyle(ButtonStyle.Secondary)
    );
    await channel.send({ content: interaction.user.toString() + " • " + staffNames.map(name => guild.roles.cache.find(role => role.name === name)).filter(Boolean).map(role => role.toString()).join(" "), embeds: [embed], components: [row], allowedMentions: { users: [interaction.user.id], roles: [] } });
    await sendModerationLog(guild, "୨୧ Support conversation opened", "**Channel:** " + channel.toString() + "\n**Opened by:** " + interaction.user.toString() + "\n**Category:** " + kind);
    return interaction.editReply("୨୧ Your private support conversation is ready: " + channel.toString());
    } catch (error) {
      console.error("Could not create support ticket:", error);
      return interaction.editReply("I could not open your support conversation just now. Please try again or contact a shrine staff member.").catch(() => {});
    }
  }

  if (interaction.isChatInputCommand() && interaction.commandName !== "setup") {
    try {
      await handleModerationCommand(interaction);
    } catch (error) {
      console.error("Command failed (" + interaction.commandName + "):", error);
      const response = { content: "I couldn't complete that command just now. Please try again, and contact shrine staff if the problem continues.", flags: MessageFlags.Ephemeral };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(response).catch(() => {});
      } else {
        await interaction.reply(response).catch(() => {});
      }
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
  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("setup_reset_confirm:" + interaction.user.id).setLabel("Fresh reset (delete everything)").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("setup_update:" + interaction.user.id).setLabel("Update (keep existing content)").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("setup_reset_cancel:" + interaction.user.id).setLabel("Cancel").setStyle(ButtonStyle.Secondary)
  );
  return interaction.reply({
    content: "୨୧ **Atelier de Emi setup**\n\nChoose **Fresh reset** to permanently delete all channels and categories, plus every role except @everyone, Shrine Assistant bot-assigned roles, managed integration roles, and the lowercase new role. Messages, forum posts and member role assignments will be lost.\n\nChoose **Update** to create or move the planned channels and update roles and permissions without deleting existing content.",
    components: [confirmRow],
    flags: MessageFlags.Ephemeral
  });
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
