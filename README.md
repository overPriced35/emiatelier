# Emi Atelier Discord Bot

A cute Discord.js bot that creates a starter community layout for Emi Atelier.

## Features

- `/setup` creates or reuses the **⛩️・THE SHRINE** category.
- Creates welcome, rules, announcements, general, introductions, and bot-commands channels.
- Posts or updates welcome and rules embeds without duplicating them on repeated setup runs.
- Sends welcome and goodbye embeds when members join or leave.

## Requirements

- Node.js 20.11.0 or newer
- A Discord application and bot
- Administrator permission in the target server

## Setup

1. Clone this repository and run `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` in `.env`.
4. In the Discord Developer Portal, enable **Server Members Intent** under Bot → Privileged Gateway Intents.
5. Invite the bot with `bot` and `applications.commands` scopes and permissions: Manage Channels, View Channels, Send Messages, Embed Links, and Read Message History.
6. Run `npm start`, then use `/setup` in your server.

## Security

Never commit or share your real `.env` file or bot token. If exposed, reset the token in the Discord Developer Portal.

The bot creates `config.json` at runtime to remember the welcome channel. Keep that file persistent between restarts if you deploy the bot on a hosting service.
