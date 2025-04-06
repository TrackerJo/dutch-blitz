import Phaser from "phaser";
import Game from "./scenes/game"

const scaleRatio = window.devicePixelRatio / 3;

export { scaleRatio };

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.CANVAS,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,

    // min: {
    //     width: 480,
    //     height: 720,
    // },
    // max: {
    //     width: 1024,
    //     height: 1280,
    // },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    backgroundColor: '#015c32',
    dom: {
        createContainer: true
    },

    scene: [



        Game,

    ]
};

const pGame = new Phaser.Game(config);

export default pGame;
