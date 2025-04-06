export default class Menu {

    constructor(scene, createGame, joinGame, players, isHost, startRound, endGame) {

        this.renderMenu = () => {
               // Create a graphics object
               this.graphics = scene.add.graphics();

               // Set fill style (color, alpha)
               this.graphics.fillStyle(0xff015c32, 1); // Green color with 0.8 opacity
   
               // Draw rectangle covering the entire screen
               this.graphics.fillRect(
                   0,
                   0, 
                   scene.cameras.main.width,
                   scene.cameras.main.height
               );
               this.menuText = scene.add.text(scene.cameras.main.width/2 - 250, 100, ['Dutch Blitz']).setFontSize(100).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
                this.nameElement = scene.add.dom(scene.cameras.main.width/2, 300).createFromHTML(`
                <input type="text" 
                       placeholder="Enter your name" 
                       class="name-input"
                >
            `);

            this.nameElement.addListener('input');
            this.nameElement.on('input', (event) => {
                const value = event.target.value;
                console.log('Input value:', value);
                this.name = value;
                // Add your input handling logic here
            });

            let numberOfPlayersDialog = scene.add.dom(scene.cameras.main.width/2, 500).createFromHTML(`
                <dialog class="players-dialog">
               <div class="players-container">
                    <h2>Number of Players</h2>
                    <div class="players-buttons">
                    <button class="players-button">2</button>   
                    <button class="players-button">3</button>
                    <button class="players-button">4</button>
                    </div>
                    </div>
                </dialog>
            `);
            numberOfPlayersDialog.addListener('click');
            numberOfPlayersDialog.on('click', (event) => {
                if(event.target.classList.contains('players-button')){
                    const value = parseInt(event.target.textContent);
                    console.log('Number of players button clicked:', value);
                    this.numberOfPlayers = value;
                    // Add your button handling logic here
                    console.log(this.numberOfPlayers);
                    const dialogElement = numberOfPlayersDialog.node.querySelector('dialog');
                    dialogElement.close();
                    createGame(this.name, this.numberOfPlayers);
                        this.menuText.destroy();
                        this.nameElement.destroy();
                        this.createButton.destroy();
                        this.joinButton.destroy();
                        this.graphics.clear();
                        this.graphics.destroy();
                }
            }
            );


             this.createButton = scene.add.dom(scene.cameras.main.width/2, 400).createFromHTML(`
                <button class="start-button">Create Game</button>
            `);
            this.createButton.addListener('click');
            this.createButton.on('click', (event) => {

                    console.log('Start button clicked');
                    // Add your button handling logic here
                    console.log(this.name);
                    if(this.name && this.name.length > 0){
                        console.log('Starting game with name:', this.name);
                        //Show input
                        const dialogElement = numberOfPlayersDialog.node.querySelector('dialog');
                        dialogElement.showModal();

                        


                    } else {
                        alert("Please enter a name");
                    }

            }
            );

            
            let joinCodeDialog = scene.add.dom(scene.cameras.main.width/2, 500).createFromHTML(`
                <dialog class="join-code-dialog">
               <div class="join-code-container">
                    <input type="text" 
                           placeholder="Enter your join code" 
                           class="join-code-input"
                    >
                    <br>
                    <button class="join-code-button">Join</button>
                    </div>
                </dialog>
            `);
            joinCodeDialog.addListener('input');
            joinCodeDialog.on('input', (event) => {
                const value = event.target.value;
                console.log('Input value:', value);
                this.joinCode = value;
                // Add your input handling logic here
            });
            joinCodeDialog.addListener('click');
            joinCodeDialog.on('click', (event) => {
                if(event.target.classList.contains('join-code-button')){
                    const value = event.target.value;
                    console.log('Join code button clicked:', value);
                    console.log(this.joinCode);
                    // Add your button handling logic here
                    joinGame(this.name, this.joinCode);
                    const dialogElement = joinCodeDialog.node.querySelector('dialog');
                    dialogElement.close();
                }
            });

            this.joinButton = scene.add.dom(scene.cameras.main.width/2, 500).createFromHTML(`
                <button class="start-button">Join Game</button>
            `);
            this.joinButton.addListener('click');
            this.joinButton.on('click', (event) => {
                    console.log('Join button clicked');
                    // Add your button handling logic here
                    console.log(this.name);
                    if(this.name && this.name.length > 0){
                        //Show input
                        const dialogElement = joinCodeDialog.node.querySelector('dialog');
                        dialogElement.showModal();
                       


                       

                    } else {
                        alert("Please enter a name");
                    }
                    // this.menuText.destroy();
            }
            );

           

   
               return this.graphics;
        }

        this.destroyMenu = () => {
            this.menuText.destroy();
            this.nameElement.destroy();
            this.createButton.destroy();
            this.joinButton.destroy();
            this.graphics.clear();
            this.graphics.destroy();
            if(this.joiningText){
                this.joiningText.destroy();
            }
        }

        this.reanderJoiningGame = () => {

            this.nameElement.destroy();
            this.createButton.destroy();
            this.joinButton.destroy();
            this.graphics.clear();
            this.graphics.destroy();
            this.joiningText = scene.add.text(scene.cameras.main.width/2 - 150, 300, ['Joining Game...']).setFontSize(50).setFontFamily('Trebuchet MS').setColor('#d3af5e');

        }

        this.renderFailedJoining = () => {
            this.joiningText.destroy();
            this.menuText.destroy();
            this.renderMenu();
        }

        this.renderLoading = () => {
            this.nameElement.destroy();
            this.createButton.destroy();
            this.joinButton.destroy();
            this.graphics.clear();
            this.graphics.destroy();
            this.loadingText = scene.add.text(scene.cameras.main.width/2 - 100, 300, ['Loading...']).setFontSize(50).setFontFamily('Trebuchet MS').setColor('#d3af5e');
        }

        this.renderLoaded = () => {
            this.loadingText.destroy();
            this.menuText.destroy();
            this.renderMenu();
        }

        this.renderLeaderboard = (winner) => {
             // Create a graphics object
             this.graphics = scene.add.graphics();

             // Set fill style (color, alpha)
             this.graphics.fillStyle(0xff015c32, 1); // Green color with 0.8 opacity
 
             // Draw rectangle covering the entire screen
             this.graphics.fillRect(
                 0,
                 0, 
                 scene.cameras.main.width,
                 scene.cameras.main.height
             );
             this.menuText = scene.add.text(scene.cameras.main.width/2 - 250, 100, ['Leaderboard']).setFontSize(100).setFontFamily('Trebuchet MS').setColor('#d3af5e').setInteractive();
             this.winnerText = scene.add.text(scene.cameras.main.width/2 -100, 230, [`${winner} went out!`]).setFontSize(30).setFontFamily('Trebuchet MS').setColor('#d3af5e');
             //sort players by points
                players.sort((a, b) => b.points - a.points);
                // Create player info text
                const x = scene.cameras.main.width/2 - 200; // Space players apart horizontally
                const startY = 300;
                const spacing = 50;

                // Clear any existing player displays
                if (this.playerTexts) {
                    this.playerTexts.forEach(text => text.destroy());
                }
                this.playerTexts = [];
                // Render each player's info
                players.forEach((player, index) => {
                    console.log(player);

                    // Skip the current player

                    const y = startY + (index * spacing); // Space players apart vertically
                    // Create player info text
                    const playerText = scene.add.text(x, y, 
                        `${index == 0 ? "★ " : ""}${player.name}: ${player.points} points`, {
                        fontSize: '24px',
                        fontFamily: 'Trebuchet MS',
                        color: '#d3af5e',
                        backgroundColor: '#015c32',
                        padding: { x: 10, y: 5 },
                        borderRadius: 5
                    });
                    // Add to tracking array for future updates
                    this.playerTexts.push(playerText);

            })
            if(isHost){
                this.startButton = scene.add.dom(scene.cameras.main.width/2, 500).createFromHTML(`
                    <button class="start-button">Start Next Round</button>
                `);

                this.startButton.addListener('click');
                this.startButton.on('click', (event) => {
                    console.log('Start button clicked');
                    startRound();
                    this.startButton.destroy();
                    this.endGameButton.destroy();
                    this.menuText.destroy();
                    this.graphics.clear();
                    this.graphics.destroy();

                });

                this.endGameButton = scene.add.dom(scene.cameras.main.width/2, 600).createFromHTML(`
                    <button class="start-button">End Game</button>
                `);
                this.endGameButton.addListener('click');
                this.endGameButton.on('click', (event) => {
                    console.log('End Game button clicked');
                    endGame();
                    this.endGameButton.destroy();
                    this.startButton.destroy();
                    this.menuText.destroy();
                    this.graphics.clear();
                    this.graphics.destroy();

                });
            }
        }

        this.destroyLeaderboard = () => {
            this.menuText.destroy();
            this.graphics.clear();
            this.graphics.destroy();
            if(this.winnerText) {
                this.winnerText.destroy();
            }
            if(this.playerTexts) {
                this.playerTexts.forEach(text => text.destroy());
            }
            if(this.startButton){
                this.startButton.destroy();
            }
            if(this.endGameButton){
                this.endGameButton.destroy();
            }
        }

        this.renderEndGame = (winner) => {
           this.destroyLeaderboard();
           this.graphics = scene.add.graphics();

           // Set fill style (color, alpha)
           this.graphics.fillStyle(0xff015c32, 1); // Green color with 0.8 opacity

           // Draw rectangle covering the entire screen
           this.graphics.fillRect(
               0,
               0, 
               scene.cameras.main.width,
               scene.cameras.main.height
           );
           this.winText = scene.add.text(scene.cameras.main.width/2 - 200, scene.cameras.main.height / 2 - 200, [`${winner} wins!`]).setFontSize(100).setFontFamily('Trebuchet MS').setColor('#d3af5e');
        }


    }
}