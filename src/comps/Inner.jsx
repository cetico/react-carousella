import React, { Component } from 'react';
import _ from '../utils/lodash.js';
import { extractMatrix } from '../utils/helpers'

export class Inner extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      index: 0,
      clientX: 0
    }
    this.inner = React.createRef();
  }


  get carousel() {
    return this.inner.current.parentElement;
  }

  get slides() {
    return this.inner.current.querySelectorAll('.slide');
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('inner getDerivedStateFromProps')
    if(nextProps.index !== prevState.index) {
      return {
        index: nextProps.index
      }
    }
    return prevState
  }


  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps.dragging !== true
  // }


  componentDidMount() {
    const {
      slideDuration,
      easing
    } = this.props;
    this.inner.current.style.transition = `transform ${slideDuration / 1000}s ${easing}`;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const first = _.first(this.slides)
    return {
      firstSlide: first,
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // need to detect if we swiped or clicked button and direction.. 
    console.log('inner componentDidUpdate');


    const inner = this.inner.current;
    const slideWidth = this.calcWidth();
    const transition = inner.style.transition;
    const direction = this.getDirection(prevState.index, this.state.index);
    const matrix = extractMatrix(inner, 'x');

    if(!this.props.dragging) {

      
      if(direction === 'next') {
        inner.style.transition = 'all 0s ease';
        inner.style.transform = 'translateX(0)';
        setTimeout(() => {
          inner.style.transition = transition;
          inner.style.transform = `translateX(-${slideWidth * this.props.slideAmount}px)`;
        })
      }
      else if (direction === 'prev' ) {
        
        if(this.state.index === 0) {
          inner.style.transform = `translateX(0)`;
        } 
        else {
          inner.style.transition = 'all 0s ease';
          inner.style.transform = `translateX(-${(slideWidth * this.props.slideAmount) * 2}px)`;
          
          setTimeout(() => {
            inner.style.transition = transition;
            inner.style.transform = `translateX(-${(slideWidth * this.props.slideAmount)}px)`;
          });
        }
      }
    }

    else if (this.props.dragging) {

      if(_.first(this.slides) !== snapshot.firstSlide) {
        inner.style.transition = 'all 0s ease';
        inner.style.transform = `matrix(1,0,0,1,${matrix + slideWidth},0)`;
          setTimeout(() => {
            inner.style.transition = transition;
        })
      }
    }
  }
 

  getDirection(prevIndex, currentIndex) {
    if ( prevIndex < currentIndex ) {
      return 'next'
    } 
    else if (prevIndex > currentIndex) {
      return 'prev'
    } else {
      return null
    }
  }


  calcWidth() {
    const width = this.carousel.clientWidth;
    const amount = this.props.slidesToShow;
    return (width / amount);
  }


  renderChildren() {
    const {
      slidesToShow,
      children
    } = this.props;


    return children.map((child, index) => {

      const fromIndex = this.state.index - slidesToShow;
      const toIndex   = this.state.index + (slidesToShow * 2);

      if (index < fromIndex || index > toIndex) {
        return null;
      }
      else {
        return child;
      }
    })
  }


  render() {
    return (
      <div
        onMouseMove={this.props.onMouseMove} 
        onTouchStart={this.props.onTouchStart}
        onTouchMove={this.props.onTouchMove}
        onTouchEnd={this.props.onTouchEnd}
        className='inner'
        ref={this.inner}>
          {this.renderChildren()}
      </div>
    )
  }
}


export default Inner