import React, { Component } from 'react'
// import _ from 'lodash'
import Inner from './Inner';
import { RightControl } from './RightControl';
import { LeftControl } from './LeftControl';
import styles from './styles';






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
    this.dragging = false;

    this.carousel = React.createRef();
  }


  get inner() {
    return this.carousel.current.querySelector('.inner')
  }

  get tiles() {
    return this.carousel.current.querySelectorAll('.tile');
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

  set loopActiveTile(nextTile ){

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
    console.log('did mount')
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
      window.addEventListener('touchend', this.onTouchEnd);
      window.addEventListener('mousemove', this.onMouseMove)
      this.inner.addEventListener('mousedown', this.onMouseDown)
      window.addEventListener('mouseup', this.onMouseUp)
      this.inner.addEventListener('mouseleave', this.onMouseLeave)
      window.addEventListener('resize', this.onResize)
    }
  }
  
  componentWillUnmount() {
    this.inner.removeEventListener('touchmove', this.onTouchMove)
    this.inner.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('touchend', this.onTouchEnd)    
    this.inner.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mouseup', this.onMouseUp)
    this.inner.removeEventListener('mouseleave', this.onMouseLeave)
    window.removeEventListener('resize', this.onResize)
  }


  onResize = (e) => {
    this.setState({formattedChildren: this.formatChildren()})
  }

  onMouseLeave = (e) => {

  }

  onMouseDown = (e) => {
    this.dragging = true;
  }

  onMouseUp = (e) => {
    this.mouseMoveStart = 0;
    this.dragging = false;
  }

  calcActiveTile() { 
    const matrixX = extractMatrix(this.inner.style.transform, 'x');
    
    if( Math.abs(matrixX) >= (this.activeTile.offsetLeft + this.activeTile.clientWidth) ) {
      this.activeTile = this.nextTile;
    }

    else if ( Math.abs(matrixX) < this.activeTile.offsetLeft ) {
      this.activeTile = this.prevTile;
    }

  }
  
  onMouseMove = (e) => {
    
    if(e.buttons === 0 || !this.dragging) {
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
    this.touchStart = e.touches[0].clientX;
    this.dragging = true;
  }


  calcTouchArea({nextMatrixX, prevTransition, tileWidth}) {
    if(nextMatrixX >= 0) {
      return 'leftEnd';
    }
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
    this.dragging = false;
  }


  onLeftClick = (e) => {

    if(this.props.loopMode) {
      
    }

    if ( this.isClickSlideable('left') ) {
      this.activeTile = this.prevTile;
      this.goTile(this.activeTile);
    }
  }

  onRightClick = (e) => {

    // loopMODE:
    // activeTile always has to change on rightclick without any delays.
    // then transition => after transition dom update.

    if(this.props.loopMode) {
      if(this.isClickSlideable('right')) {
        this.activeTile = this.nextTile;
      }
    }

   else {
     if(this.isClickSlideable('right')) {
       this.activeTile = this.nextTile;
       this.goTile(this.activeTile);
      } 
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
    // console.log(lastIndex);


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

    if(this.props.loopMode) {
      // setTimeout(() => {
      //   const prevTransition = this.inner.style.transition;
      //   this.inner.style.transition = 'all 0s ease';
      //   this.inner.style.transform = `matrix(1,0,0,1,0,0)`;
      //   setTimeout(() => {
      //     this.inner.style.transition = prevTransition;
      //   }, 400)
      // },400)

    }

  }
  
  calcWidth() {
    return (this.carousel.current.clientWidth / this.props.tilesToShow)
  }

  render() {
    const { 
      tilesToShow,
      slideDuration,
      easing,
      className, 
      loopMode,
      infiniteScroll,
      children,
      ...props
    } = this.props;

    const {
      endIndex,
      activeIndex
    } = this.state;

    return (
      <div {...props} className={`carousel ${className}`} ref={this.carousel} style={styles().carousel}>
        <LeftControl 
        onClick={this.onLeftClick} 
        show={tilesToShow <= children.length} />
        {this.state.mounted && 
        <Inner
          style={styles().inner}
          tilesToShow={tilesToShow}
          slideDuration={slideDuration}
          endIndex={endIndex}
          activeIndex={activeIndex}
          loopMode={loopMode}
          easing={easing}> 
            {this.state.formattedChildren}
          </Inner>}
        <RightControl 
        onClick={this.onRightClick} 
        show={tilesToShow <= children.length} />
      </div>
    )
  }
}

export default Carousel

  // get carousel() {
  //   return document.querySelector('.carousel');
  // }

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