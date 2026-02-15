import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    preload ()
    {
        this.load.setPath('assets');

        // General assets
        this.load.image('background', 'talking_ufcfighters.jpg');
        this.load.image('logo', 'logo.png');

        // Tilesets
        this.load.image("arena-tiles", "tilesets/ufc_arena.png");

        // Tilemap
        this.load.tilemapTiledJSON("map", "tilemaps/fighteragents-town.json");

        // Character assets
        this.load.atlas("sophia", "characters/sophia/atlas.png", "characters/sophia/atlas.json");
        this.load.atlas("conor", "characters/conor/atlas.png", "characters/conor/atlas.json");
        this.load.atlas("khabib", "characters/khabib/atlas.png", "characters/khabib/atlas.json");
        this.load.atlas("islam", "characters/islam/atlas.png", "characters/islam/atlas.json");
        this.load.atlas("chael", "characters/chael/atlas.png", "characters/chael/atlas.json");
        this.load.atlas("nate", "characters/nate/atlas.png", "characters/nate/atlas.json");
        this.load.atlas("rampage", "characters/rampage/atlas.png", "characters/rampage/atlas.json");
        this.load.atlas("khamzat", "characters/khamzat/atlas.png", "characters/khamzat/atlas.json");
        this.load.atlas("nick", "characters/nick/atlas.png", "characters/nick/atlas.json");
        this.load.atlas("joe_rogan", "characters/joe_rogan/atlas.png", "characters/joe_rogan/atlas.json");
        this.load.atlas("dana_white", "characters/dana_white/atlas.png", "characters/dana_white/atlas.json");

        // Crowd fan atlases
        this.load.atlas("ada",       "characters/ada/atlas.png",       "characters/ada/atlas.json");
        this.load.atlas("aristotle", "characters/aristotle/atlas.png", "characters/aristotle/atlas.json");
        this.load.atlas("chomsky",   "characters/chomsky/atlas.png",   "characters/chomsky/atlas.json");
        this.load.atlas("dennett",   "characters/dennett/atlas.png",   "characters/dennett/atlas.json");
        this.load.atlas("descartes", "characters/descartes/atlas.png", "characters/descartes/atlas.json");
        this.load.atlas("leibniz",   "characters/leibniz/atlas.png",   "characters/leibniz/atlas.json");
        this.load.atlas("miguel",    "characters/miguel/atlas.png",    "characters/miguel/atlas.json");
        this.load.atlas("paul",      "characters/paul/atlas.png",      "characters/paul/atlas.json");
        this.load.atlas("plato",     "characters/plato/atlas.png",     "characters/plato/atlas.json");
        this.load.atlas("searle",    "characters/searle/atlas.png",    "characters/searle/atlas.json");
        this.load.atlas("socrates",  "characters/socrates/atlas.png",  "characters/socrates/atlas.json");
        this.load.atlas("turing",    "characters/turing/atlas.png",    "characters/turing/atlas.json");
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
