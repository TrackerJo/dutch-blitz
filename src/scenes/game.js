
import Card, { CardObj } from '../helpers/card';
import Dealer, { defaultDeck } from "../helpers/dealer";
import Zone, { ZoneObj } from '../helpers/zone';
import pGame, { scaleRatio } from '../main';
import Menu from '../helpers/menu';
import Players from '../helpers/players';
import { clearStuck, createRoom, endGameFB, endRound, joinRoom, listenToRoom, removeStuck, setStuck, signIn, startGame, startRoundFB, updateUserDeck, updateZone } from '../fb';
import { set } from 'firebase/database';

export default class Game extends Phaser.Scene {
    dragCard;
    constructor() {
        super({
            key: 'Game'
        });
    }

    preload() {
        for (let i = 1; i <= 13; i++) {
            let id = i;
            if(id == 1) id = "ace";
            if(id == 11) id = "jack";
            if(id == 12) id = "queen";
            if(id == 13) id = "king";
            this.load.image(i.toString() + "clubs", 'assets/cards/' + id.toString() + '_of_clubs.png');
            this.load.image(i.toString() + "spades",'assets/cards/' + id.toString() + '_of_spades.png');
            this.load.image(i.toString() + "diamonds",'assets/cards/' + id.toString() + '_of_diamonds.png');
            this.load.image(i.toString() + "hearts",'assets/cards/' + id.toString() + '_of_hearts.png');
        }

        this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI');
        this.load.image('BlueCardBack', 'assets/backs/blue_back.png');
        this.load.image('ReloadIcon', 'assets/reload_icon.png');

    }

    createJoinCode(name) {
        //create a random 6 digit code based on milliseconds since epoch
        let code = Date.now().toString();
        let newCode = "";
       //get last 4 digits of the code
        for (let i = code.length - 3; i < code.length; i++) {
            newCode += code[i];
        }
        //add ascii value of the first letter of the name
        let ascii = name.charCodeAt(0);
        let asciiString = ascii.toString();
        //add the ascii value to the code
        newCode += asciiString;
        if(newCode.length < 6){
            let diff = 6 - newCode.length;
            for (let i = 0; i < diff; i++) {
                //random number 0-9
                let randomNum = Math.floor(Math.random() * 10);
                newCode += randomNum;
            }
        }
        
        return newCode;
    }

    async create() {
        window.addEventListener("load",function() {
            // Set a timeout...
            setTimeout(function(){
                // Hide the address bar!
                window.scrollTo(0, 1);
            }, 0);
        });
        this.isRoomCreator = false;
        this.gameStarted = false;
        this.showLeaderboard = false;
        this.userId = "";
        this.name = "";
        this.zones = [];
        this.dropZones = [];
        this.outlines = [];
        this.deck = [];
        this.winner = "";
        this.stuckUsers = [];
        this.gameEnded = false;
        this.deck = JSON.parse(JSON.stringify(defaultDeck)); // Deep copy the deck
        this.deck = Phaser.Utils.Array.Shuffle(this.deck);// Shuffle using Phaser's built-in method
        this.blitzPileCards = [];
        for (let i = 0; i < 13; i++) {
            let card = this.deck[i];

            this.blitzPileCards.push(card);

        }
        //remove the cards from the deck from index 0 to 12
        this.deck.splice(0, 13);
        console.log("Deck after removing blitz pile cards");
        console.log(this.deck);
        this.blitzPileObjs = [];
        this.deckObjs = [];
        this.flippedCards = [];
        this.flippedCardsObjs = [];
        this.startingCards = [];
        this.players = [];
        this.numberOfPlayers = 4;
        this.draggingStack = [];
        this.registeredStuck = false;
        this.zonePositions = [[
            [100, this.cameras.main.height - 990],
            [275, this.cameras.main.height - 990],
            [450, this.cameras.main.height - 990],
            [625, this.cameras.main.height - 990],
            [100, this.cameras.main.height - 770],
            [275, this.cameras.main.height - 770],
            [450, this.cameras.main.height - 770],
            [625, this.cameras.main.height - 770]
        ],[
            [100, this.cameras.main.height - 1140],
            [275, this.cameras.main.height - 1140],
            [450, this.cameras.main.height - 1140],
            [625, this.cameras.main.height - 1140],
            [100, this.cameras.main.height - 970],
            [275, this.cameras.main.height - 970],
            [450, this.cameras.main.height - 970],
            [625, this.cameras.main.height - 970],
            [100, this.cameras.main.height - 800],
            [275, this.cameras.main.height - 800],
            [450, this.cameras.main.height - 800],
            [625, this.cameras.main.height - 800]
        ],[
            [80, this.cameras.main.height - 760],
            [200, this.cameras.main.height - 760],
            [320, this.cameras.main.height - 760],
            [440, this.cameras.main.height - 760],
            [560, this.cameras.main.height - 760],
            [80, this.cameras.main.height - 930],
            [200, this.cameras.main.height - 930],
            [320, this.cameras.main.height - 930],
            [440, this.cameras.main.height - 930],
            [560, this.cameras.main.height - 930],
            [80, this.cameras.main.height - 1100],
            [200, this.cameras.main.height - 1100],
            [320, this.cameras.main.height - 1100],
            [440, this.cameras.main.height - 1100],
            [560, this.cameras.main.height - 1100],
            [680, this.cameras.main.height - 930],


        ]
        ];

        this.zoneSizes = [
            [
                112,152
            ],
            [105, 142.5],
            [105 * .80, 142.5* .80]
        ];
        this.playersText = new Players(this, this.players, "");
        for (let i = 0; i < 4; i++) {
            let card = this.deck[i];
            this.startingCards.push(card);
        }
        this.deck.splice(0, 4);
        console.log("Deck after removing starting cards");
        console.log(this.deck);


       

        const generatePrivateZones = () => {
            let zoneObj = new ZoneObj({alternateColors: true, startAnywhere: true, descendingOrder: true, number: 0, suit: "", cards: 0, id:0, stack: false, isPublic: false, cardObjs: []});
            this.zones.push(new Zone(this,zoneObj));
    
            let zoneObj1 = new ZoneObj({alternateColors: true, startAnywhere: true, descendingOrder: true, number: 0, suit: "", cards: 0, id:1, stack: false, isPublic: false, cardObjs: []});
            this.zones.push(new Zone(this,zoneObj1));
    
            let zoneObj2 = new ZoneObj({alternateColors: true, startAnywhere: true, descendingOrder: true, number: 0, suit: "", cards: 0, id:2, stack: false, isPublic: false, cardObjs: []});
            this.zones.push(new Zone(this,zoneObj2));
    
            let zoneObj3 = new ZoneObj({alternateColors: true, startAnywhere: true, descendingOrder: true, number: 0, suit: "", cards: 0, id:3, stack: false, isPublic: false, cardObjs: []});
            this.zones.push(new Zone(this,zoneObj3));
        }

        generatePrivateZones();

        const generatePublicZones = () => {
            for (let i = 0; i < this.numberOfPlayers * 4; i++) {
                let zoneObj = new ZoneObj({alternateColors: false, startAnywhere: false, descendingOrder: false, number: 0, suit: "", cards: 0, id:i + 4, stack: true, isPublic: true, cardObjs: []});
                this.zones.push(new Zone(this,zoneObj));
            }
        }

        generatePublicZones();

        const renderPrivateZones = () => {
            this.dropZones.push(this.zones[0].renderZone(100, this.cameras.main.height - 150, 112, 152));
            this.outlines.push(this.zones[0].renderOutline(this.dropZones[0]))
         
            this.dropZones.push(this.zones[1].renderZone(275, this.cameras.main.height - 150, 112, 152));
            this.outlines.push(this.zones[1].renderOutline(this.dropZones[1]))
           
            this.dropZones.push(this.zones[2].renderZone(450, this.cameras.main.height - 150, 112, 152));
            this.outlines.push(this.zones[2].renderOutline(this.dropZones[2]))
           
            this.dropZones.push(this.zones[3].renderZone(625, this.cameras.main.height - 150, 112, 152));
            this.outlines.push(this.zones[3].renderOutline(this.dropZones[3]))
        }

        const renderGame = () => {
            renderPrivateZones();
            renderPublicZones();
             self.stuckText = self.add.text(self.cameras.main.width - 120, self.cameras.main.height - 590, ["Stuck?"]).setFontSize(50).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
             self.stuckText.setScale(scaleRatio, scaleRatio)
             self.stuckText.on('pointerdown', function () {
                console.log("Stuck clicked");
                if(self.registeredStuck){
                    self.registeredStuck = false;
                    self.stuckText.text = "Stuck?";
                    removeStuck(self.joinCode, self.userId);
                    return;
                }
                self.registeredStuck = true;
                self.stuckText.text = "Stuck!";
                setStuck(self.joinCode, self.userId);
                // self.dealer.stuck();
            });
            self.deckText = self.add.text(40, self.cameras.main.height - 480, ["Cards Left: " + self.players.find((u) => u.userId == self.userId).blitzDeck]).setFontSize(32).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
             self.deckText.setScale(scaleRatio, scaleRatio)
           
        }
        
        const renderPublicZones = () => {
            for (let i = 0; i < self.numberOfPlayers * 4; i++) {
               

                self.dropZones.push(self.zones[i + 4].renderZone(self.zonePositions[self.numberOfPlayers - 2][i][0], self.zonePositions[self.numberOfPlayers - 2][i][1], self.zoneSizes[self.numberOfPlayers - 2][0], self.zoneSizes[self.numberOfPlayers - 2][1]));
                self.outlines.push(self.zones[i + 4].renderOutline(self.dropZones[i + 4]))
            }
          
           
        }

        const clearGame = () => {
            if(self.goOutText){
                self.goOutText.destroy();
            }
            self.dealer.clearCards();
            self.dropZones.forEach((zone) => {
                zone.data.values.zoneObj.cardObjs.forEach((card) => {
                    card.destroy();
                });
                zone.destroy();
            });
            self.outlines.forEach((outline) => {
                outline.destroy();
            });
            self.dropZones = [];
            self.outlines = [];
            self.zones = [];
            self.deck = [];
            self.blitzPileCards = [];
            self.blitzPileObjs = [];
            self.deckObjs = [];
            self.flippedCards = [];
            self.flippedCardsObjs = [];
            self.startingCards = [];
            self.draggingStack = [];
            self.registeredStuck = false;
            self.stuckUsers = [];
            self.stuckText.destroy();
            self.deckText.destroy();
            self.playersText.destroy();
        }
      
        this.dealer = new Dealer(this, this.deck, this.blitzPileCards, this.blitzPileObjs, this.deckObjs, this.flippedCards, this.flippedCardsObjs, this.zones, this.dropZones, this.startingCards);
        let self = this;
        const onDeckClick = () => {
            console.log("Deck Clicked");
            self.dealer.dealCards();

        }

        const roomChanged = (room) => {

            let playersMap = room.users;
            
            let players = [];
            for (let key in playersMap) {
                let player = playersMap[key];
                players.push(player);
            }
            self.players = players;
            if(!self.gameEnded && room.gameEnded) {
                self.gameEnded = true;
                //sort players by points
                self.players.sort((a, b) => b.points - a.points);
                setTimeout(() => {
                self.menu.renderEndGame(self.players[0].name);
                }, 100);
                return;
            }
            if(!self.showLeaderboard && room.showLeaderboard) {
                self.winner = room.winner
                self.showLeaderboard = true;
                clearGame();
                self.menu = self.menu = new Menu(self, createGame, joinGame, self.players, self.isRoomCreator, goToNextRound, endGame);
                self.menu.renderLeaderboard(self.winner);
                return;
            }
            if(self.showLeaderboard && !room.showLeaderboard) {
                self.showLeaderboard = false;
                startRound();
                return;
            }

         
            
           
            self.playersText.update(players);
            self.numberOfPlayers = room.numberOfPlayers;
            self.stuckUsers = [];
            if(self.deckText){
                self.deckText.text = "Cards Left: " + self.players.find((u) => u.userId == self.userId).blitzDeck;
            }
            for(let key in room.stuckUsers){
                let user = room.stuckUsers[key];
                if(user != null){
                    self.stuckUsers.push(user);
                }
            }
            if(self.stuckUsers.length == players.length){
                console.log("All players are stuck");
                self.dealer.stuck();
                clearStuck(self.joinCode);
                self.registeredStuck = false;
                self.stuckText.text = "Stuck?";
            }



            if(!self.gameStarted && room.started) {
                self.gameStarted = true;
                renderGame();
                self.dealer.startGame();
                for (let i = 0; i < self.deckObjs.length; i++) {
                    self.deckObjs[i].on('pointerdown', onDeckClick);
                }
                if(self.isRoomCreator){
                    self.dealText.destroy();
                } else {
                    self.waitingText.destroy();
                }
            }
           
            updateZones(room.zones);
        }

        const updateZones = (zones) => {
            console.log("Zones Updated");
            console.log(zones);
            //get key value pairs of zones
            
            console.log(Object.keys(zones));
            for(const i in Object.keys(zones)){
                let zone = zones[Object.keys(zones)[i]];
                console.log(zone);
                let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == zone.id)
                if(indexOfDropZone == -1){
                    console.log("Zone not found");
                    continue;
                }
                console.log(indexOfDropZone);
                let dropZone = self.dropZones[indexOfDropZone];
                dropZone.data.values.zoneObj.cardObjs.forEach(card => {
                    card.destroy();
                    
                });
                dropZone.data.values.zoneObj.cards = zone.cards;
                dropZone.data.values.zoneObj.suit = zone.suit;
                dropZone.data.values.zoneObj.number = zone.number;
                let cardObjs = [];
                for (let j = 0; j < zone.cards; j++) {
                    let cardObj = new CardObj(zone.cardObjs[j]);

                    let card = new Card(self, cardObj);
                    console.log("NUMBER OF PLAYERS: " + self.numberOfPlayers);
                    let renderedCard = card.render(((dropZone.x) ), (dropZone.y), self.numberOfPlayers).disableInteractive();
                    cardObjs.push(renderedCard);



                }
                dropZone.data.values.zoneObj.cardObjs = cardObjs;
            }
        }

        const endGame = () => {
            endGameFB(self.joinCode);

        }

        const scoreGame = () => {
            let allCards = [];
            let allCardObjs = [];
            for (let i = 0; i < self.dropZones.length; i++) {
                let dropZone = self.dropZones[i];
               if(dropZone.data.values.zoneObj.isPublic) {
                allCards = [...allCards, ...dropZone.data.values.zoneObj.cardObjs];
               }
            }
            for (let i = 0; i < allCards.length; i++) {
                let card = allCards[i];
                console.log(card);
                allCardObjs.push(card.data.values.cardObj);
            }
            console.log("All cards");
            console.log(allCardObjs);
            for (let i = 0; i < allCardObjs.length; i++) {
                const cardObj = allCardObjs[i];
                console.log(cardObj);
                let player = self.players.find((p) => p.userId == cardObj.playedBy);
                player.points++;

                
            }
            for (let i = 0; i < self.players.length; i++) {
                const player = self.players[i];
                player.points -= player.blitzDeck;
                
            }
            let winner = self.players.find((p) => p.name == self.winner);
            winner.points += 5;

            console.log("Winner: " + winner.name);
            console.log("Winner points: " + winner.points);
            console.log("All players");
            console.log(self.players);
        }
       
        const createGame = async (name, numberOfPlayers) => {
            self.loadingText = self.add.text(300, self.cameras.main.height - 610, ['Loading...']).setFontSize(72).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
            self.loadingText.setScale(scaleRatio, scaleRatio)
            this.name = name;
            this.isRoomCreator = true;
            self.numberOfPlayers = numberOfPlayers;
            this.joinCode = this.createJoinCode(name);

            await createRoom(self.joinCode, self.userId, self.name, numberOfPlayers);
            await listenToRoom(self.joinCode, roomChanged);
            self.loadingText.destroy();
            console.log("Join Code: " + this.joinCode);
            this.joinCodeText = this.add.text(this.cameras.main.width / 2 - 200, 100, ['Join Code: ' + this.joinCode]).setFontSize(72).setFontFamily('Trebuchet MS').setColor('#d3af5e');
            this.joinCodeText.setScale(scaleRatio, scaleRatio)
           
            this.dealText = this.add.text(300, self.cameras.main.height - 610, ['Start']).setFontSize(72).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
            this.dealText.setScale(scaleRatio, scaleRatio)
            this.dealText.on('pointerdown', function () {
                self.joinCodeText.destroy();
                startGame(self.joinCode);
                //delete dealText
            
            })
        }

        const joinGame = async (name, joinCode) => {
            this.name = name;
            this.joinCode = joinCode;
            self.menu.reanderJoiningGame();
            let joinedRoom = await joinRoom(this.joinCode, this.userId, this.name);
            console.log("Join Code: " + this.joinCode);
            if (joinedRoom == "success") {
                await listenToRoom(self.joinCode, roomChanged);
                self.menu.destroyMenu();
               
                self.waitingText = self.add.text(self.cameras.main.width/2 - 310, self.cameras.main.height - 610, ['Waiting for host to start the game']).setFontSize(64).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
                self.waitingText.setScale(scaleRatio, scaleRatio)
            } else {
               if(joinedRoom == "full"){
                    alert("Room is full");
               } else if(joinedRoom == "DNE"){
                    alert("Room does not exist");
               } else if(joinedRoom == "started"){

                    alert("Game has already started");
               }
                self.menu.renderFailedJoining();
            }
          
        }

        const goToNextRound = () => {
            self.players.forEach((player) => {
                player.blitzDeck = 13;
            });
            startRoundFB(self.joinCode, self.players);

        }

        const startRound = () => {
            generatePrivateZones();
            generatePublicZones();
            
            self.deck = JSON.parse(JSON.stringify(defaultDeck)); // Deep copy the deck
            self.deck = Phaser.Utils.Array.Shuffle(self.deck);// Shuffle using Phaser's built-in method
            self.blitzPileCards = [];
            for (let i = 0; i < 13; i++) {
                let card = self.deck[i];

                self.blitzPileCards.push(card);

            }
            self.deck.splice(0, 13);
            for (let i = 0; i < 4; i++) {
                let card = self.deck[i];
                self.startingCards.push(card);
            }
            self.deck.splice(0, 4);
            self.menu.destroyLeaderboard();
            self.dealer = new Dealer(self, self.deck, self.blitzPileCards, self.blitzPileObjs, self.deckObjs, self.flippedCards, self.flippedCardsObjs, self.zones, self.dropZones, self.startingCards);
            renderGame();
            self.dealer.startGame();
            for (let i = 0; i < self.deckObjs.length; i++) {
                self.deckObjs[i].on('pointerdown', onDeckClick);
            }

        }
      

        self.menu = new Menu(self, createGame, joinGame, self.players, self.isRoomCreator, goToNextRound, endGame);
        self.menu.renderMenu();
        self.menu.renderLoading();
      
        let user = await signIn();
        self.menu.renderLoaded();
        console.log(user);
        this.userId = user.user.uid;
        self.playersText = new Players(self, self.players, this.userId);

        const goOut = () => {
            self.winner = self.name;
            scoreGame();
            endRound(self.joinCode, self.name, self.players);
        }

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
            self.children.bringToTop(gameObject);
            for (let i = 0; i < self.draggingStack.length; i++) {
                const card = self.draggingStack[i];
                card.x = dragX; 
                card.y = dragY + 30 * (i);
                self.children.bringToTop(card);
                
            }
            
        })

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff69b4);
            if(gameObject.data.values.cardObj.zoneIndex != -1 && gameObject.data.values.cardObj.zoneId != -1){
                let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == gameObject.data.values.cardObj.zoneId)
                if(indexOfDropZone == -1){
                    console.log("Drop zone not found");
                    self.children.bringToTop(gameObject);
                    return;
                }
                let dropZone = self.dropZones[indexOfDropZone];
                //get all cards after the current card
                let cardsAfter = dropZone.data.values.zoneObj.cardObjs.slice(gameObject.data.values.cardObj.zoneIndex + 1);
                console.log(cardsAfter);
                self.draggingStack = [];
                self.draggingStack.push(gameObject);
                self.children.bringToTop(gameObject);
                for (let i = 0; i < cardsAfter.length; i++) {
                    let card = cardsAfter[i];
                    self.draggingStack.push(card);
                    self.children.bringToTop(card);
                    card.setTint(0xff69b4);
                    card.disableInteractive();
                }
            } else {

                self.children.bringToTop(gameObject);
            }
        })

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            gameObject.setTint();
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
                if(self.draggingStack.length > 0){
                    let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == gameObject.data.values.cardObj.zoneId)

                    let dropZone = self.dropZones[indexOfDropZone];

                    self.draggingStack.forEach((card) => {
                        card.x = gameObject.input.dragStartX;
                        console.log(card.data.values.cardObj.zoneIndex);
                        card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex) - 200;
                        card.setTint();
                        card.setInteractive();
                    })
                }
                self.draggingStack = [];
            }
        })

        this.input.on('drop', function (pointer, gameObject, dropZone) {

            console.log(gameObject)
            console.log(gameObject.data.values.cardObj)
            //Check if current card
            console.log(gameObject.data.values.cardObj.number);
            console.log(gameObject.data.values.cardObj.suit);
            console.log(dropZone.data.values.zoneObj.number);
            console.log(dropZone.data.values.zoneObj.suit);
            let checkingCard;
            let lastCard;
            let isDraggingStack = false;
            if(self.draggingStack.length > 0){
                checkingCard = self.draggingStack[0];
                lastCard = self.draggingStack[self.draggingStack.length - 1];
                isDraggingStack = true;
            } else {
                checkingCard = gameObject;
                lastCard = gameObject;
            }
            if(dropZone.data.values.zoneObj.stack && self.draggingStack.length > 1) {
                console.log("Stacking cards");
                let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == gameObject.data.values.cardObj.zoneId)

                let dropZone = self.dropZones[indexOfDropZone];

                self.draggingStack.forEach((card) => {
                    card.x = gameObject.input.dragStartX;
                    console.log(card.data.values.cardObj.zoneIndex);
                    card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex);
                    card.setTint();
                    card.setInteractive();
                })
                self.draggingStack = [];
                return;
            }
            if(checkingCard.data.values.cardObj.zoneId == dropZone.data.values.zoneObj.id){
                console.log("Same card");
                if(isDraggingStack) {
                    let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == gameObject.data.values.cardObj.zoneId)

                    let dropZone = self.dropZones[indexOfDropZone];

                    self.draggingStack.forEach((card) => {
                        card.x = gameObject.input.dragStartX;
                        console.log(card.data.values.cardObj.zoneIndex);
                        card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex) - 200;
                        card.setTint();
                        card.setInteractive();
                    })
                    self.draggingStack = [];
                    return;
                }
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
                return;
            }
            if(dropZone.data.values.zoneObj.suit != "") {
                if(dropZone.data.values.zoneObj.descendingOrder && dropZone.data.values.zoneObj.number - 1 != checkingCard.data.values.cardObj.number){
                    console.log("Wrong lower number")
                    if(isDraggingStack) {
                        let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)
    
                        let dropZone = self.dropZones[indexOfDropZone];
    
                        self.draggingStack.forEach((card) => {
                            card.x = checkingCard.input.dragStartX;
                            console.log(card.data.values.cardObj.zoneIndex);
                            card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex)- 200;
                            card.setTint();
                            card.setInteractive();
                        })
                        self.draggingStack = [];
                        return;
                    }
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    return;
                } else if(!dropZone.data.values.zoneObj.descendingOrder && dropZone.data.values.zoneObj.number + 1 != checkingCard.data.values.cardObj.number) {
                    console.log("Wrong upper number")
                    if(isDraggingStack) {
                        let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)
    
                        let dropZone = self.dropZones[indexOfDropZone];
    
                        self.draggingStack.forEach((card) => {
                            card.x = checkingCard.input.dragStartX;
                            console.log(card.data.values.cardObj.zoneIndex);
                            card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex)- 200;
                            card.setTint();
                            card.setInteractive();
                        })
                        self.draggingStack = [];
                        return;
                    }
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    return;
                }

                if(dropZone.data.values.zoneObj.suit != checkingCard.data.values.cardObj.suit){
                    if(dropZone.data.values.zoneObj.alternateColors){
                        console.log("CHECKING ALTERNATE COLORS")
                        console.log(dropZone.data.values.suit)
                        console.log(gameObject.data.values.cardObj.suit)
                        if((dropZone.data.values.zoneObj.suit == "clubs" || dropZone.data.values.zoneObj.suit == "spades") && (checkingCard.data.values.cardObj.suit == "clubs" || checkingCard.data.values.cardObj.suit == "spades")){
                            console.log("Not flipped color")
                            if(isDraggingStack) {
                                let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)
            
                                let dropZone = self.dropZones[indexOfDropZone];
            
                                self.draggingStack.forEach((card) => {
                                    card.x = checkingCard.input.dragStartX;
                                    console.log(card.data.values.cardObj.zoneIndex);
                                    card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex)- 200;
                                    card.setTint();
                                    card.setInteractive();
                                })
                                self.draggingStack = [];
                                return;
                            }
                            gameObject.x = gameObject.input.dragStartX;
                            gameObject.y = gameObject.input.dragStartY;
                            return;

                        }
                        if((dropZone.data.values.zoneObj.suit == "hearts" || dropZone.data.values.zoneObj.suit == "diamonds") && (checkingCard.data.values.cardObj.suit == "hearts" || checkingCard.data.values.cardObj.suit == "diamonds")){
                            console.log("Not flipped color")
                            if(isDraggingStack) {
                                let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)
            
                                let dropZone = self.dropZones[indexOfDropZone];
            
                                self.draggingStack.forEach((card) => {
                                    card.x = checkingCard.input.dragStartX;
                                    console.log(card.data.values.cardObj.zoneIndex);
                                    card.y = dropZone.y+30 * (card.data.values.cardObj.zoneIndex)- 200;
                                    card.setTint();
                                    card.setInteractive();
                                })
                                self.draggingStack = [];
                                return;
                            }
                            gameObject.x = gameObject.input.dragStartX;
                            gameObject.y = gameObject.input.dragStartY;
                            return;

                        }
                        

                    } else {
                        if(isDraggingStack) {
                            let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)
        
                            let dropZone = self.dropZones[indexOfDropZone];
        
                            self.draggingStack.forEach((card) => {
                                card.x = checkingCard.input.dragStartX;
                                console.log(card.data.values.cardObj.zoneIndex);
                                card.y = dropZone.y+30 * (card.data.values.cardObj.zoneIndex)- 200;
                                card.setTint();
                                card.setInteractive();
                            })
                            self.draggingStack = [];
                            return;
                        }
                        gameObject.x = gameObject.input.dragStartX;
                        gameObject.y = gameObject.input.dragStartY;
                        return;
                    }
                } else if(dropZone.data.values.zoneObj.alternateColors) {
                    console.log("Not flipped color")
                    if(isDraggingStack) {
                        let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)
    
                        let dropZone = self.dropZones[indexOfDropZone];
    
                        self.draggingStack.forEach((card) => {
                            card.x = checkingCard.input.dragStartX;
                            console.log(card.data.values.cardObj.zoneIndex);
                            card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex)- 200;
                            card.setTint();
                            card.setInteractive();
                        })
                        self.draggingStack = [];
                        return;
                    }
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    return;
                }
            } else if(!dropZone.data.values.zoneObj.startAnywhere && checkingCard.data.values.cardObj.number != 1 ){
                console.log("NOT an ACE")
                if(isDraggingStack) {
                    let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)

                    let dropZone = self.dropZones[indexOfDropZone];

                    self.draggingStack.forEach((card) => {
                        card.x = checkingCard.input.dragStartX;
                        console.log(card.data.values.cardObj.zoneIndex);
                        card.y = dropZone.y+30 * (card.data.values.cardObj.zoneIndex)- 200;
                        card.setTint();
                        card.setInteractive();
                    })
                    self.draggingStack = [];
                    return;
                }
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
                return;
            }
            
            if(checkingCard.data.values.cardObj.fromBlitzPile){
                console.log("FROM BLITZ DECK");
                gameObject.data.values.cardObj.fromBlitzPile = false;
                console.log(self.blitzPileObjs[self.blitzPileObjs.length - 1]);
                if(self.blitzPileObjs.length > 1) {
                    self.blitzPileObjs[self.blitzPileObjs.length - 2].destroy()
                    let playerCardObj = new CardObj(self.blitzPileCards[self.blitzPileCards.length - 2]);
                    playerCardObj.showBack = false;
                    playerCardObj.fromBlitzPile = true;
                    console.log(playerCardObj);
                    let playerCard = new Card(self,playerCardObj);
                    playerCard.render(100, self.cameras.main.height - 580, 2);
                }
                self.blitzPileObjs.pop()
                self.blitzPileCards.pop();
                updateUserDeck(self.joinCode, self.userId, self.blitzPileCards.length);
                if(self.blitzPileCards.length == 0){
                    //show Go Out text
                    self.goOutText = self.add.text(50, self.cameras.main.height - 590, ["Go Out?"]).setFontSize(50).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
                    self.goOutText.setScale(scaleRatio, scaleRatio)
                    self.goOutText.on('pointerdown', function () {
                        console.log("Go Out clicked");
                        self.goOutText.destroy();
                        goOut();
                    });
                }
            

            }
            if(checkingCard.data.values.cardObj.fromFlippedPile){
                console.log("FROM FLIPPED DECK");
                gameObject.data.values.cardObj.fromFlippedPile = false;

                self.flippedCards.pop();
                self.flippedCardsObjs.pop();
                if(self.flippedCardsObjs.length > 0) {
                    console.log(self.flippedCardsObjs[self.flippedCardsObjs.length - 1]);
                    self.flippedCardsObjs[self.flippedCardsObjs.length - 1].setInteractive();
                }

            }
           
            if(checkingCard.data.values.cardObj.zoneId != -1 && checkingCard.data.values.cardObj.zoneId != undefined){
                console.log("FROM ZONE");
                console.log(gameObject.data.values.cardObj.zoneId);
                let indexOfDropZone = self.dropZones.findIndex((d) => d.data.values.zoneObj.id == checkingCard.data.values.cardObj.zoneId)
                console.log(indexOfDropZone);
                const currentDropZone = self.dropZones[indexOfDropZone].data.values.zoneObj;
                let number = 0;
                let suit = "";
                if(self.dropZones[indexOfDropZone].data.values.zoneObj.cardObjs.length > 1){
                    console.log("SETTING NUMBER AND SUIT");
                    if(isDraggingStack) {
                        console.log("FROM STACK");
                        if(checkingCard.data.values.cardObj.zoneIndex != 0) {
                            console.log("NOT FIRST CARD");
                            console.log(currentDropZone.cardObjs[checkingCard.data.values.cardObj.zoneIndex - 1]);  
                            number = currentDropZone.cardObjs[checkingCard.data.values.cardObj.zoneIndex - 1].data.values.cardObj.number;
                            suit = currentDropZone.cardObjs[checkingCard.data.values.cardObj.zoneIndex - 1].data.values.cardObj.suit;
                        }
                    } else {

                        number = currentDropZone.cardObjs[currentDropZone.cardObjs.length - 2].data.values.cardObj.number;
                        suit = currentDropZone.cardObjs[currentDropZone.cardObjs.length - 2].data.values.cardObj.suit;
                    }
                }
                self.dropZones[indexOfDropZone].data.values.zoneObj.number = number;
                self.dropZones[indexOfDropZone].data.values.zoneObj.suit = suit;
                if(isDraggingStack) {
                    //remove all the dragging cards from the drop zone
                    self.draggingStack.forEach((card) => {
                        self.dropZones[indexOfDropZone].data.values.zoneObj.cardObjs.pop();
                        self.dropZones[indexOfDropZone].data.values.zoneObj.cards--;

                    })
                } else {
                    self.dropZones[indexOfDropZone].data.values.zoneObj.cardObjs.pop();
                self.dropZones[indexOfDropZone].data.values.zoneObj.cards--;

                }
            }

            dropZone.data.values.zoneObj.suit = lastCard.data.values.cardObj.suit;
            dropZone.data.values.zoneObj.number = lastCard.data.values.cardObj.number;
            if(isDraggingStack) {

                    self.draggingStack.forEach((card) => {
                        card.x = dropZone.x;
                        dropZone.data.values.zoneObj.cards++;
                        dropZone.data.values.zoneObj.cardObjs.push(card);
                        card.data.values.cardObj.zoneIndex = dropZone.data.values.zoneObj.cardObjs.length - 1;
                        card.y = dropZone.y+ 30 * (card.data.values.cardObj.zoneIndex) - 200;
                        card.setTint();
                        card.setInteractive();
                    })

                    gameObject.data.values.cardObj.playedBy = self.userId;

            } else {
                gameObject.x = (dropZone.x);
                if(!dropZone.data.values.zoneObj.stack) {
                    gameObject.y = dropZone.y + (dropZone.data.values.zoneObj.cards * 30) - 200;
                
                } else {
                    gameObject.y = dropZone.y ;

                }
                gameObject.data.values.cardObj.playedBy = self.userId;
                dropZone.data.values.zoneObj.cards++;
                dropZone.data.values.zoneObj.cardObjs.push(gameObject);
                gameObject.data.values.cardObj.zoneIndex = dropZone.data.values.zoneObj.cardObjs.length - 1;
            }

            if(isDraggingStack) {
                self.draggingStack.forEach((card) => {
                    card.data.values.cardObj.zoneId = dropZone.data.values.zoneObj.id;

                })
            } else {
                gameObject.data.values.cardObj.zoneId = dropZone.data.values.zoneObj.id;
            }
            if(dropZone.data.values.zoneObj.isPublic){
                gameObject.disableInteractive();
            } 
            gameObject.setTint();
            if(dropZone.data.values.zoneObj.isPublic){
                updateZone(self.joinCode, dropZone.data.values.zoneObj.id, dropZone.data.values.zoneObj);

            }
            self.draggingStack = [];
        })
    }

    update() {

    }
}