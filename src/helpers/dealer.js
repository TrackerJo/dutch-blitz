import Card, { CardObj } from './card'

const defaultDeck = [
    { number: 1, suit: "clubs" },
    { number: 2, suit: "clubs" },
    { number: 3, suit: "clubs" },
    { number: 4, suit: "clubs" },
    { number: 5, suit: "clubs" },
    { number: 6, suit: "clubs" },
    { number: 7, suit: "clubs" },
    { number: 8, suit: "clubs" },
    { number: 9, suit: "clubs" },
    { number: 10, suit: "clubs" },
    { number: 11, suit: "clubs" },
    { number: 12, suit: "clubs" },
    { number: 13, suit: "clubs" },
    { number: 1, suit: "hearts" },
    { number: 2, suit: "hearts" },
    { number: 3, suit: "hearts" },
    { number: 4, suit: "hearts" },
    { number: 5, suit: "hearts" },
    { number: 6, suit: "hearts" },
    { number: 7, suit: "hearts" },
    { number: 8, suit: "hearts" },
    { number: 9, suit: "hearts" },
    { number: 10, suit: "hearts" },
    { number: 11, suit: "hearts" },
    { number: 12, suit: "hearts" },
    { number: 13, suit: "hearts" },
    { number: 1, suit: "spades" },
    { number: 2, suit: "spades" },
    { number: 3, suit: "spades" },
    { number: 4, suit: "spades" },
    { number: 5, suit: "spades" },
    { number: 6, suit: "spades" },
    { number: 7, suit: "spades" },
    { number: 8, suit: "spades" },
    { number: 9, suit: "spades" },
    { number: 10, suit: "spades" },
    { number: 11, suit: "spades" },
    { number: 12, suit: "spades" },
    { number: 13, suit: "spades" },
    { number: 1, suit: "diamonds" },
    { number: 2, suit: "diamonds" },
    { number: 3, suit: "diamonds" },
    { number: 4, suit: "diamonds" },
    { number: 5, suit: "diamonds" },
    { number: 6, suit: "diamonds" },
    { number: 7, suit: "diamonds" },
    { number: 8, suit: "diamonds" },
    { number: 9, suit: "diamonds" },
    { number: 10, suit: "diamonds" },
    { number: 11, suit: "diamonds" },
    { number: 12, suit: "diamonds" },
    { number: 13, suit: "diamonds" }
];

export {defaultDeck}

export default class Dealer {
    constructor(scene, deck, blitzPileCards, blitzPileObjs, deckObjs,flippedCards, flippedCardsObjs, zones, dropZones, startingCards) {
        
        this.startGame = () => {

            for (let i = 0; i < startingCards.length; i++) {
                const card = startingCards[i];
                let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:false, fromBlitzPile: false, fromFlippedPile: false, zoneId: i, zoneIndex: 0, playedBy: ""});

                let playerCard = new Card(scene,playerCardObj);
                let zoneObj = zones[i];
                
                console.log( dropZones[i]);


                let cardObj = playerCard.render(((dropZones[i].x) ), (dropZones[i].y - 200 ),2).setInteractive();
                dropZones[i].data.values.zoneObj.cards += 1;
                dropZones[i].data.values.zoneObj.cardObjs.push(cardObj);
                dropZones[i].data.values.zoneObj.number = card.number;
                dropZones[i].data.values.zoneObj.suit = card.suit;



            }

            for (let i = 0; i < blitzPileCards.length; i++) {
                let card = blitzPileCards[i];

                let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:i != 12, fromBlitzPile: true, fromFlippedPile: false, zoneId: -1, zoneIndex: -1, playedBy: ""});

                let playerCard = new Card(scene,playerCardObj);

                blitzPileObjs.push(playerCard.render(100, scene.cameras.main.height - 580,2));

               
            }
            for (let i = 0; i < deck.length; i++) {
                const card = deck[i];
                let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:true, fromBlitzPile: false, fromFlippedPile: false, zoneId: -1, zoneIndex: -1, playedBy: ""});

                let playerCard = new Card(scene,playerCardObj);
               

                deckObjs.push( playerCard.render(350, scene.cameras.main.height - 580,2));
                
            }
           
            // let randomNumber2 = 4;
            //     let randomSuit2 =  2;
            //     let suits = ["clubs", "hearts","spades", "diamonds"];

            //     let playerCardObj2 = new CardObj({number: randomNumber2, suit: suits[randomSuit2 - 1], showBack:true});
            //     console.log(playerCardObj2);
            //     let playerCard2 = new Card(scene,playerCardObj2);
            //     playerCard2.render(360, 900);
            // let randomNumber1 = 5;
            //     let randomSuit1 = 1;
            //     let playerCardObj1 = new CardObj({number: randomNumber1, suit: suits[randomSuit1 - 1], showBack:true});
            //     console.log(playerCardObj1);
            //     let playerCard1 = new Card(scene,playerCardObj1);
            //     playerCard1.render(360, 900);
                
        }

        this.dealCards = () => {
            if(deckObjs.length < 3){
                console.log("Not enough cards to deal");
                console.log(deckObjs);
                console.log(deck);
                for (let i = 0; i < deck.length; i++) {
                    const card = deck[deck.length - 1 - i];
                    let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:false, fromBlitzPile: false, fromFlippedPile: true, zoneId: -1, zoneIndex: -1, playedBy: ""});
                    flippedCards.push(playerCardObj);
                    let playerCard = new Card(scene,playerCardObj);
                    flippedCardsObjs.push( playerCard.render(520, scene.cameras.main.height - 580,2));
                }
                for (let i = 0; i < deckObjs.length; i++) {
                    deckObjs[i].destroy();

                }
                deckObjs.length = 0;
                deck.length = 0;
                console.log("All cards dealt");
                let card = scene.add.image(350, scene.cameras.main.height - 580, "ReloadIcon").setScale(1, 1)
                card.setInteractive();
                card.on('pointerdown', () => {
                    console.log("Reloading cards");
                    card.destroy();
                    this.reDealCards();
                });
                return;
            }
            for (let i = 0; i < 3; i++) {
                const card = deck[deck.length - 1 - i];
                let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:false, fromBlitzPile: false, fromFlippedPile: true, zoneId: -1, zoneIndex: -1, playedBy: ""});

                let playerCard = new Card(scene,playerCardObj);
                flippedCards.push(playerCardObj)
                let renderedObj = playerCard.render(520, scene.cameras.main.height - 580,2);
                if(i != 2){
                    renderedObj.disableInteractive();
                }
                flippedCardsObjs.push(renderedObj);
               
                
            }
            

            deckObjs[deckObjs.length - 1].destroy();
            deckObjs[deckObjs.length - 2].destroy();
            deckObjs[deckObjs.length - 3].destroy();
            deck.pop();
            deck.pop();
            deck.pop();
            deckObjs.pop();
            deckObjs.pop();
            deckObjs.pop();
            if(deck.length == 0){
                console.log("All cards dealt");
                let card = scene.add.image(350, scene.cameras.main.height - 580, "ReloadIcon").setScale(1, 1)
                card.setInteractive();
                card.on('pointerdown', () => {
                    console.log("Reloading cards");
                    card.destroy();
                    this.reDealCards();
                });
                
            }
            console.log("Cards dealt");
            console.log(flippedCardsObjs);
        }

        this.reDealCards = () => {
            const newDeck = [];

            for (let i = 0; i < flippedCardsObjs.length; i++) {
                flippedCardsObjs[i].destroy();



            }
            for (let i = 0; i < flippedCards.length; i++) {
                newDeck.push(flippedCards[i]);



            }
            flippedCards.length = 0;
            flippedCardsObjs.length = 0;
            deckObjs.length = 0;
            deck.length = 0;
            // flippedCardsObjs = [];
            // flippedCards = [];
            newDeck.reverse();
            // deck = [];
            // deckObjs = [];
            for (let i = 0; i < newDeck.length; i++) {
                const card = newDeck[i];
                let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:true, fromBlitzPile: false, fromFlippedPile: false, zoneId: -1, zoneIndex: -1, playedBy: ""});

                let playerCard = new Card(scene,playerCardObj);
                let playerObj = playerCard.render(350, scene.cameras.main.height - 580,2);
                deckObjs.push( playerObj);
                deck.push(card);

                playerObj.on('pointerdown', () => {
                    this.dealCards();
                });
            }

        }

        this.resetDeck = () => {
            for (let i = 0; i < deck.length; i++) {
                const card = deck[deck.length - 1 - i];
                let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:false, fromBlitzPile: false, fromFlippedPile: true, zoneId: -1, zoneIndex: -1, playedBy: ""});
                flippedCards.push(playerCardObj);
                let playerCard = new Card(scene,playerCardObj);
                flippedCardsObjs.push( playerCard.render(520, scene.cameras.main.height - 580,2));
            }
            for (let i = 0; i < deckObjs.length; i++) {
                deckObjs[i].destroy();

            }
            deckObjs.length = 0;
            deck.length = 0;
            this.reDealCards();
        }

        this.stuck = () => {
            this.resetDeck();
            //deal one card

            const card = deck[deck.length - 1];
            let playerCardObj = new CardObj({number: card.number, suit: card.suit, showBack:false, fromBlitzPile: false, fromFlippedPile: true, zoneId: -1, zoneIndex: -1, playedBy: ""});

            let playerCard = new Card(scene,playerCardObj);
            flippedCards.push(playerCardObj)
            let renderedObj = playerCard.render(520, scene.cameras.main.height - 580,2);
            
            flippedCardsObjs.push(renderedObj);


            deckObjs[deckObjs.length - 1].destroy();
            deck.pop();
            deckObjs.pop();
            
        }

        this.clearCards = () => {
            for (let i = 0; i < flippedCardsObjs.length; i++) {
                flippedCardsObjs[i].destroy();
            }
            flippedCardsObjs.length = 0;
            flippedCards.length = 0;
            for (let i = 0; i < deckObjs.length; i++) {
                deckObjs[i].destroy();
            }
            deckObjs.length = 0;
            deck.length = 0;
            for (let i = 0; i < blitzPileObjs.length; i++) {
                blitzPileObjs[i].destroy();
            }
            blitzPileObjs.length = 0;
            blitzPileCards.length = 0;
            
        }

    }

}