import React, { Component } from 'react'
// import _ from 'lodash'
import Inner from './Inner';
import { RightControl } from './RightControl';
import { LeftControl } from './LeftControl';
import styles from './styles';




/*

  ### TO-DO ###
                                              O = loaded. X = not loaded. | | = visibility boundaries.

  CURRENT: make christiaan's sliding functionality (this.props.ultraMode=true). -->  X O | O O O | O X X X   


  increase the index at which components get mounted on touchMove. (DONE)
  QOL: increase onMouseMove area so whitespace can slide as well. (DONE)
  QOL: make last tile actually the last tile to where you can slide. (DONE)
  QOL: re-adjust tile alignmnent so they fit perfectly in container when onMouseUp fired (so when done sliding with mouse/touch);
  QOL: add smooth slide. (use goTile on end of touchmove and get next active offsetLeft?)
  QOL: add laptop sliding support.
  refractor (SEMI-IMPORTANT)

  BUG: active not applied to last but one before last tile when you drag to end with mousemove
  -------------------

  ~features~
  ULTRAMODE.
  add onTouchMove handler for mobile devices. (IMPORTANT) (DONE)
  recalc on resize. (IMPORTANT) (DONE)(with applying offsetLeft of activeTile instead of recalculating transform based on percentage)

  ## THOUGHT BUBBLE ##
  maybe combine isClickSlideable with isTouchSlideable..
*/

function extractMatrix(matrix, property) {

  const array = matrix.split(',');
  
  if(property === 'x') {
    const x = array[ array.length - 2 ]
    return (+x);
  }

  if(property === 'y') {
    const y = array[ array.length - 1 ]
    return (+y);
  }
}

// function percentage(oldInt, newInt, modifier) {
//   const change = oldInt - newInt;
//   if( modifier === 1) {

//     return Math.abs((change / oldInt) * 100);
//   }
//   else {
//     return (change / oldInt ) * 100 * -1;
//   }
// }


export class Carousel extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      mounted: false,
      endIndex: this.props.tilesToShow,
      activeIndex: 0,
      startRenderIndex: 0,
      endRenderIndex: 0,
      formattedChildren: null,
      changesCounter: 0
    }

    this.mouseMoveStart = null;
    this.touchStart = null;
    this.prevInnerWidth = window.innerWidth;
    this.originalSize = null;
  }

  get carousel() {
    return document.querySelector('.carousel');
  }

  get inner() {
    return document.querySelector('.inner')
  }

  get tiles() {
    return document.querySelectorAll('.tile');
  }

  get activeTile() {
    return this.inner.querySelector('.active');
  }

  get nextTile() {
    if(this.activeTile) {
      return this.activeTile.nextElementSibling;
    }
  }

  get prevTile() {
    if(this.activeTile) {
      return this.activeTile.previousElementSibling;
    } 
  }

  set activeTile(nextTile) {
    Array.from(this.tiles).map(tile => (
      tile.classList.remove('active')
    ))
    nextTile.classList.add('active');


    const value = (+this.activeTile.dataset.index) + (+this.props.tilesToShow);
    const startIndex = 0;

    this.setState({ 
      endIndex: value, 
      changesCounter: this.state.changesCounter + 1,
      activeIndex: +nextTile.dataset.index 
    })
  }

  componentDidMount() {
    this.setState({ 
      mounted: true, 
      formattedChildren: this.formatChildren() 
    })
  }
 
  componentDidUpdate(prevProps, prevState, snapshot) {

    // on resize we reformat children.
    if(prevState.formattedChildren !== this.state.formattedChildren) {
      this.inner.style.transform = `matrix(1,0,0,1,${-this.activeTile.offsetLeft},0)`;      
    }

    if(prevState.mounted !== this.state.mounted) {
      this.inner.addEventListener('touchmove', this.onTouchMove)
      this.inner.addEventListener('touchstart', this.onTouchStart)
      this.inner.addEventListener('touchend', this.onTouchEnd);
      this.carousel.addEventListener('mousemove', this.onMouseMove)
      this.inner.addEventListener('mousedown', this.onMouseDown)
      this.inner.addEventListener('mouseleave', this.onMouseLeave)
      window.addEventListener('mouseup', this.onMouseUp)
      window.addEventListener('resize', this.onResize)
    }
  }
  
  componentWillUnmount() {
    this.inner.removeEventListener('touchmove', this.onTouchMove)
    this.inner.removeEventListener('touchstart', this.onTouchStart)
    this.inner.removeEventListener('touchend', this.onTouchEnd)    
    this.carousel.removeEventListener('mousemove', this.onMouseMove)
    this.inner.removeEventListener('mousedown', this.onMouseDown)
    this.inner.removeEventListener('mouseleave', this.onMouseLeave)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('resize', this.onResize)
  }


  onResize = (e) => {
    this.setState({formattedChildren: this.formatChildren()})
  }

  onMouseLeave = (e) => {

  }

  onMouseDown = (e) => {

  }

  onMouseUp = (e) => {
    this.mouseMoveStart = 0;
  }

  calcActiveTile() { 
    const matrixX = extractMatrix(this.inner.style.transform, 'x');
    // console.log(`maxtrixX of inner is: ${Math.abs(matrixX)}`)
    // console.log(`activeTile (${this.activeTile.dataset.index}) offsetLeft:  ${this.activeTile.offsetLeft}, width: ${this.activeTile.clientWidth}`)
    // console.log('sum: ', (this.activeTile.offsetLeft + this.activeTile.clientWidth))
    
    if( Math.abs(matrixX) >= (this.activeTile.offsetLeft + this.activeTile.clientWidth) ) {
      this.activeTile = this.nextTile;
    }

    else if ( Math.abs(matrixX) < this.activeTile.offsetLeft ) {
      this.activeTile = this.prevTile;
    }

  }
  
  onMouseMove = (e) => {
    
    if(e.buttons === 0) {
      return null;
    }

    if(!this.mouseMoveStart) {
      this.mouseMoveStart = e.clientX;
    }

    const x = {
      clientX: e.clientX,
      prevTransition: window.getComputedStyle(this.inner).transition,
      matrix: window.getComputedStyle(this.inner).transform,
      mouseMoveStart: this.mouseMoveStart,
      tileWidth: this.calcWidth(),
      get moveAmount() {
        return (this.mouseMoveStart - this.clientX);
      },
      get matrixX() {
        return extractMatrix(this.matrix, 'x')
      },
      get nextMatrixX() {
        return (this.matrixX - this.moveAmount)
      },
    }

    this.inner.style.transition = `all 0s ease`;
    const area = this.calcTouchArea(x);

    if(area === 'leftEnd') {
      this.inner.style.transform = `matrix(1,0,0,1,0,0)`; // snap to start.
    }
    
    else if ( area === 'rightEnd') {
      const val = this.inner.clientWidth - x.tileWidth * (this.props.tilesToShow ); 
      this.inner.style.transform = `matrix(1,0,0,1,${-val - 1},0)`; // snap to end; -1 to ensure active is end. 
    }
    
    else if (area === 'slide') {
      this.inner.style.transform = `matrix(1,0,0,1,${x.nextMatrixX},0)`;
      this.touchStart = x.clientX;
    }

    else {
      throw new Error ('this.calcTouchArea has not returnd "leftEnd" "rightEnd" or "slide"');
    }

    setTimeout(() => {
      this.inner.style.transition = x.prevTransition;
      this.mouseMoveStart = e.clientX;
      this.calcActiveTile(); 
    })
  }

  onTouchStart = (e) => {
    // this.touchStart = e.touches[0].clientX
    this.touchStart = e.touches[0].clientX;
  }


  calcTouchArea({nextMatrixX, prevTransition, tileWidth}) {
    if(nextMatrixX >= 0) {
      return 'leftEnd';
    }
    // tileWidth * 3 is dirty hack. Must be * tilesToShow. 
    else if (this.inner.clientWidth + nextMatrixX <= tileWidth * (this.props.tilesToShow) ) {
      return 'rightEnd';
    }
    else {
      return 'slide';
    }
  }

  restoreTransition(transition) {
    setTimeout(() => {
      this.inner.style.transition = transition;
    })
  }


  onTouchMove = (e) => {
    const x = {
      clientX: (+e.touches[0].clientX),
      prevTransition: window.getComputedStyle(this.inner).transition,
      matrix: window.getComputedStyle(this.inner).transform,
      touchStart: this.touchStart,
      tileWidth: this.calcWidth(),
      get moveAmount() {
        return (this.touchStart - this.clientX);
      },
      get matrixX() {
        return extractMatrix(this.matrix, 'x')
      },
      get nextMatrixX() {
        return (this.matrixX - this.moveAmount)
      },
    }

    this.inner.style.transition = `all 0s ease`;
    const area = this.calcTouchArea(x);

    if(area === 'leftEnd') {
      this.inner.style.transform = `matrix(1,0,0,1,0,0)`; // snap to start.
    }
    
    else if ( area === 'rightEnd') {
      const val = this.inner.clientWidth - x.tileWidth * (this.props.tilesToShow ); 
      this.inner.style.transform = `matrix(1,0,0,1,${-val - 1},0)`; // snap to end; -1 to ensure active is end. 
      //                                                               MAYBE MANUALLY SET ACTIVE TILE ?
    }
    
    else if (area === 'slide') {
      this.inner.style.transform = `matrix(1,0,0,1,${x.nextMatrixX},0)`;
      this.touchStart = x.clientX;
    }

    else {
      throw new Error ('this.calcTouchArea has not returnd "leftEnd" "rightEnd" or "slide"');
    }

    setTimeout(() => {
      this.inner.style.transition = x.prevTransition;
      this.calcActiveTile(); 
      // this.goTile(this.activeTile);     
    })


  }

  onTouchEnd = (e) => {
    // this.restoreTransition(x.prevTransition);
  }


  onLeftClick = (e) => {

    if(this.props.ultraMode) {
      
    }

    if ( this.isClickSlideable('left') ) {
      this.activeTile = this.prevTile;
      this.goTile(this.activeTile);
    }
  }

  onRightClick = (e) => {

    if(this.props.ultraMode) {

    }

    if(this.isClickSlideable('right')) {
      this.activeTile = this.nextTile;
      this.goTile(this.activeTile);
    } 
  }

  formatChildren() {
    return this.props.children.map(
      (child, index) => (
        <li key={child.key} 
            data-index={index} 
            className = {index === 0 ? 'tile active' : 'tile'} 
            style={styles({tileWidth: this.calcWidth()}).tile}>
          {child}
        </li>
      )
    )
  }

  isClickSlideable(direction) {
    const currentIndex = this.activeTile.dataset.index;
    const lastIndex = this.state.formattedChildren.length;
    
    if(direction === 'right') {

      if(!this.nextTile ) {
        return false;
      }
 
      else if (lastIndex === (+this.nextTile.dataset.index) + 1) {
        return false;
      }
      
      else if( ((+currentIndex) + (+this.props.tilesToShow)) >=  lastIndex) {
        return false;
      } 

      else {
        return true;
      }
    }

    if (direction === 'left') {
      if(!this.prevTile) {
        return false;
      } 
      else {
        return true;
      }
    } 

    else {
      throw new Error('please pass direction of "right" or "left"')
    }
  }



  goTile(tile) {
    const offsetLeft = tile.offsetLeft;
    this.inner.style.transform = `matrix(1,0,0,1,${-offsetLeft},0)`;
  }
  
  calcWidth() {
    return (this.carousel.clientWidth / this.props.tilesToShow)
  }

  render() {
    const { 
      tilesToShow,
      slideDuration,
      easing,
      className, 
      ultraMode,
      infiniteScroll,
      ...props
    } = this.props;

    const {
      endIndex,
      activeIndex
    } = this.state;

    return (
      <div {...props} className={`carousel ${className}`}>
        <LeftControl onClick={this.onLeftClick} />
        {this.state.mounted && 
        <Inner 
          tilesToShow={tilesToShow}
          slideDuration={slideDuration}
          endIndex={endIndex}
          activeIndex={activeIndex}
          easing={easing}> 
            {this.state.formattedChildren}
          </Inner>}
        <RightControl onClick={this.onRightClick} />
      </div>
    )
  }
}

export default Carousel


  // onMouseMove = e => {
    // if(e.buttons === 1 || e.buttons === 2) {

    //   if(!this.mouseMoveStart) {
    //     this.mouseMoveStart = e.clientX;
    //   }
    //   const prevTransition = this.inner.style.transition;

    //   this.inner.style.transition = 'all 0s ease';
    //   const matrix = window.getComputedStyle(this.inner).transform;
      
    //   const moveAmount = (this.mouseMoveStart - e.clientX)

    //   const prevMatrixX = extractMatrix(matrix, 'x');
    //   const nextMatrixX = (+prevMatrixX) - (+moveAmount * 1);
    //   if(nextMatrixX >= 0) {
    //     this.inner.style.transform = `matrix(1,0,0,1,0,0)`;
    //     setTimeout(() =>{
    //       this.inner.style.transition = prevTransition;
    //     })
    //     return;
    //   } 
    //   if ( (this.inner.clientWidth + nextMatrixX) <= this.calcWidth() * this.props.tilesToShow ) {
    //     const val = this.inner.clientWidth - this.calcWidth() * this.props.tilesToShow;
    //     this.inner.style.transform = `matrix(1,0,0,1,${-val - 1},0)`; // -1 is to ensure active tile is set properly.
    //   //                                                               MAYBE MANUALLY SET ACTIVE TILE ?
        
    //     // this.calcActiveTile(); 
    //     // this.activeTile = this.nextTile;       
    //     setTimeout(() =>{
    //       this.inner.style.transition = prevTransition;
    //     })
    //     return;
    //   }
    //   this.inner.style.transform = `matrix(1,0,0,1,${nextMatrixX},0)`;
    //   this.mouseMoveStart = e.clientX;
    //   this.calcActiveTile();
    //   setTimeout(() =>{
    //     this.inner.style.transition = prevTransition;
    //   })
    // }

  // }

  // onTouchMove = (e) => {

  //   const { clientX } = e.touches[0];
  //   const prevTransition = this.inner.style.transition;
  //   this.inner.style.transition = 'all 0s ease';
  //   const matrix = window.getComputedStyle(this.inner).transform;
  //   const moveAmount = (this.touchStart - clientX);
  //   const prevMatrixX = extractMatrix(matrix, 'x');
  //   const nextMatrixX = (+prevMatrixX) - (+moveAmount * 1);
    
  //   if(nextMatrixX >= 0) {
  //     this.inner.style.transform = `matrix(1,0,0,1,0,0)`;
  //     setTimeout(() =>{
  //       this.inner.style.transition = prevTransition;
  //     })
  //     return;
  //   }

  //   if ( (this.inner.clientWidth + nextMatrixX) <= this.calcWidth() * 3 ) {
  //     const val = this.inner.clientWidth - this.calcWidth() * 3;
  //     this.inner.style.transform = `matrix(1,0,0,1,${-val},0)`;
  //     setTimeout(() =>{
  //       this.inner.style.transition = prevTransition;
  //     })
  //     return;
  //   }
    
  //   this.inner.style.transform = `matrix(1,0,0,1,${nextMatrixX},0)`;
  //   this.touchStart = clientX;
  //   this.calcActiveTile();
  //   setTimeout(() =>{
  //     this.inner.style.transition = prevTransition;
  //   })
  // }