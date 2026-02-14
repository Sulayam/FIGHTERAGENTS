# FighterAgents Arena

![FighterAgents Arena](public/assets/game_screenshot.png)

FighterAgents Arena is the interactive UI component that allows you to engage in conversations with UFC fighter agents. Talk trash with Conor McGregor, discuss discipline with Khabib, or chat with Dana White about the business.

# Overview

This web-based game features a top-down arena where you can explore and interact with famous UFC fighters. Each character has their own unique personality and conversational style powered by LLM agents.

The UI is built with Phaser 3, a powerful HTML5 game framework, and connects to a backend API that powers the fighter agents' conversational abilities.


# Getting Started

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`. If you don't want to install Node.js, you can use the Docker container.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Setting up the UI

After cloning the repo, run npm install from your project directory. Then, you can start the local development server by running npm run dev.

```bash
git clone https://github.com/Sulayam/FIGHTERAGENTS.git
cd FIGHTERAGENTS/fighteragents-ui
npm install
npm run dev
```

The local development server runs on http://localhost:8080 by default.


# Features

## Interactive Arena Environment

Explore the arena environment with various areas and elements.

![FighterAgents Arena](public/assets/fighteragents_town.png)

To build the arena, we have used the following assets:

- [Tuxemon](https://github.com/Tuxemon/Tuxemon)
- [LPC Plant Repack](https://opengameart.org/content/lpc-plant-repack)
- [LPC Compatible Ancient Greek Architecture](https://opengameart.org/content/lpc-compatible-ancient-greek-architecture)

## UFC Fighter Characters

Interact with famous UFC fighters like Conor McGregor, Khabib Nurmagomedov, Islam Makachev, and personalities like Joe Rogan and Dana White.
Every character sprite has been built with the [Universal LPC Spritesheet Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#?body=Body_color_light&head=Human_m)

![Sprite Image](public/assets/sprite_image.png)


## Dialogue System

Engage in conversations with UFC fighters powered by LLM agents. The dialogue system is controlled by the [DialogueBox](src/classes/DialogueBox.js) and [DialogueManager](src/classes/DialogueManager.js) classes.

## Dynamic Movement

Characters roam around with realistic movement patterns and collision detection. This is implemented in the [Character](src/classes/Character.js) class.


# Project Structure

- `index.html` - A basic HTML page to contain the game.
- `src` - Contains the game source code.
- `src/main.js` - The main entry point. This contains the game configuration and starts the game.
- `src/scenes/` - The Phaser Scenes are in this folder.
- `public/style.css` - Some simple CSS rules to help with page layout.
- `public/assets` - Contains the static assets used by the game.

# Docker

The project includes Docker support for easy deployment. You can use the following commands to run the UI with Docker:

```bash
# Build the Docker image
docker build -t fighteragents-ui .

# Run the container
docker run -p 8080:8080 fighteragents-ui
```

This is great if you want to debug, but you need to understand that this is just the UI and you need to have the backend running to have a complete experience. That's why we have provided a Docker Compose file (parent directory) that will start the UI and the backend together.

# Controls

- Arrow keys: Move your character around the arena
- Space: Interact with fighters when you're close to them
- ESC: Close dialogue windows or open the pause menu

# Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
