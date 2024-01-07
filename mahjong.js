const socket = new WebSocket('ws://localhost:3000');

const cardImages = ["kazuha", "cyno", "nahida", "raiden", "wanderer", "xiao"];
const gameBoard = document.getElementById("game-board");
let selectedCards = [];
let matchedPairs = 0;

initializeGame();

function initializeGame() {
  shuffledCards = shuffle([...cardImages, ...cardImages]);

  for (let index = 0; index < shuffledCards.length; index++) {
    const imageName = shuffledCards[index];

    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-image", imageName);
    cardElement.addEventListener("click", () => flipCard(cardElement));

    gameBoard.appendChild(cardElement);
  }
}

function flipCard(card) {
  if (selectedCards.length < 2) {
    selectedCards.push(card);
    card.style.backgroundImage = `url("${card.dataset.image}.png")`;
  }

  if (selectedCards.length === 2) {
    setTimeout(() => {
      checkMatch();
      socket.send(JSON.stringify({ type: 'flip', cards: selectedCards.map(card => card.dataset.image) }));
    }, 1000);
  }
}

function checkMatch() {
  const [card1, card2] = selectedCards;

  if (card1.dataset.image === card2.dataset.image) {
    card1.removeEventListener("click", () => flipCard(card1));
    card2.removeEventListener("click", () => flipCard(card2));
    matchedPairs++;

    if (matchedPairs === cardImages.length) {
      alert("Congratulations");
    }

    card1.style.backgroundImage = `url("${card1.dataset.image}.gif")`;
    card2.style.backgroundImage = `url("${card2.dataset.image}.gif")`;
  } else {
    card1.style.backgroundImage = 'url("back.png")';
    card2.style.backgroundImage = 'url("back.png")';
  }

  selectedCards = [];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function resetGame() {
  gameBoard.innerHTML = '';
  initializeGame();
}

// listen for messages from the other player
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'flip') {
    const [card1, card2] = document.querySelectorAll(`[data-image="${data.cards[0]}"], [data-image="${data.cards[1]}"]`);
    flipCard(card1);
    flipCard(card2);
  }
});
