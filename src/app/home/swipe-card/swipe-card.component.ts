import { Component, OnInit } from '@angular/core';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'swipe-card',
  templateUrl: './swipe-card.component.html',
  styleUrls: ['./swipe-card.component.scss'],
})
export class SwipeCardComponent implements OnInit {
  stackedOptions = 'Top'; //Change stacked cards view from 'Bottom', 'Top' or 'None'.
  rotate = true; //Activate the elements' rotation for each move on stacked cards.
  items = 3; //Number of visible elements when the stacked options are bottom or top.
  elementsMargin = 10; //Define the distance of each element when the stacked options are bottom or top.
  useOverlays = true; //Enable or disable the overlays for swipe elements.
  maxElements; //Total of stacked cards on DOM.
  currentPosition = 0; //Keep the position of active stacked card.
  velocity = 0.3; //Minimum velocity allowed to trigger a swipe.
  topObj; //Keep the swipe top properties.
  rightObj; //Keep the swipe right properties.
  leftObj; //Keep the swipe left properties.
  listElNodesObj; //Keep the list of nodes from stacked cards.
  listElNodesWidth; //Keep the stacked cards width.
  currentElementObj; //Keep the stacked card element to swipe.
  stackedCardsObj;
  isFirstTime = true;
  elementHeight;
  @ViewChild('stacked_cards_block') obj: ElementRef;
  elTrans;
  //Touch events block
  element;
  startTime;
  startX;
  startY;
  translateX;
  translateY;
  currentX;
  currentY;
  touchingElement = false;
  timeTaken;
  topOpacity;
  rightOpacity;
  leftOpacity;


  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    // this.obj = document.getElementById('stacked-cards-block');
    this.element = this.obj;
    this.stackedCardsObj = this.obj.nativeElement.querySelector('.stackedcards-container');
    this.listElNodesObj = this.stackedCardsObj.children;

    this.topObj = this.obj.nativeElement.querySelector('.stackedcards-overlay.top');
    this.rightObj = this.obj.nativeElement.querySelector('.stackedcards-overlay.right');
    this.leftObj = this.obj.nativeElement.querySelector('.stackedcards-overlay.left');
    this.countElements();
    this.currentElement();
    this.listElNodesWidth = this.stackedCardsObj.offsetWidth;
    this.currentElementObj = this.listElNodesObj[0];
    this.updateUi();

    //Prepare elements on DOM
    let addMargin = this.elementsMargin * (this.items - 1) + 'px';

    if (this.stackedOptions === "Top") {

      for (let i = this.items; i < this.maxElements; i++) {
        this.listElNodesObj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');
      }

      this.elTrans = this.elementsMargin * (this.items - 1);

      this.stackedCardsObj.style.marginBottom = addMargin;

    } else if (this.stackedOptions === "Bottom") {


      for (let i = this.items; i < this.maxElements; i++) {
        this.listElNodesObj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');
      }

      this.elTrans = 0;

      this.stackedCardsObj.style.marginBottom = addMargin;

    } else if (this.stackedOptions === "None") {

      for (let i = this.items; i < this.maxElements; i++) {
        this.listElNodesObj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
      }

      this.elTrans = 0;

    }

    for (let i = this.items; i < this.maxElements; i++) {
      this.listElNodesObj[i].style.zIndex = 0;
      this.listElNodesObj[i].style.opacity = 0;
      this.listElNodesObj[i].style.webkitTransform = 'scale(' + (1 - (this.items * 0.04)) + ') translateX(0) translateY(' + this.elTrans + 'px) translateZ(0)';
      this.listElNodesObj[i].style.transform = 'scale(' + (1 - (this.items * 0.04)) + ') translateX(0) translateY(' + this.elTrans + 'px) translateZ(0)';
    }

    if (this.listElNodesObj[this.currentPosition]) {
      this.listElNodesObj[this.currentPosition].classList.add('stackedcards-active');
    }

    if (this.useOverlays) {
      this.leftObj.style.transform = 'translateX(0px) translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';
      this.leftObj.style.webkitTransform = 'translateX(0px) translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';

      this.rightObj.style.transform = 'translateX(0px) translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';
      this.rightObj.style.webkitTransform = 'translateX(0px) translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';

      this.topObj.style.transform = 'translateX(0px) translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';
      this.topObj.style.webkitTransform = 'translateX(0px) translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';

    } else {
      this.leftObj.className = '';
      this.rightObj.className = '';
      this.topObj.className = '';

      this.leftObj.classList.add('stackedcards-overlay-hidden');
      this.rightObj.classList.add('stackedcards-overlay-hidden');
      this.topObj.classList.add('stackedcards-overlay-hidden');
    }

    //Remove class init
    setTimeout(() => {

      this.obj.nativeElement.classList.remove('init');
    }, 150);


    this.element.nativeElement.addEventListener('touchstart', this.gestureStart.bind(this), false);
    this.element.nativeElement.addEventListener('touchmove', this.gestureMove.bind(this), false);
    this.element.nativeElement.addEventListener('touchend', this.gestureEnd.bind(this), false);

    //Add listeners to call global action for swipe cards
    var buttonLeft = document.querySelector('.left-action');
    var buttonTop = document.querySelector('.top-action');
    var buttonRight = document.querySelector('.right-action');

    buttonLeft.addEventListener('click', this.onActionLeft.bind(this), false);
    buttonTop.addEventListener('click', this.onActionTop.bind(this), false);
    buttonRight.addEventListener('click', this.onActionRight.bind(this), false);


  }



  backToMiddle() {

    this.removeNoTransition();
    this.transformUi(0, 0, 1, this.currentElementObj);

    if (this.useOverlays) {
      this.transformUi(0, 0, 0, this.leftObj);
      this.transformUi(0, 0, 0, this.rightObj);
      this.transformUi(0, 0, 0, this.topObj);
    }

    this.setZindex(5);

    if (!(this.currentPosition >= this.maxElements)) {
      //roll back the opacity of second element
      if ((this.currentPosition + 1) < this.maxElements) {
        this.listElNodesObj[this.currentPosition + 1].style.opacity = '.8';
      }
    }
  }

  // Usable functions
  countElements() {
    this.maxElements = this.listElNodesObj.length;
    if (this.items > this.maxElements) {
      this.items = this.maxElements;
    }
  };

  //Keep the active card.
  currentElement() {
    this.currentElementObj = this.listElNodesObj[this.currentPosition];
  };

  //Functions to swipe left elements on logic external action.
  onActionLeft() {
    if (!(this.currentPosition >= this.maxElements)) {
      if (this.useOverlays) {
        this.leftObj.classList.remove('no-transition');
        this.topObj.classList.remove('no-transition');
        this.leftObj.style.zIndex = '8';
        this.transformUi(0, 0, 1, this.leftObj);

      }

      setTimeout(() => {
        this.onSwipeLeft();
        this.resetOverlayLeft();
      }, 300);
    }
  };

  //Functions to swipe right elements on logic external action.
  onActionRight() {
    if (!(this.currentPosition >= this.maxElements)) {
      if (this.useOverlays) {
        this.rightObj.classList.remove('no-transition');
        this.topObj.classList.remove('no-transition');
        this.rightObj.style.zIndex = '8';
        this.transformUi(0, 0, 1, this.rightObj);
      }

      setTimeout(() => {
        this.onSwipeRight();
        this.resetOverlayRight();
      }, 300);
    }
  };

  //Functions to swipe top elements on logic external action.
  onActionTop() {
    if (!(this.currentPosition >= this.maxElements)) {
      if (this.useOverlays) {
        this.leftObj.classList.remove('no-transition');
        this.rightObj.classList.remove('no-transition');
        this.topObj.classList.remove('no-transition');
        this.topObj.style.zIndex = '8';
        this.transformUi(0, 0, 1, this.topObj);
      }

      setTimeout(() => {
        this.onSwipeTop();
        this.resetOverlays();
      }, 300); //wait animations end
    }
  };

  //Swipe active card to left.
  onSwipeLeft() {
    this.removeNoTransition();
    this.transformUi(-1000, 0, 0, this.currentElementObj);
    if (this.useOverlays) {
      this.transformUi(-1000, 0, 0, this.leftObj); //Move leftOverlay
      this.transformUi(-1000, 0, 0, this.topObj); //Move topOverlay
      this.resetOverlayLeft();
    }
    this.currentPosition = this.currentPosition + 1;
    this.updateUi();
    this.currentElement();
    this.setActiveHidden();
  };

  //Swipe active card to right.
  onSwipeRight() {
    this.removeNoTransition();
    this.transformUi(1000, 0, 0, this.currentElementObj);
    if (this.useOverlays) {
      this.transformUi(1000, 0, 0, this.rightObj); //Move rightOverlay
      this.transformUi(1000, 0, 0, this.topObj); //Move topOverlay
      this.resetOverlayRight();
    }

    this.currentPosition = this.currentPosition + 1;
    this.updateUi();
    this.currentElement();
    this.setActiveHidden();
  };

  //Swipe active card to top.
  onSwipeTop() {
    this.removeNoTransition();
    this.transformUi(0, -1000, 0, this.currentElementObj);
    if (this.useOverlays) {
      this.transformUi(0, -1000, 0, this.leftObj); //Move leftOverlay
      this.transformUi(0, -1000, 0, this.rightObj); //Move rightOverlay
      this.transformUi(0, -1000, 0, this.topObj); //Move topOverlay
      this.resetOverlays();
    }

    this.currentPosition = this.currentPosition + 1;
    this.updateUi();
    this.currentElement();
    this.setActiveHidden();
  };

  //Remove transitions from all elements to be moved in each swipe movement to improve perfomance of stacked cards.
  removeNoTransition() {
    if (this.listElNodesObj[this.currentPosition]) {

      if (this.useOverlays) {
        this.leftObj.classList.remove('no-transition');
        this.rightObj.classList.remove('no-transition');
        this.topObj.classList.remove('no-transition');
      }

      this.listElNodesObj[this.currentPosition].classList.remove('no-transition');
      this.listElNodesObj[this.currentPosition].style.zIndex = 6;
    }

  };

  //Move the overlay left to initial position.
  resetOverlayLeft() {
    if (!(this.currentPosition >= this.maxElements)) {
      if (this.useOverlays) {
        setTimeout(() => {

          if (this.stackedOptions === "Top") {

            this.elTrans = this.elementsMargin * (this.items - 1);

          } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

            this.elTrans = 0;

          }

          if (!this.isFirstTime) {
            this.leftObj.classList.add('no-transition');
            this.topObj.classList.add('no-transition');
          }

          requestAnimationFrame(() => {

            this.leftObj.style.transform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.leftObj.style.webkitTransform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.leftObj.style.opacity = '0';

            this.topObj.style.transform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.topObj.style.webkitTransform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.topObj.style.opacity = '0';

          });

        }, 300);

        this.isFirstTime = false;
      }
    }
  };

  //Move the overlay right to initial position.
  resetOverlayRight() {
    if (!(this.currentPosition >= this.maxElements)) {
      if (this.useOverlays) {
        setTimeout(() => {

          if (this.stackedOptions === "Top") {
            +2

            this.elTrans = this.elementsMargin * (this.items - 1);

          } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

            this.elTrans = 0;

          }

          if (!this.isFirstTime) {

            this.rightObj.classList.add('no-transition');
            this.topObj.classList.add('no-transition');

          }

          requestAnimationFrame(() => {

            this.rightObj.style.transform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.rightObj.style.webkitTransform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.rightObj.style.opacity = '0';

            this.topObj.style.transform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.topObj.style.webkitTransform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.topObj.style.opacity = '0';

          });

        }, 300);

        this.isFirstTime = false;
      }
    }
  };

  //Move the overlays to initial position.
  resetOverlays() {
    if (!(this.currentPosition >= this.maxElements)) {
      if (this.useOverlays) {

        setTimeout(() => {
          if (this.stackedOptions === "Top") {

            this.elTrans = this.elementsMargin * (this.items - 1);

          } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

            this.elTrans = 0;

          }

          if (!this.isFirstTime) {

            this.leftObj.classList.add('no-transition');
            this.rightObj.classList.add('no-transition');
            this.topObj.classList.add('no-transition');

          }

          requestAnimationFrame(() => {

            this.leftObj.style.transform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.leftObj.style.webkitTransform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.leftObj.style.opacity = '0';

            this.rightObj.style.transform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.rightObj.style.webkitTransform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.rightObj.style.opacity = '0';

            this.topObj.style.transform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.topObj.style.webkitTransform = "translateX(0) translateY(" + this.elTrans + "px) translateZ(0)";
            this.topObj.style.opacity = '0';

          });

        }, 300);	// wait for animations time

        this.isFirstTime = false;
      }
    }
  };

  setActiveHidden() {
    if (!(this.currentPosition >= this.maxElements)) {
      this.listElNodesObj[this.currentPosition - 1].classList.remove('stackedcards-active');
      this.listElNodesObj[this.currentPosition - 1].classList.add('stackedcards-hidden');
      this.listElNodesObj[this.currentPosition].classList.add('stackedcards-active');
    }
  };

  //Set the new z-index for specific card.
  setZindex(zIndex) {
    if (this.listElNodesObj[this.currentPosition]) {
      this.listElNodesObj[this.currentPosition].style.zIndex = zIndex;
    }
  };

  // Remove element from the DOM after swipe. To use this method you need to call this function in onSwipeLeft, onSwipeRight and onSwipeTop and put the method just above the variable 'currentPosition = currentPosition + 1'. 
  //On the actionsthis. onSwipeLeft, onSwipeRight and onSwipeTop you need to remove the currentPosition variable (currentPosition = currentPosition + 1) and the function setActiveHidden

  removeElement() {
    this.currentElementObj.remove();
    if (!(this.currentPosition >= this.maxElements)) {
      this.listElNodesObj[this.currentPosition].classList.add('stackedcards-active');
    }
  };

  //Add translate X and Y to active card for each frame.
  transformUi(moveX, moveY, opacity, elementObj) {
    const id = requestAnimationFrame(this.transformUi.bind(this));

    var element = elementObj;

    // Function to generate rotate value 
    function RotateRegulator(value) {
      if (value / 10 > 15) {
        return 15;
      }
      else if (value / 10 < -15) {
        return -15;
      }
      return value / 10;
    }

    if (this.rotate) {
      var rotateElement = RotateRegulator(moveX);
    } else {
      var rotateElement = 0;
    }

    if (this.stackedOptions === "Top") {
      this.elTrans = this.elementsMargin * (this.items - 1);
      if (element) {
        element.style.webkitTransform = "translateX(" + moveX + "px) translateY(" + (moveY + this.elTrans) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
        element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY + this.elTrans) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
        element.style.opacity = opacity;
      }
    } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

      if (element) {
        element.style.webkitTransform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
        element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
        element.style.opacity = opacity;
      }

    }

  };

  //Action to update all elements on the DOM for each stacked card.
  updateUi() {
    const id = requestAnimationFrame(this.updateUi.bind(this));
    this.elTrans = 0;
    var elZindex = 5;
    var elScale = 1;
    var elOpac = 1;
    var elTransTop = this.items;
    var elTransInc = this.elementsMargin;

    for (let i = this.currentPosition; i < (this.currentPosition + this.items); i++) {
      if (this.listElNodesObj[i]) {
        if (this.stackedOptions === "Top") {

          this.listElNodesObj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');

          if (this.useOverlays) {
            this.leftObj.classList.add('stackedcards-origin-top');
            this.rightObj.classList.add('stackedcards-origin-top');
            this.topObj.classList.add('stackedcards-origin-top');
          }

          this.elTrans = elTransInc * elTransTop;
          elTransTop--;

        } else if (this.stackedOptions === "Bottom") {
          this.listElNodesObj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');

          if (this.useOverlays) {
            this.leftObj.classList.add('stackedcards-origin-bottom');
            this.rightObj.classList.add('stackedcards-origin-bottom');
            this.topObj.classList.add('stackedcards-origin-bottom');
          }

          this.elTrans = this.elTrans + elTransInc;

        } else if (this.stackedOptions === "None") {

          this.listElNodesObj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
          this.elTrans = this.elTrans + elTransInc;

        }

        this.listElNodesObj[i].style.transform = 'scale(' + elScale + ') translateX(0) translateY(' + (this.elTrans - elTransInc) + 'px) translateZ(0)';
        this.listElNodesObj[i].style.webkitTransform = 'scale(' + elScale + ') translateX(0) translateY(' + (this.elTrans - elTransInc) + 'px) translateZ(0)';
        this.listElNodesObj[i].style.opacity = elOpac;
        this.listElNodesObj[i].style.zIndex = elZindex;

        elScale = elScale - 0.04;
        elOpac = elOpac - (1 / this.items);
        elZindex--;
      }
    }



  };



  setOverlayOpacity() {

    this.topOpacity = (((this.translateY + (this.elementHeight) / 2) / 100) * -1);
    this.rightOpacity = this.translateX / 100;
    this.leftOpacity = ((this.translateX / 100) * -1);


    if (this.topOpacity > 1) {
      this.topOpacity = 1;
    }

    if (this.rightOpacity > 1) {
      this.rightOpacity = 1;
    }

    if (this.leftOpacity > 1) {
      this.leftOpacity = 1;
    }
  };

  gestureStart(evt) {
    this.startTime = new Date().getTime();

    this.startX = evt.changedTouches[0].clientX;
    this.startY = evt.changedTouches[0].clientY;

    this.currentX = this.startX;
    this.currentY = this.startY;

    this.setOverlayOpacity();

    this.touchingElement = true;
    if (!(this.currentPosition >= this.maxElements)) {
      if (this.listElNodesObj[this.currentPosition]) {
        this.listElNodesObj[this.currentPosition].classList.add('no-transition');
        this.setZindex(6);

        if (this.useOverlays) {
          this.leftObj.classList.add('no-transition');
          this.rightObj.classList.add('no-transition');
          this.topObj.classList.add('no-transition');
        }

        if ((this.currentPosition + 1) < this.maxElements) {
          this.listElNodesObj[this.currentPosition + 1].style.opacity = '1';
        }

        this.elementHeight = this.listElNodesObj[this.currentPosition].offsetHeight / 3;
      }

    }

  };

  gestureMove(evt) {
    this.currentX = evt.changedTouches[0].pageX;
    this.currentY = evt.changedTouches[0].pageY;

    this.translateX = this.currentX - this.startX;
    this.translateY = this.currentY - this.startY;

    this.setOverlayOpacity();

    if (!(this.currentPosition >= this.maxElements)) {
      evt.preventDefault();
      this.transformUi(this.translateX, this.translateY, 1, this.currentElementObj);

      if (this.useOverlays) {
        this.transformUi(this.translateX, this.translateY, this.topOpacity, this.topObj);

        if (this.translateX < 0) {
          this.transformUi(this.translateX, this.translateY, this.leftOpacity, this.leftObj);
          this.transformUi(0, 0, 0, this.rightObj);

        } else if (this.translateX > 0) {
          this.transformUi(this.translateX, this.translateY, this.rightOpacity, this.rightObj);
          this.transformUi(0, 0, 0, this.leftObj);
        }

        if (this.useOverlays) {
          this.leftObj.style.zIndex = 8;
          this.rightObj.style.zIndex = 8;
          this.topObj.style.zIndex = 7;
        }

      }

    }

  };

  gestureEnd(evt) {

    if (!this.touchingElement) {
      return;
    }

    this.translateX = this.currentX - this.startX;
    this.translateY = this.currentY - this.startY;

    this.timeTaken = new Date().getTime() - this.startTime;

    this.touchingElement = false;

    if (!(this.currentPosition >= this.maxElements)) {
      if (this.translateY < (this.elementHeight * -1) && this.translateX > ((this.listElNodesWidth / 2) * -1) && this.translateX < (this.listElNodesWidth / 2)) {  //is Top?

        if (this.translateY < (this.elementHeight * -1) || (Math.abs(this.translateY) / this.timeTaken > this.velocity)) { // Did It Move To Top?
          this.onSwipeTop();
        } else {
          this.backToMiddle();
        }

      } else {

        if (this.translateX < 0) {
          if (this.translateX < ((this.listElNodesWidth / 2) * -1) || (Math.abs(this.translateX) / this.timeTaken > this.velocity)) { // Did It Move To Left?
            this.onSwipeLeft();
          } else {
            this.backToMiddle();
          }
        } else if (this.translateX > 0) {

          if (this.translateX > (this.listElNodesWidth / 2) && (Math.abs(this.translateX) / this.timeTaken > this.velocity)) { // Did It Move To Right?
            this.onSwipeRight();
          } else {
            this.backToMiddle();
          }

        }
      }
    }
  };




}
