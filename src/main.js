import Phaser from "phaser";
import Game from "./scenes/game"



//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 768,
    height: 1024,

    min: {
        width: 480,
        height: 720,
    },
    max: {
        width: 1024,
        height: 1280,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    backgroundColor: '#028af8',

    scene: [



        Game,

    ]
};

export default new Phaser.Game(config);
