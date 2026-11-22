# Shrine Assistant — Atelier de Emi

Shrine Assistant is the Discord bot for **Atelier de Emi**, a creator community for cosplay, art, photography, crafting and other creative interests. The server's atmosphere is inspired by Yae Miko and the Grand Narukami Shrine, but no Genshin Impact knowledge is needed to join.

## What the bot does

### Server setup and onboarding
- `/setup` creates or updates the planned server categories, channels, roles, permissions and pinned-style information panels.
- The **Update** option preserves existing channels and messages while creating missing items and refreshing planned permissions and bot panels.
- The **Fresh reset** option is destructive: it deletes server channels and categories and most non-managed roles before rebuilding the layout. Do not use it unless you intentionally want to wipe existing server content.
- New members receive the `✨・Shrine Visitor` role and a welcome message.
- Members can choose optional creative-interest and notification roles from the role panel.
- The start-here guide links members to rules, roles, introductions and the gallery.

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
- `config.json` is created at runtime and stores server configuration, warning histories, and creator profiles. It is ignored by Git.
- Keep `config.json` on persistent storage and back it up securely. If your hosting provider uses an ephemeral filesystem, the bot's saved warning and profile data may be lost when the service restarts or redeploys.
- The bot currently uses a local JSON file rather than an external database. Run one bot instance per server data directory to avoid concurrent writes.

## Operational notes

- Slash commands are registered for the configured `GUILD_ID` when the bot starts.
- Re-run `/setup` → **Update** after deploying changes to refresh planned channels, permissions and bot panels. Existing channel messages are generally preserved.
- Update also retires the old tester-only channels and role from earlier versions; there is no active tester programme.
- Do not use **Fresh reset** as a routine update. It permanently removes channels, messages, forum posts and most roles.

## Available slash commands

`/setup`, `/help`, `/serverinfo`, `/userinfo`, `/suggest`, `/report`, `/bug-report`, `/feedback`, `/icebreaker`, `/event-create`, `/events`, `/event-cancel`, `/prompt`, `/emi-update`, `/project-update`, `/feedback-request`, `/kudos`, `/profile-set`, `/profile-view`, `/profile-clear`, `/creators`, `/spotlight`, `/warn`, `/warnings`, `/clearwarnings`, `/timeout`, `/untimeout`, `/kick`, `/ban`, `/clear`, `/lock`, `/unlock`, `/slowmode`, and `/staffhelp`.

Some commands are restricted by Discord permissions or server ownership. Use `/help` for member-facing guidance and `/staffhelp` for the internal staff guide.
