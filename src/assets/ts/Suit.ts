import Card from "./Card";

export default class Suit {
    public name: string;    
    public symbol: string;
    public color: string;
    public cards: Card[];

    public constructor(name: string,symbol:string,color:string) {
        this.name = name;
        this.color=color;
        this.symbol=symbol;
    }

    public add(card: Card): Suit {
        this.cards.push(card);
        card.setSuit(this);
        return  this;
    }
}
