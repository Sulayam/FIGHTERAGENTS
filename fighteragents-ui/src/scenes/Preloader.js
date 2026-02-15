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
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
