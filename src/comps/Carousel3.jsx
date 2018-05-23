import React, { Component } from 'react';
import styled from 'styled-components';
import DefaultControls from './DefaultControls';

const Child = styled.li`
box-sizing: border-box;
overflow: hidden;
display: inline-block;
list-style: none;  
border: 1px solid salmon;
width: ${props => props.width}px; 
`

function formatChildren(children, width) {
  return children ? (Array.from(children).map((child, i) => (
    <Child key={child.key} className='slide' data-index={i} width={width}>
      {child}
    </Child>
  ))) : null
}

function extractMatrix(matrix, prop) {
  if(prop === 'x') {
    return matrix.split(',')[0]
  }
} 

export class Carousel extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      startClientX: 0,
      startLeft: 0,
      left: 0,
      startPhantomMoved: 0,
      phantomMoved: 0,
      
      index: 0,
      children: null,
      renderStart: 0,
      renderEnd: Math.min( this.props.children.length, this.props.slidesToShow * 2 ),
      
      mounted: false,
      dragging: false,
      slideWidth: 0,
    }

    this.transitioning = false;
    this.clickTimer = Date.now();

    this.outer = React.createRef();
    this.inner = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('derivedState')
    if(nextProps.children !== prevState.children && prevState.children !== null) {
      return {
        children: formatChildren(nextProps.children, prevState.slideWidth)
      }
    } else {
      return nextProps
    }
  } 

  static defaultProps = {
    controls: DefaultControls
  }

  componentDidMount() {
    const slideWidth = this.outer.current.clientWidth / this.props.slidesToShow;

    this.setState({
      mounted: true,
      children: formatChildren(
        this.props.children,
        slideWidth
      ),
      slideWidth: slideWidth,
    })
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return {
      inner: extractMatrix(window.getComputedStyle(this.inner.current).transform, 'x')
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('did update')
    if(!this.state.dragging) {
      if(prevState.renderStart !== this.state.renderStart 
        || prevState.renderEnd !== this.state.renderEnd
      ) {

        if(prevState.renderStart < this.state.renderStart || prevState.renderEnd < this.state.renderEnd) {
            console.log('updated to next.')
            const el = this.inner.current.querySelector(`[data-index="${this.state.index}"]`)
            this.setState({
              left: -el.offsetLeft,
              transition: true
            })
        } else if (prevState.renderStart > this.state.renderStart || prevState.renderEnd > this.state.renderEnd) {
          console.log('updated to prev.')
          const el = this.inner.current.querySelector(`[data-index="${this.state.index}"]`)
        }
      }
    }
  }

  onResize = (e) => {
    const slideWidth = this.outer.current.clientWidth / this.props.slidesToShow;
    const el = this.inner.current.querySelector(`[data-index="${this.state.index}"]`)
    const offset = el.offsetLeft
    this.setState({
      children: formatChildren(this.props.children, slideWidth),
      left: offset
    })
  }


  onTouchStart = (e) => {
    this.setState({
      dragging: true, 
      startClientX: e.touches[0].clientX,
      startLeft: this.state.left,
      startPhantomMoved: this.state.phantomMoved
    })
  }


  onTouchMove = (e) => {

    const movedAmount = this.state.startClientX - e.touches[0].clientX;
    const nextLeft = this.state.startLeft - movedAmount;
    const nextPhantomMoved = this.state.startPhantomMoved - movedAmount;

    const event = {
      index: this.state.index,
      movedAmount,
      nextLeft,
      nextPhantomMoved,
    }
 
    if(this.transitioning) {
      return null;
    }

    // at left edge.
    if(nextLeft > 0) {
      this.setState({ left: 0, startLeft: 0})
      return;
    }
    
    // at right edge.
    if(
      movedAmount > 0 &&
      this.inner.current.clientWidth + this.state.left - (this.state.slideWidth * this.props.slidesToShow) <= 0
    ) {
      return;
    }

    
    if(this.state.slideWidth + nextPhantomMoved < 0 ) {
      

      if(this.state.renderEnd < this.props.slidesToShow * 3) {
        this.transitioning = true;
        this.setState({
          index: this.state.index + 1,
          renderEnd: this.state.renderEnd + 1,
          left: nextLeft,
          startLeft: nextLeft,
          startClientX: e.touches[0].clientX,
          phantomMoved: 0,
          startPhantomMoved: 0,
        }, () => this.transitioning = false)
      } 
      else {
        this.transitioning = true;
        console.log(
          `-----------------------------
            #!!!#  Transitioning.   #!!!#
           -----------------------------
          `
        )
        this.setState({ 
          index: this.state.index + 1,
          renderStart: this.state.renderStart + 1,
          renderEnd: this.state.renderEnd + 1,
          startLeft: this.state.slideWidth * -(this.props.slidesToShow),
          left: this.state.slideWidth * -(this.props.slidesToShow),
          startClientX: e.touches[0].clientX,
          phantomMoved: 0,
          startPhantomMoved: 0
        }, () => {
          this.transitioning = false;
          const event = {
            movedAmount,
            nextLeft,
            nextPhantomMoved,
            index: this.state.index
          }
          // console.log(event)
        })
      }
    }
    else if(nextPhantomMoved > 0) {
      console.log("{{ PREV }}")
      // if(this.state.renderEnd < this.props.slidesToShow * 3) {


      // }
      this.setState({
        // index: this.state.index - 1,
        // renderStart: this.state.renderStart - 1,
        // renderEnd: this.state.renderEnd - 1,
        left: nextLeft,
        phantomMoved: nextPhantomMoved,
        // phantomMoved: this.state.slideWidth
      })
    } 
    else {
      this.setState({
        left: nextLeft,
        phantomMoved: nextPhantomMoved
      }, () => {
        this.transitioning = false;
        const event = {
          movedAmount,
          nextLeft,
          nextPhantomMoved,
          index: this.state.index
        }
        // console.log(event)
      })
    }
  }


  onTouchEnd = (e) => {
    this.setState({dragging: false})
  }


  onNext = (e) => {
    if ( this.clickReady(Date.now()) ) {
      const nextIndex = Math.min(this.state.children.length - this.props.slidesToShow, this.state.index + this.props.slideAmount)
      const el = this.inner.current.querySelector(`[data-index="${nextIndex}"]`)
      console.log('nextIndex: ', nextIndex);
      
      // this.inner.current.transition = 'all 0s ease';
      this.setState({
        index: nextIndex,
        renderStart: nextIndex - this.props.slidesToShow,
        renderEnd: nextIndex + (this.props.slidesToShow * 2),
        left: 0,
        dragging: false,
        transition: false
      })
    }
  }

  onPrev = (e) => {
    if (this.clickReady(Date.now())) {
      const prevIndex = Math.max(0, this.state.index - this.props.slideAmount);
      const el = this.inner.current.querySelector(`[data-index="${this.state.index}"]`)

      this.setState((prevState) => ({
        index: prevIndex,
        renderStart: Math.max(0, prevIndex - this.props.slidesToShow),
        renderEnd: (+prevIndex) + (this.props.slidesToShow * 2),
        dragging: false,
        // left: -el.offsetLeft + 300,
        transition: false    
      }), () => this.setState((prevState) => {
      const el = this.inner.current.querySelector(`[data-index="${this.state.index}"]`)        
        return {
          transition: false
        }
      })
    )
    }
  }

  clickReady(now) {
    if( now - this.clickTimer > this.props.slideDuration )  {
      this.clickTimer = now;
      return true;
    }
    else {
      return false;
    }
  }

  renderControls(props) {
    const {
      controls: Controls
    } = this.props;
    
    const {
      index
    } = this.state;

    return (<Controls
      atStart={index === 0}
      atEnd={index === this.props.children.length - this.props.slidesToShow} 
      // atEnd={false} 
      onNext={this.onNext} 
      onPrev={this.onPrev}
    />)
  }



  render() {
    console.log(this.state.index)
    const {
      children,
      className,
      id,
      ...props
    } = this.props;
    // console.log(this.state.renderStart);
    // console.log(this.state.renderEnd);
    // console.log(this.state.left)
    return (
      <div ref={this.outer} className='outer'>
        <div 
          ref={this.inner}
          style={{
            transform: `matrix(1,0,0,1,${this.state.left},0)`,
            transition: this.state.transition && !this.state.dragging ? 'all 0.5s ease' : 'all 0s ease'
          }}
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd} 
          className='inner'>
            {this.state.children.slice(
              this.state.renderStart,
              this.state.renderEnd
            )}
        </div>
        {this.renderControls(props)} 
      </div>
    )
  }
}

export default Carousel
