// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, set, ref, get, onValue } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSgC98WyfyXKkP91Lanbn3lLzsPXRZ-mM",
  authDomain: "dutch-blitz-online.firebaseapp.com",
  projectId: "dutch-blitz-online",
  storageBucket: "dutch-blitz-online.firebasestorage.app",
  messagingSenderId: "375835361971",
  appId: "1:375835361971:web:68cd49b27c2af61c1fe6c6",
  databaseURL: "https://dutch-blitz-online-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export async function signIn() {
  // Sign in logic here
  console.log("Sign in");
  let user = await signInAnonymously(auth);
  console.log("User signed in:", user);
  return user;
}

export async function createRoom(joinCode, userId, name, numberOfPlayers) {

  await set(ref(db, 'rooms/' + joinCode), {
    joinCode: joinCode,
    started: false,
    winner: "",
    stuckUsers: {},
    numberOfPlayers: numberOfPlayers,
    timeCreated: Date.now(),
    zones: {
      4: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 4
      },
      5: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 5
      },
      6: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 6
      },
      7: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 7
      },
      8: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 8
      },
      9: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 9
      },
      10: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 10
      },
      11: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 11
      },
      
    },
    users: {
      [userId]: {
        name: name,
        userId: userId,
        blitzDeck: 13,
        points: 0
      },
    },
  });
}

export async function joinRoom(joinCode, userId, name) {
  // Check if the room exists
  const roomRef = ref(db, 'rooms/' + joinCode);
  const roomSnapshot = await get(roomRef);
  if (roomSnapshot.exists()) {
    //get number of users in room
    console.log("Room exists");
    console.log(roomSnapshot.val());
    console.log(roomSnapshot.val().users);
    let usersArray = Object.values(roomSnapshot.val().users);
    if(usersArray.length >= roomSnapshot.val().numberOfPlayers) {
      console.log("Room is full");
      return "full";
    }
    if(roomSnapshot.val().started) {
      console.log("Room has already started");
      return "started";
    }
    // Room exists, add the user to the room
    await set(ref(db, 'rooms/' + joinCode + '/users/' + userId), {
      name: name,
      userId: userId,
      blitzDeck: 13,
      points: 0
    });
    return "success";
  } else {
    // Room does not exist, handle accordingly
    console.log("Room does not exist");
    return "DNE";
  }
}

export async function listenToRoom(joinCode, callback) {
  const roomRef = ref(db, 'rooms/' + joinCode);
  const roomSnapshot = await get(roomRef);
  if (roomSnapshot.exists()) {
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if(data == null) {
        window.location.reload();
        return;
      }
      callback(data);
    });
  } else {
    console.log("Room does not exist");
  }
}

export async function updateZone(joinCode, zoneId, zoneData) {
  console.log("Updating zone", zoneId, zoneData);
  let cardsData = zoneData.cardObjs.map((card) => {
    let cardObj = card.data.values.cardObj;
    let cardObjData = {
      number: cardObj.number,
      suit: cardObj.suit,
      showBack: cardObj.showBack != undefined ? cardObj.showBack : false,
      fromBlitzPile: cardObj.fromBlitzPile != undefined ? cardObj.fromBlitzPile : false,
      fromFlippedPile: cardObj.fromFlippedPile != undefined ? cardObj.fromFlippedPile : false,
      zoneId: cardObj.zoneId != undefined ? cardObj.zoneId : -1,
      zoneIndex: cardObj.zoneIndex != undefined ? cardObj.zoneIndex : -1,
      playedBy: cardObj.playedBy != undefined ? cardObj.playedBy : "",
    };
    return cardObjData;
  });
  console.log("Cards data", cardsData);
  console.log("Zone data", zoneData);
  console.log("LASTCard", cardsData[cardsData.length - 1]);
  await set(ref(db, 'rooms/' + joinCode + '/zones/' + zoneId), {
    suit: cardsData.length == 0 ? zoneData.suit : cardsData[cardsData.length - 1].suit,
    number: cardsData.length == 0 ? zoneData.number : cardsData[cardsData.length - 1].number,
    cards: zoneData.cards,
    cardObjs: cardsData,
    id: zoneId != undefined ? zoneId : -1,
  });
}

export async function updateUserDeck(joinCode, userId, deck) {
  await set(ref(db, 'rooms/' + joinCode + '/users/' + userId + '/blitzDeck'), deck);
}

export async function startGame(joinCode) {
  await set(ref(db, 'rooms/' + joinCode + '/started'), true);
}

export async function endRound(joinCode, winner, players) {
  let playersMap = {};
  players.forEach((player) => {
    playersMap[player.userId] = player;
  });
  const roomRef = ref(db, 'rooms/' + joinCode);
  const roomSnapshot = await get(roomRef);
  if (!roomSnapshot.exists()) {
    console.log("Room does not exist");
    return;
  }
  await set(ref(db, 'rooms/' + joinCode), {
    ...roomSnapshot.val(),  // Keep existing room data
    showLeaderboard: true,
    users: playersMap,
    winner: winner,
    zones:{
      4: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 4
      },
      5: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 5
      },
      6: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 6
      },
      7: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 7
      },
      8: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 8
      },
      9: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 9
      },
      10: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 10
      },
      11: {
        suit: "",
        number: 0,
        cards: 0,
        cardObjs: [],
        id: 11
      },
      
    }
  });
 


}

export async function startRoundFB(joinCode, players) {
  let playersMap = {};
  players.forEach((player) => {
    playersMap[player.userId] = player;
  });
  const roomRef = ref(db, 'rooms/' + joinCode);
  const roomSnapshot = await get(roomRef);
  if (!roomSnapshot.exists()) {
    console.log("Room does not exist");
    return;
  }
  await set(ref(db, 'rooms/' + joinCode), {
    ...roomSnapshot.val(),  // Keep existing room data
    showLeaderboard: false,
    users: playersMap,
    winner: "",
    stuckUsers: {}
  });

}

export async function deleteRoom(joinCode) {
  await set(ref(db, 'rooms/' + joinCode), null);
}

export async function setStuck(joinCode, userId){
  await set(ref(db, 'rooms/' + joinCode + '/stuckUsers/' + userId), true);
}

export async function clearStuck(joinCode){
  await set(ref(db, 'rooms/' + joinCode + '/stuckUsers'), null);
}

export async function removeStuck(joinCode, userId) {
  await set(ref(db, 'rooms/' + joinCode + '/stuckUsers/' + userId), null);
}

export async function endGameFB(joinCode) {
  await set(ref(db, 'rooms/' + joinCode + '/gameEnded'), true);

  setTimeout(() => {
    deleteRoom(joinCode);
  }
  , 2000);
}