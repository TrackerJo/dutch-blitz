export class CardObj {
    number;
    suit;
    showBack;
    fromBlitzPile;
    fromFlippedPile;
    zoneId;
    zoneIndex;
    playedBy;


    constructor({
        number, suit, showBack, fromBlitzPile, fromFlippedPile, zoneId, zoneIndex, playedBy
    }){
        this.number = number;
        this.suit = suit;
        this.showBack = showBack;
        this.fromBlitzPile = fromBlitzPile;
        this.fromFlippedPile = fromFlippedPile;
        this.zoneId = zoneId;
        this.zoneIndex = zoneIndex;
        this.playedBy = playedBy;
    }

    getSprite(){
        if(this.showBack){
            return "BlueCardBack";
        }
        return this.number.toString() + this.suit;
    }
}

export default class Card {

    constructor(scene,cardObj) {

        this.render = (x, y, numberOfPlayers) => {
            let card = scene.add.image(x, y, cardObj.getSprite()).setInteractive();
            if(numberOfPlayers == 2) {
                card.setScale(0.25, 0.25);
            } 
            if (numberOfPlayers == 3) {
                card.setScale(0.22, 0.22);
            }
            if(numberOfPlayers == 4) {
                card.setScale(0.2, 0.2);
            }
            scene.input.setDraggable(card);
            card.setData({cardObj: cardObj})
            return card;
        }
    }
}