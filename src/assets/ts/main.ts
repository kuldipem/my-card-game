const jquery = require('jquery');
const path = require('path');

import 'popper.js';
import 'bootstrap';
import '../js/jquery.flip.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../less/style.less';
import '../js/rAF.js';

import Card from './Card';
import Suit from './Suit';
import { SUITS, RANKS, IMAGES } from './constants';

const DEBUG = false;

let gameTimeOut: number,
    intervalRef: any,
    suites: Suit[],
    cards: Card[],
    givenIndexes: number[],
    flipCollection: any[],
    matchedPairs: Pair[],
    firstClickedCard: Card | null,
    secondClickedCard: Card | null,
    isFirstClicked: boolean,
    isShowAllClicked: boolean,
    isFlipClicked: boolean;

// it will create random unique index for each card 
// that will be used to bubble sort cards in random manner
let getRandomNumber = (min: number, max: number): number => {
    let random;
    do {
        random = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (givenIndexes.indexOf(random) > -1);
    givenIndexes.push(random);
    return random;
}

// this will bubble sort cards using index value
let bubbleSort = (cards: Card[], sortOn: string, callback?: any) => {
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < cards.length - 1; i++) {
            if (cards[i][sortOn] > cards[i + 1][sortOn]) {
                let temp = cards[i];
                cards[i] = cards[i + 1];
                cards[i + 1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
    callback && callback();
}

let createCards = (callback?: any) => {
    SUITS.forEach((suit, index) => {
        let suitObj = new Suit(suit.name, suit.symbol, suit.color);
        suites.push(suitObj);
        RANKS.forEach((rank, index) => {
            let card = new Card(rank.name, rank.symbol);
            card.setSuit(suitObj);
            cards.push(card);
        });
    });


    shuffleCards(cards, () => {
        shuffleCards(cards, () => {
            shuffleCards(cards, () => {
                cards.forEach((card: Card, index: number) => {
                    card.setIndex(getRandomNumber(0, 51));
                });
                bubbleSort(cards, 'index', () => {
                    injectSuitIntoDom('card-table', 13, callback);
                });
            });
        });
    });


}

let shuffleCards = (cards: Card[], callback?: any) => {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    callback && callback();
}

let injectSuitIntoDom = (domId: string, maxInRow: number = 13, callback?: any) => {

    let suitHtml = `<div class="row-fluid">`;
    let frontImg = IMAGES['front'];

    cards.forEach((card, index) => {

        if (index !== 0 && index % maxInRow === 0) {
            suitHtml += `</div><div class="row-fluid">`;
        }
        suitHtml += `<div class="col" data-id=${card.index}>
            <div class="card-box" data-id=${card.index}>
                <div class="front" data-id=${card.index}>
                    <img src="${frontImg}" alt="${card.getSuit().name}-${card.name}" />
                </div>
                <div class="back" data-id=${card.index}>
                    <img src="${card.getImage()}" alt="${card.getSuit().name}-${card.name}" />
                </div>
            </div>
        </div>`;

    });

    suitHtml += `</div>`;

    jquery(`#${domId}`).html(suitHtml).fadeIn();
    flipCollection = jquery(".card-box").flip({
        speed: 175,
        reverse: false,
        trigger: 'manual'
    });
    callback && callback();
}


jquery("#show-cards").on("click", (e: Event) => {
    hideSelected();
    flipMe(flipCollection, true, 0, () => { });
});

jquery("#flip-card").on("click", (e: Event) => {
    hideSelected();
    flipMe(flipCollection, 'toggle', 0, () => { });
});

jquery("#stop-game").on("click", (e: Event) => {
    showResult();
    stopGame();
});


let bindEvents = () => {
    jquery(".card-box").on("click", (e: Event) => {

        // if two cards are being selected
        // and showing back side, remain to 
        // hide the cards
        if (firstClickedCard !== null &&
            secondClickedCard !== null) {
            return true;
        }

        let box = jquery(e.target).parents('.card-box').first();
        let flip = jquery(box).data("flip-model");

        if (!jquery(box).hasClass('matched') &&
            flip.isFlipped) {
            alert('Please, Flip down all cards to select a card.');
            return true;
        }


        let index: number = jquery(box).attr('data-id');
        jquery(box).flip(true);

        if (isFirstClicked && firstClickedCard !== null) {
            secondClickedCard = cards[index];
            if (firstClickedCard.symbol === secondClickedCard.symbol) {
                addPair(firstClickedCard, secondClickedCard);
                resetStatus();
            } else {
                setTimeout(() => {
                    hideSelected();
                }, 1000);
            }

        } else {
            isFirstClicked = true;
            firstClickedCard = cards[index];
        }
    });
}


let resetStatus = () => {
    isFirstClicked = false;
    firstClickedCard = null;
    secondClickedCard = null;
}

let addPair = (first: Card, second: Card) => {
    jquery(`.card-box[data-id=${first.index}],
            .card-box[data-id=${second.index}]`).
        addClass('matched');
    matchedPairs.push({
        first: first,
        second: second
    });
}

let hideSelected = () => {
    if (firstClickedCard !== null) {
        jquery(`.card-box[data-id=${firstClickedCard.index}]`).flip(false, () => {
            if (secondClickedCard !== null) {
                jquery(`.card-box[data-id=${secondClickedCard.index}]`).flip(false, () => {
                    resetStatus();
                });
            } else {
                resetStatus();
            }

        });
    }
}

let flipMe = (collection: any, whatToDo: string | boolean, index: number = 0, callback?: any) => {
    if (collection.length > index) {
        // don't filp, if card is in matched pairs
        if (jquery(collection[index]).hasClass('matched')) {
            flipMe(collection, whatToDo, ++index, callback);
        } else {
            jquery(collection[index]).flip(whatToDo, () => {
                flipMe(collection, whatToDo, ++index, callback);
            });
        }

    } else {
        callback && callback();
    }
}

let resetTimer = () => {
    intervalRef && clearInterval(intervalRef);
    gameTimeOut = 60;
    jquery("#timer").hasClass('text-danger') &&
        jquery("#timer").removeClass('text-danger');
    jquery("#timer").html(gameTimeOut);
}
let startTimer = () => {
    intervalRef = setInterval(() => {
        gameTimeOut = gameTimeOut - 1;
        jquery("#timer").html(gameTimeOut);
        if (gameTimeOut <= 10) {
            jquery("#timer").addClass('text-danger');
        }
        if (gameTimeOut === 0) {
            clearInterval(intervalRef);
            showResult();
        }
    }, 1000);
}

let showResult = () => {
    let result = '';
    if (matchedPairs.length > 1) {
        result = `You have found ${matchedPairs.length} pair :\n\n`;
    } else {
        result = `You have found ${matchedPairs.length} pairs :\n\n`;
    }
    matchedPairs.forEach((pair: Pair, index: number) => {
        result += `${titleCase(pair.first.getSuit().name)}-${titleCase(pair.first.name)}`;
        result += ` -- `;
        result += `${titleCase(pair.second.getSuit().name)}-${titleCase(pair.second.name)}\n`;
    });
    alert(result);
    startGame();
}

type Pair = {
    first: Card,
    second: Card
};

let titleCase = (word: string) => {
    return [word.charAt(0).toUpperCase(), word.substr(1)].join('');
}

let stopGame = () => {
    gameTimeOut = 60;
    suites = new Array<Suit>();
    cards = new Array<Card>();
    givenIndexes = new Array<number>();
    flipCollection = [];
    matchedPairs = [];
    firstClickedCard = null;
    secondClickedCard = null;
    isFirstClicked = false;
    isFlipClicked = false;
    isShowAllClicked = false;
    resetTimer();
    //startTimer();
    createCards(() => {
        //bindEvents();
    });
}
let startGame = () => {
    gameTimeOut = 60;
    suites = new Array<Suit>();
    cards = new Array<Card>();
    givenIndexes = new Array<number>();
    flipCollection = [];
    matchedPairs = [];
    firstClickedCard = null;
    secondClickedCard = null;
    isFirstClicked = false;
    isFlipClicked = false;
    isShowAllClicked = false;
    resetTimer();
    startTimer();
    createCards(() => {
        bindEvents();
    });
}

startGame();




