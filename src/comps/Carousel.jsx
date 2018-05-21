import React, { Component } from 'react'
import Inner from './Inner';
import DefaultControls from './DefaultControls';

const styles = {
  carousel: {
  }
}


function wrapChildren(children) {
  return children ? (Array.from(children).map((child, i) => (
    <li key={child.key} className='slide' data-index={i}>
      {child}
    </li>
  ))) : null
}


export class Carousel extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      index: 0,
      rightIndex: this.props.slidesToShow,
      children: null,
      slidesToShow: this.props.slidesToShow,
      dragging: false
    }
    
    this.clickTimer = Date.now();
    this.maxOffsetHeight = 0;
    this.touch = {
      scrolled: 0
    };

    this.carousel = React.createRef();
  }


  static defaultProps = {
    controls: DefaultControls,
    spacing: 0,
    slideDuration: 500,
    easing: 'ease',
    height: 'equal'
  }


  get slides() {
    return this.carousel.current.querySelectorAll('.slide')
  }


  get inner() {
    return this.carousel.current.querySelector('.inner');
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('getDerivedStateFromProps');
    if(nextProps.children !== prevState.children) {
      return {
        children: wrapChildren(nextProps.children)
      }
    } 
    else {
      return prevState
    }
  }


  componentDidMount() {
    this.setSlideDimensions()
    window.addEventListener('resize', this.onResize);
  }


  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }


  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate')
    if(prevState.children !== this.state.children || prevState.index !== this.state.index) {
      this.setSlideDimensions();
    }
  }


  onTouchStart = (e) => {
    // this.touch.dragging = true;
    this.touch.start    = e.touches[0].clientX;
  }


  onTouchMove = (e) => {

    const x = {
      clientX: e.touches[0].clientX,
      moved: this.touch.start - e.touches[0].clientX,
      matrix: window.getComputedStyle(this.inner).transform,
      width: this.calcWidth(),
      get x() {
        return +this.matrix.split(',')[4]
      },
      get nextMatrix() {
        return this.x - this.moved;
      }  
    }

    this.touch.scrolled += x.moved
    
    const transition = this.inner.style.transition;
    this.inner.style.transition = 'all 0s ease';

    const activeSlide = this.slides[this.state.index];
    const leftEdge = activeSlide.offsetLeft - this.props.spacing;
    const rightEdge = activeSlide.offsetLeft + activeSlide.clientWidth + this.props.spacing;

    console.log(rightEdge + x.nextMatrix)
    console.log(rightEdge);

    if(rightEdge + x.nextMatrix <= 0) {
      
      this.setState({index: this.state.index + 1, dragging: true})
    } else {
      this.inner.style.transform = `matrix(1,0,0,1,${x.nextMatrix},0)`;
    }
    
    
    this.touch.start = e.touches[0].clientX;
    setTimeout(() => {
      this.inner.style.transition = transition;
      })
    // }

  }


  onTouchEnd = (e) => {
    this.touch.dragging = false;
  }


  onMouseMove = (e) => {
    if(e.buttons === 1 || e.buttons === 2) {

    }
  }
    

  onNext = (e) => {
    if (this.clickReady(Date.now()) ) {
      this.setState((prevState) => ({
        index: Math.min(this.state.children.length, prevState.index + this.props.slideAmount),
        dragging: false
      }))
    }
  }


  onPrev = (e) => {
    if (this.clickReady(Date.now())) {
      this.setState((prevState) => ({
        index: Math.max(0, prevState.index - this.props.slideAmount),
        dragging: false    
      }))
    }
  }


  onResize = (e) => {
    this.setSlideDimensions();
  }


  calcWidth() {
    const width = this.carousel.current.clientWidth;
    const amount = this.props.slidesToShow;
    return (width / amount);
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


  setSlideDimensions() {
    const width = this.calcWidth();
    const {
      height
    } = this.props;

    if(height=== 'equal') {
      Array.from(this.slides).forEach(slide => {
        slide.style.margin = `${this.props.spacing}px`;
        slide.style.flex = `0 0 ${width - (this.props.spacing * 2)}px`;
        setTimeout(() => {
          if(slide.clientHeight > this.maxOffsetHeight) {
            this.maxOffsetHeight = slide.clientHeight;
          }
          slide.style.height = this.maxOffsetHeight + 'px';
        })
      })
    }
    else if (height === 'dynamic') {
      Array.from(this.slides).forEach(slide => {
        slide.style.margin = `${this.props.spacing}px`;
        slide.style.flex = `0 0 ${width - (this.props.spacing * 2)}px`;
      })
    }
    else {
      Array.from(this.slides).forEach(slide => {
        slide.style.margin = `${this.props.spacing}px`;
        slide.style.flex = `0 0 ${width - (this.props.spacing * 2)}px`;
        setTimeout(() => {
          slide.style.height = height;
        })
      })
    }
  }


  wrapChildren(children) {
    return children ? 
    (Array.from(children).map((child, i) => (
      <li key={child.key} className='slide'>
        {child}
      </li>
    ))) 
    : null
  }


  renderControls(props) {

    const {
      controls: Controls
    } = this.props;

    const {
      index,
      children
    } = this.state;

    return (<Controls
              atStart={index === 0}
              atEnd={index >= children.length - 1} 
              onNext={this.onNext} 
              onPrev={this.onPrev}
              {...props}
            />)
  }


  render() {
    const {
      controls,
      children,
      ...props
    } = this.props;
    
    const {
      index,
      slidesToShow,
      dragging
    } = this.state;

    return (
      <div 
        ref={this.carousel} 
        style={styles.carousel} 
        className='carousel'>
        <Inner
          index={index}
          // dragging={this.touch.dragging}
          slidesToShow={slidesToShow}
          onMouseMove={this.onMouseMove}
          onTouchStart={this.onTouchStart}
          dragging={dragging}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
          {...props}> 
            {this.state.children}
        </Inner>
        {this.renderControls(props)}        
      </div>
    )
  }
}


export default Carousel

