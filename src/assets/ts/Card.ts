import { IMAGES } from './constants';
import Suit from "./Suit";

export default class Card{
   
    public name:string;
    public index: number;
    public symbol: string;
    private image: string;
    private suit: Suit;

    public constructor(name:string,symbol:string){
        this.name=name;
        this.symbol=symbol;
    }

    public setSuit(suit:Suit):Card{
        this.suit=suit;
        this.buildImageName();
        return this;
    }

    public setIndex(index:number):Card{
        this.index=index;
        return this;
    }

    private buildImageName():Card{
        let name=[this.suit.name,'-',this.symbol].join('');
        this.image=IMAGES[name];
        return this;
    }
    
    public getImage(): string {
       return this.image;
    }

    public getSuit(): Suit {
        return this.suit;
    }
}