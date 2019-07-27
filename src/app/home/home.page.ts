import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Http } from '@angular/http';

import {
  Direction,
  StackConfig,
  Stack,
  Card,
  ThrowEvent,
  DragEvent,
  SwingStackComponent,
  SwingCardComponent
} from 'angular2-swing';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('myswing1') swingStack: SwingStackComponent;
  @ViewChildren('mycards1') swingCards: QueryList<SwingCardComponent>;

  cards: Array<number>;
  stackConfig: StackConfig;
  recentCard: string = '';
  count = 0;

  constructor(private http: Http) {
    this.stackConfig = {
      throwOutConfidence: (offsetX, offsetY, element) => {
        return Math.min(Math.abs(offsetX) / (element.offsetWidth / 2), 1);
      },
      transform: (element, x, y, r) => {
        this.onItemMove(element, x, y, r);
      },
      throwOutDistance: (d) => {
        return 500;
      }
    };
  }

  ngAfterViewInit() {
    // Either subscribe in controller or set in HTML
    // this.swingStack.throwin.subscribe((event: DragEvent) => {
    //   event.target.style.background = '#ffffff';
    // });

    this.cards = [1, 2, 3];
  }

  // Called whenever we drag an element
  onItemMove(element, x, y, r) {
    var color = '';
    var abs = Math.abs(x);
    let min = Math.trunc(Math.min(16 * 16 - abs, 16 * 16));
    let hexCode = this.decimalToHex(min, 2);

    if (x < 0) {
      color = '#FF' + hexCode + hexCode;
    } else {
      color = '#' + hexCode + 'FF' + hexCode;
    }

    element.style.background = color;
    element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }

  // Connected through HTML
  voteUp(like: boolean) {
    
    // this.addNewCards(1);
    this.count +=10 ;
    this.cards.pop();
    // this.cards.push(this.count);
    
    // this.cards.unshift(this.count);

    // this.cards = [5,6,7] ;
    // this.cards.unshift(this.count);

    console.log(this.cards.length)
    console.log(this.cards)
    console.log('s')
     
  }

  // Add new cards to our array
  addNewCards(count: number) {
    this.http.get('https://randomuser.me/api/?results=' + count)
      .subscribe(data => {
        let result = data.json().results
        for (let val of result) {
          this.cards.unshift(val);
        }
      });
  }

  // http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
      hex = "0" + hex;
    }

    return hex;
  }

  getCardClass(i) {
    if (i % 3 === 18) {
      return 'front-card'
    }
    else if (i % 3 === 12) {
      return 'middle-card'
    }
    else if (i % 3 === 6) {
      return 'back-card'
    }
  }

}
