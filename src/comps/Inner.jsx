import React, { Component } from 'react'

export class Inner extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      maxIndex: this.props.endIndex,
      // startIndex: 0
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if ( nextProps.endIndex >= prevState.maxIndex ) {
      return {
        maxIndex: nextProps.endIndex
      }
    } else {
      return prevState
    }
  }

  get carousel() {
    return document.querySelector('.carousel');
  }

  get inner() {
    return document.querySelector('.inner');
  }

  get activeTile() {
    if(this.inner) {
      return this.inner.querySelector('.active');
    }
  }

  componentDidMount() {
    // console.log(this.activeTile);
    // console.log(this.activeTile.offsetLeft);
  }

  calcStartIndex() {

  }

  renderChildren() {
    const { 
      children,
      activeIndex,
      tilesToShow
     } = this.props;

     const {
       maxIndex,
      //  startIndex

     } = this.state;
     
     console.log(activeIndex)

    return children.slice(0, maxIndex + 1);
  }

  render() {
    // console.log(this.props)
    return (
      <div className='inner'>
        {this.renderChildren()}
      </div>
    )
  }
}

export default Inner;
