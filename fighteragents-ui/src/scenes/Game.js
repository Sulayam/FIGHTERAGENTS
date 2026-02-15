import { Scene } from 'phaser';
import Character from '../classes/Character';
import DialogueBox from '../classes/DialogueBox';
import DialogueManager from '../classes/DialogueManager';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
        this.controls = null;
        this.player = null;
        this.cursors = null;
        this.dialogueBox = null;
        this.spaceKey = null;
        this.activeUFCFighter = null;
        this.dialogueManager = null;
        this.ufcfighters = [];
        this.labelsVisible = true;
    }

    create ()
    {
        const map = this.createTilemap();
        const tileset = this.addTileset(map);
        const layers = this.createLayers(map, tileset);
        let screenPadding = 20;
        let maxDialogueHeight = 200;

        this.createUFCFighters(map, layers);

        this.setupPlayer(map, layers.worldLayer);
        const camera = this.setupCamera(map);

        this.setupControls(camera);

        this.setupDialogueSystem();

        this.dialogueBox = new DialogueBox(this);
        this.dialogueText = this.add
            .text(60, this.game.config.height - maxDialogueHeight - screenPadding + screenPadding, '', {
            font: "18px monospace",
            fill: "#ffffff",
            padding: { x: 20, y: 10 },
            wordWrap: { width: 680 },
            lineSpacing: 6,
            maxLines: 5
            })
            .setScrollFactor(0)
            .setDepth(30)
            .setVisible(false);

        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // Initialize the dialogue manager
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.initialize(this.dialogueBox);
    }

    createUFCFighters(map, layers) {
        const ufcfighterConfigs = [
            { id: "conor",      name: "Conor McGregor",       defaultDirection: "right", roamRadius: 800 },
            { id: "khabib",     name: "Khabib Nurmagomedov",  defaultDirection: "front", roamRadius: 750 },
            { id: "islam",      name: "Islam Makachev",        defaultDirection: "front", roamRadius: 720 },
            { id: "chael",      name: "Chael Sonnen",          defaultDirection: "right", roamRadius: 700 },
            { id: "nate",       name: "Nate Diaz",             defaultDirection: "front", roamRadius: 680 },
            { id: "rampage",    name: "Rampage Jackson",       defaultDirection: "front", roamRadius: 770 },
            { id: "khamzat",    name: "Khamzat Chimaev",       defaultDirection: "front", roamRadius: 730 },
            { id: "nick",       name: "Nick Diaz",             defaultDirection: "front", roamRadius: 690 },
            { id: "joe_rogan",  name: "Joe Rogan",             defaultDirection: "front", roamRadius: 650 },
            { id: "dana_white", name: "Dana White",            defaultDirection: "front", roamRadius: 600 },
        ];

        this.ufcfighters = [];

        ufcfighterConfigs.forEach(config => {
            const spawnPoint = map.findObject("Objects", (obj) => obj.name === config.name);

            this[config.id] = new Character(this, {
                id: config.id,
                name: config.name,
                spawnPoint: spawnPoint,
                atlas: config.id,
                defaultDirection: config.defaultDirection,
                worldLayer: layers.worldLayer,
                defaultMessage: config.defaultMessage,
                roamRadius: config.roamRadius,
                moveSpeed: config.moveSpeed || 40,
                pauseChance: config.pauseChance || 0.2,
                directionChangeChance: config.directionChangeChance || 0.3,
                handleCollisions: true
            });

            this.ufcfighters.push(this[config.id]);
        });

        // Make all ufcfighter labels visible initially
        this.toggleUFCFighterLabels(true);

        // Add collisions between ufcfighters
        for (let i = 0; i < this.ufcfighters.length; i++) {
            for (let j = i + 1; j < this.ufcfighters.length; j++) {
                this.physics.add.collider(
                    this.ufcfighters[i].sprite,
                    this.ufcfighters[j].sprite
                );
            }
        }
    }

    checkUFCFighterInteraction() {
        let nearbyUFCFighter = null;

        for (const ufcfighter of this.ufcfighters) {
            if (ufcfighter.isPlayerNearby(this.player)) {
                nearbyUFCFighter = ufcfighter;
                break;
            }
        }

        if (nearbyUFCFighter) {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                if (!this.dialogueBox.isVisible()) {
                    this.dialogueManager.startDialogue(nearbyUFCFighter);
                } else if (!this.dialogueManager.isTyping) {
                    this.dialogueManager.continueDialogue();
                }
            }

            if (this.dialogueBox.isVisible()) {
                nearbyUFCFighter.facePlayer(this.player);
            }
        } else if (this.dialogueBox.isVisible()) {
            this.dialogueManager.closeDialogue();
        }
    }

    createTilemap() {
        return this.make.tilemap({ key: "map" });
    }

    addTileset(map) {
        const arenaTileset = map.addTilesetImage("ufc_arena", "arena-tiles");
        return [arenaTileset];
    }

    createLayers(map, tilesets) {
        const belowLayer = map.createLayer("Below Player", tilesets, 0, 0);
        const worldLayer = map.createLayer("World", tilesets, 0, 0);
        const aboveLayer = map.createLayer("Above Player", tilesets, 0, 0);
        worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);
        return { belowLayer, worldLayer, aboveLayer };
    }

    setupPlayer(map, worldLayer) {
        const spawnPoint = map.findObject("Objects", (obj) => obj.name === "Spawn Point");
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "sophia", "sophia-front")
            .setSize(30, 40)
            .setOffset(0, 6);

        this.physics.add.collider(this.player, worldLayer);

        this.ufcfighters.forEach(ufcfighter => {
            this.physics.add.collider(this.player, ufcfighter.sprite);
        });

        this.createPlayerAnimations();

        // Set world bounds for physics
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBoundsCollision(true, true, true, true);
    }

    createPlayerAnimations() {
        const anims = this.anims;
        const animConfig = [
            { key: "sophia-left-walk", prefix: "sophia-left-walk-" },
            { key: "sophia-right-walk", prefix: "sophia-right-walk-" },
            { key: "sophia-front-walk", prefix: "sophia-front-walk-" },
            { key: "sophia-back-walk", prefix: "sophia-back-walk-" }
        ];

        animConfig.forEach(config => {
            anims.create({
                key: config.key,
                frames: anims.generateFrameNames("sophia", { prefix: config.prefix, start: 0, end: 8, zeroPad: 4 }),
                frameRate: 10,
                repeat: -1,
            });
        });
    }

    setupCamera(map) {
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        return camera;
    }

    setupControls(camera) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: camera,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            speed: 0.5,
        });

        this.labelsVisible = true;

        // Add ESC key for pause menu
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.dialogueBox.isVisible()) {
                this.scene.pause();
                this.scene.launch('PauseMenu');
            }
        });
    }

    setupDialogueSystem() {
        const screenPadding = 20;
        const maxDialogueHeight = 200;

        this.dialogueBox = new DialogueBox(this);
        this.dialogueText = this.add
            .text(60, this.game.config.height - maxDialogueHeight - screenPadding + screenPadding, '', {
                font: "18px monospace",
                fill: "#ffffff",
                padding: { x: 20, y: 10 },
                wordWrap: { width: 680 },
                lineSpacing: 6,
                maxLines: 5
            })
            .setScrollFactor(0)
            .setDepth(30)
            .setVisible(false);

        this.spaceKey = this.input.keyboard.addKey('SPACE');

        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.initialize(this.dialogueBox);
    }

    update(time, delta) {
        const isInDialogue = this.dialogueBox.isVisible();

        if (!isInDialogue) {
            this.updatePlayerMovement();
        }

        this.checkUFCFighterInteraction();

        this.ufcfighters.forEach(ufcfighter => {
            ufcfighter.update(this.player, isInDialogue);
        });

        if (this.controls) {
            this.controls.update(delta);
        }
    }

    updatePlayerMovement() {
        const speed = 175;
        const prevVelocity = this.player.body.velocity.clone();
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        this.player.body.velocity.normalize().scale(speed);

        const currentVelocity = this.player.body.velocity.clone();
        const isMoving = Math.abs(currentVelocity.x) > 0 || Math.abs(currentVelocity.y) > 0;

        if (this.cursors.left.isDown && isMoving) {
            this.player.anims.play("sophia-left-walk", true);
        } else if (this.cursors.right.isDown && isMoving) {
            this.player.anims.play("sophia-right-walk", true);
        } else if (this.cursors.up.isDown && isMoving) {
            this.player.anims.play("sophia-back-walk", true);
        } else if (this.cursors.down.isDown && isMoving) {
            this.player.anims.play("sophia-front-walk", true);
        } else {
            this.player.anims.stop();
            if (prevVelocity.x < 0) this.player.setTexture("sophia", "sophia-left");
            else if (prevVelocity.x > 0) this.player.setTexture("sophia", "sophia-right");
            else if (prevVelocity.y < 0) this.player.setTexture("sophia", "sophia-back");
            else if (prevVelocity.y > 0) this.player.setTexture("sophia", "sophia-front");
            else {
                // If prevVelocity is zero, maintain current direction
                // Get current texture frame name
                const currentFrame = this.player.frame.name;

                // Extract direction from current animation or texture
                let direction = "front"; // Default

                // Check if the current frame name contains direction indicators
                if (currentFrame.includes("left")) direction = "left";
                else if (currentFrame.includes("right")) direction = "right";
                else if (currentFrame.includes("back")) direction = "back";
                else if (currentFrame.includes("front")) direction = "front";

                // Set the static texture for that direction
                this.player.setTexture("sophia", `sophia-${direction}`);
            }
        }
    }

    toggleUFCFighterLabels(visible) {
        this.ufcfighters.forEach(ufcfighter => {
            if (ufcfighter.nameLabel) {
                ufcfighter.nameLabel.setVisible(visible);
            }
        });
    }
}
