# Shrine Assistant — Emi Atelier

Shrine Assistant is the Discord bot for **Emi Atelier**, a creator community for cosplay, art, photography, crafting and other creative interests. The server's atmosphere is inspired by Yae Miko and the Grand Narukami Shrine, but no Genshin Impact knowledge is needed to join.

## What the bot does

### Server setup and onboarding
- `/setup` creates or updates the planned server categories, channels, roles, permissions and information panels.
- `/onboarding-setup` configures Discord's native Community Onboarding with seven default channels, creative-interest choices that assign matching roles and gallery access, and optional announcement/event notification roles. It requires Manage Server and Manage Roles for both the administrator running it and the bot.
- `/language` lets each member choose English or Nederlands for supported personal Shrine Assistant replies and information embeds. English is the default for everyone; each member's preference is saved separately in `config.json` and does not change other members' experience. Shared server posts remain English-first, user-submitted text is not translated, and slash-command names and option descriptions remain in English.
- `/setup` also assigns the native Community Rules channel, Community Updates and Safety Alerts channels, system welcome channel, and server description. The rules channel is `📜・rules`; Community Updates and Safety Alerts both go to the private `🔒・guuji-office`; the system channel is `🌸・welcome`.
- `📢・announcements` is created as a native Discord Announcement channel. If an older regular text channel already has that name, `/setup` renames it to `📢・announcements-archive` to preserve its message history, then creates the native Announcement channel.
- The **Update** option preserves existing channels and messages while creating missing items and refreshing planned permissions and bot panels. It also refreshes legacy `Atelier de Emi` branding in the bot's 100 most recent messages per text and announcement channel, without editing member-authored messages.
- The **Fresh reset** option is destructive: it deletes server channels and categories and most non-managed roles before rebuilding the layout. Do not use it unless you intentionally want to wipe existing server content.
- New members receive a custom welcome embed in `🌸・welcome`; departures receive a matching farewell embed in the same channel.
- Shrine Assistant assigns `✨・Shrine Visitor` only after Discord marks the member as having completed native onboarding (`CompletedOnboarding`). It checks the member-update event and does not grant the role immediately on join. The bot needs Manage Roles, and its role must sit above `✨・Shrine Visitor`.
- Discord's native onboarding is the primary newcomer flow; the role panel in `🎭・choose-roles` remains available for changing preferences later.
- The start-here guide links members to rules, introductions and the gallery. English is the primary language for shared server content; members can switch their personal Shrine Assistant replies to Dutch with `/language`.

### Creator community
- Creator profiles: `/profile-set`, `/profile-view`, `/profile-clear`, and paginated `/creators`.
- Project journals and feedback requests: `/project-update` and `/feedback-request`.
- Community appreciation: `/kudos` and staff-published `/spotlight`.
- Staff can publish creative challenges with `/prompt`.
- The server owner can publish official Emi Atelier updates with `/emi-update`.
- Community events use Discord's native Scheduled Events: staff can create them with `/event-create`, members can browse with `/events`, and event managers can cancel them with `/event-cancel`.

### Community support
- Members can open a private staff conversation in `🆘・contact-staff`.
- Tickets support General Help, Member Concern, Bot or Server Issue, and Collaboration.
- Staff can claim conversations; the member or staff can close them. Closed tickets remain as read-only records.
- `/report`, `/bug-report`, and `/feedback` send private submissions to the appropriate staff channels.
- `/suggest` publishes community ideas to the suggestions channel for member reactions.

### Moderation and staff tools
- Warnings and warning history: `/warn`, `/warnings`, `/clearwarnings`.
- Member actions: `/timeout`, `/untimeout`, `/kick`, and `/ban`.
- Channel tools: `/clear`, `/lock`, `/unlock`, and `/slowmode`.
- Information and help: `/userinfo`, `/serverinfo`, `/help`, and staff-only `/staffhelp`.
- Moderation and support workflow actions are recorded in the private moderation log where applicable.

## Requirements

- Node.js 20.11.0 or newer
- A Discord application and bot
- A Discord server where you have permission to configure the bot
- Persistent storage for `config.json`

## Installation

1. Clone this repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` in `.env`.
5. In the Discord Developer Portal, enable **Server Members Intent** under Bot → Privileged Gateway Intents.
6. Invite the bot with the `bot` and `applications.commands` scopes.
7. Give the bot the permissions it needs (see below), then start it with `npm start`.
8. Run `npm test` to check the JavaScript syntax.
9. In the server, run `/setup` and choose **Update** for the normal first setup or later maintenance.

## Bot permissions and role hierarchy

The bot needs the permissions used by the features you intend to run:

- Manage Server
- Manage Roles
- Manage Channels
- View Channels and Read Message History
- Send Messages, Embed Links, Attach Files, and Add Reactions
- Manage Messages
- Moderate Members
- Kick Members and Ban Members
- Manage Events
- View Audit Log

For a straightforward setup, you can grant the bot Administrator permission. If you use granular permissions instead, make sure every required permission is enabled.

**Role hierarchy matters:** move the Shrine Assistant bot role above the staff and self-assignable roles it must manage. The setup process checks that the bot role is high enough before continuing.

The bot's own role does not automatically make a person staff. Staff roles are assigned manually by the server team. The `🪷・Miko Apprentice` role is for staff guidance and does not grant moderation powers.

## Configuration and data

- `.env` contains the bot token and Discord application/server IDs. Never commit it or share the token. If a token is exposed, reset it in the Discord Developer Portal.
- `config.json` is created at runtime and stores server configuration, warning histories, creator profiles, and per-member language preferences. It is ignored by Git.
- Keep `config.json` on persistent storage and back it up securely. If your hosting provider uses an ephemeral filesystem, the bot's saved warning and profile data may be lost when the service restarts or redeploys.
- The bot currently uses a local JSON file rather than an external database. Run one bot instance per server data directory to avoid concurrent writes.

## Operational notes

- Slash commands are registered for the configured `GUILD_ID` when the bot starts.
- After deploying onboarding changes, run `/setup` → **Update** to refresh the start-here guide and Community settings, then run `/onboarding-setup` once to publish the native Discord onboarding flow.
- Discord's Server Guide (Welcome Sign, 3–5 New Member To-Dos, and Resource Pages) still needs a one-time manual configuration in Server Settings → Onboarding → Server Guide. The supported public bot API exposes onboarding questions/default channels, but not these Server Guide fields.
- Re-run `/setup` → **Update** after other server-layout changes to refresh planned channels, permissions and bot panels. Existing channel messages are generally preserved.
- Update also retires the old tester-only channels and role from earlier versions; there is no active tester programme.
- Do not use **Fresh reset** as a routine update. It permanently removes channels, messages, forum posts and most roles.

## Available slash commands

`/setup`, `/onboarding-setup`, `/language`, `/help`, `/serverinfo`, `/ping`, `/userinfo`, `/suggest`, `/report`, `/bug-report`, `/feedback`, `/icebreaker`, `/event-create`, `/events`, `/event-cancel`, `/prompt`, `/emi-update`, `/project-update`, `/feedback-request`, `/kudos`, `/profile-set`, `/profile-view`, `/profile-clear`, `/creators`, `/spotlight`, `/warn`, `/warnings`, `/clearwarnings`, `/timeout`, `/untimeout`, `/kick`, `/ban`, `/clear`, `/lock`, `/unlock`, `/slowmode`, and `/staffhelp`.

Some commands are restricted by Discord permissions or server ownership. Use `/help` for member-facing guidance and `/staffhelp` for the internal staff guide.
