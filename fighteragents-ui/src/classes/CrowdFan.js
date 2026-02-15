/**
 * CrowdFan — lightweight seated crowd fan sprite.
 * No physics body, no name label, no roaming logic.
 * Animation is driven by a single global timer in Game.js.
 */

export const FAN_ATLASES = [
    { key: 'ada',       prefix: 'ada_lovelace' },
    { key: 'aristotle', prefix: 'aristotle'    },
    { key: 'chomsky',   prefix: 'chomsky'      },
    { key: 'dennett',   prefix: 'dennett'      },
    { key: 'descartes', prefix: 'descartes'    },
    { key: 'leibniz',   prefix: 'leibniz'      },
    { key: 'miguel',    prefix: 'miguel'       },
    { key: 'paul',      prefix: 'paul'         },
    { key: 'plato',     prefix: 'plato'        },
    { key: 'searle',    prefix: 'searle'       },
    { key: 'socrates',  prefix: 'socrates'     },
    { key: 'turing',    prefix: 'turing'       },
];

export class CrowdFan {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - World pixel x
     * @param {number} y - World pixel y
     * @param {string} atlasKey - Phaser atlas key
     * @param {string} prefix - Frame name prefix
     * @param {string} direction - Facing direction
     * @param {number} cheerOffset - ms offset into cheer cycle
     */
    constructor(scene, x, y, atlasKey, prefix, direction, cheerOffset) {
        this.idleFrame    = `${prefix}-${direction}`;
        this.cheerAnimKey = `${atlasKey}-${direction}-cheer`;
        this.cheerOffset  = cheerOffset;

        this.sprite = scene.add.sprite(x, y, atlasKey, this.idleFrame);
        this.sprite.setDepth(5);
        this.sprite.setScale(0.6);
    }

    destroy() {
        this.sprite.destroy();
    }
}
