import Phaser from "phaser";
import Game from "./scenes/game"



//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',

    scene: [



        Game,

    ]
};

export default new Phaser.Game(config);
