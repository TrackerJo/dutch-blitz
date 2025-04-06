export default class Players {

    constructor(scene, players, userId) {
        
        this.players = players.filter(player => player.userId != userId);

        this.render = () => {
            // Create container for player info
            const startX = 50;
            const y = 50;
            
            // Clear any existing player displays
            if (this.playerTexts) {
                this.playerTexts.forEach(text => text.destroy());
            }
            this.playerTexts = [];


            // Render each player's info
            this.players.filter(player => player.userId != userId).forEach((player, index) => {
                // Skip the current player
                if (player.userId != userId) {
                    console.log(player);
                    console.log(userId);
                const x = startX + (index * 250); // Space players apart horizontally
                
                // Create player info text
                const playerText = scene.add.text(x, y, 
                    `${player.name}: ${player.blitzDeck} cards left`, {
                    fontSize: '24px',
                    fontFamily: 'Trebuchet MS',
                    color: '#d3af5e',
                    backgroundColor: '#015c32',
                    padding: { x: 10, y: 5 },
                    borderRadius: 5
                });
                
                // Add to tracking array for future updates
                this.playerTexts.push(playerText);
             }
            });
        }

        // Method to update player info
        this.update = (updatedPlayers) => {
            this.players = updatedPlayers;
            this.render();
        }

        this.destroy = () => {
            if (this.playerTexts) {
                this.playerTexts.forEach(text => text.destroy());
            }
        }





       
    }
}