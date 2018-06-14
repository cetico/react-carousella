/* eslint-disable */
import React, { Component } from 'react';
import './slider.css';



// https://www.kirupa.com/html5/get_element_position_using_javascript.htm
function getPosition(el) {
  let xPos = 0;
  let yPos = 0;

  while (el) {
    if (el.tagName == 'BODY') {
      // deal with browser quirks with body/window/document and page scroll
      let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      let yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos,
  };
}

export default class Slider extends Component {
  state = {
    mounted: false,
    clientWidth: 0,
    slideWidth: 0,

    renderStart: 0,
    renderEnd: (this.props.slidesToShow * 3),
    activeIndex: 0,

    action: {
      name: '',
      amount: 0,
      done: true,
      transition: 'all 0s ease',
    },
    timer: Date.now(),
  }

  activeIndex = 0;

  slider = React.createRef();
  inner = React.createRef();


  // recalculate slideWith if slidesToShow changes. (for responsive)
  static getDerivedStateFromProps(props, state) {
    if (props.slidesToShow !== state.slidesToShow) {
      return {
        slideWidth: (state.clientWidth / props.slidesToShow)
      }
    } 
      return state;
    
  }

  // first calculate slideWidth before render and add eventListener.
  componentDidMount() {
    this.setState({
      mounted: true,
      clientWidth: +this.slider.current.clientWidth,
      slideWidth: (+this.slider.current.clientWidth / this.props.slidesToShow),
    });
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.state.action.done && !this.state.dragging) {
      setTimeout(() => {
        if (this.state.action.name === 'back') {
          if (this.state.renderStart === 0 && this.state.action.amount === 0) {
            if (this.state.activeIndex !== 0) {
              this.setState({
                activeIndex: this.state.activeIndex - this.props.slideAmount,
              });
            }
          }
          else {
            this.setState({
              renderStart: this.state.renderStart - this.props.slideAmount,
              activeIndex: this.state.activeIndex - this.props.slideAmount,
              renderEnd: this.state.renderEnd - this.props.slideAmount,
              action: {
                name: '',
                amount: -this.state.slideWidth * this.props.slideAmount,
                done: true,
                transition: 'all 0s ease',
              },
            });
          }
        } else if (this.state.action.name === 'next') {
          if (this.state.renderStart === 0 && prevState.action.amount === 0) {
            this.setState({
              activeIndex: this.state.activeIndex + this.props.slideAmount,
            });
          } else {
            if (prevState.activeIndex === 0) {
              return null;
            }

            this.setState({
              renderStart: this.state.renderStart + this.props.slideAmount,
              activeIndex: this.state.activeIndex + this.props.slideAmount,
              renderEnd: this.state.renderEnd + this.props.slideAmount,
              action: {
                name: '',
                amount: -this.state.slideWidth * this.props.slideAmount,
                done: true,
                transition: 'all 0s ease',
              },
            });
          }
        } else {
          this.setState({
            action: {
              name: '',
              amount: 0,
              done: true,
              transition: 'all 0s ease',
            },
          });
        }
      }, this.props.slideDuration);
    } else if (this.state.dragging) {

      // this.setState({
      //   dragging: false
      // })
    }
  }

  onTouchStart = (event) => {
    this.setState({
      startClientX: -event.touches[0].clientX,
      prevAmount: this.state.action.amount,
      dragging: true,
      action: {
        transition: 'all 0s ease',
      },
    });
  }

  onTouchMove = (event) => {
    const index = this.state.activeIndex;

    this.setState({
      action: {
        ...this.state.action,
        amount: this.state.prevAmount + this.state.startClientX + event.touches[0].clientX,
        direction: this.state.startClientX + event.touches[0].clientX <= 0 ? 'right' : 'left',
      },
    }, this.calcTouchIndex);
  }

  onTouchEnd = (event) => {
    // let indexes = 0;
    // let amount = ~~(this.state.action.amount / this.state.slideWidth) * -1;

    if (!document.querySelector(`[data-index="${this.state.activeIndex}"]`)) {
      return null;
    }

    if (this.state.action.direction === 'right') {
      const activeNode = document.querySelector(`[data-index="${this.state.activeIndex}"]`).nextElementSibling;

      if (!activeNode) {
        return this.setState({
          action: {
            amount: -document.querySelector(`[data-index="${this.state.activeIndex}"]`).offsetLeft,
            transition: 'all 0.5s ease',
          },
        });
      }

      this.setState({
        activeIndex: activeNode ? this.state.activeIndex + 1 : this.state.activeIndex,
        action: {
          amount: -activeNode.offsetLeft,
          transition: 'all 0.5s ease',
        },
      }, () => {
        setTimeout(() => {
          this.setState({
            renderStart: this.state.renderStart + 1,
            renderEnd: this.state.renderEnd + 1,
            action: {
              amount: this.state.action.amount + this.state.slideWidth,
            },
          });
        }, 500);
      });
    } else {
      const activeNode = document.querySelector(`[data-index="${this.state.activeIndex}"]`);
      this.setState({
        action: {
          amount: -activeNode.offsetLeft,
          transition: 'all 0.5s ease',
        },
      });
    }
  }

  calcTouchIndex(e) {
    const { x, y } = getPosition(this.inner.current);
    const nodesAtPoint = document.elementsFromPoint(x, y);
    const slideNode = nodesAtPoint.filter(el => el.classList.contains('slide'))[0];

    if(!slideNode)  {
      return null;
    } 
      this.setState({
        activeIndex: +slideNode.dataset.index,
        // renderStart: +slideNode.dataset.index - this.props.slidesToShow,
        // renderEnd: +slideNode.dataset.index + (this.props.slidesToShow * 2),
        dragging: true
      })
    
  }

  onWindowResize = (event) => {
    this.setState({
      clientWidth: +this.slider.current.clientWidth,
      slideWidth: (+this.slider.current.clientWidth / this.props.slidesToShow),
    });
  }

  onBackClick = (event) => {
    if (!(Date.now() - this.state.timer >= this.props.slideDuration)) {
      return null;
    }

    if (this.state.action.amount === 0 && this.state.renderStart === 0) {
      return null;
    }

    this.setState({
      timer: Date.now(),
      action: {
 name: 'back', amount: 0, done: false, transition: `all ${this.props.slideDuration / 1000}s ease` 
},
    });
  }

  onNextClick = (e) => {
    if (!(Date.now() - this.state.timer >= this.props.slideDuration)) {
      return null;
    }

    if (this.state.renderStart + this.props.slideAmount + this.props.slideAmount >= this.props.children.length) {
      return null;
    }

    let amount = 0;
    if (this.state.action.amount === 0) {
      amount = -this.state.slideWidth * this.props.slideAmount;
    } else {
      amount = -this.state.slideWidth * this.props.slideAmount * 2;
    }


    this.setState({
      timer: Date.now(),
      action: {
        name: 'next',
        amount,
        done: false,
        transition: `all ${this.props.slideDuration / 1000}s ease`,
      },
    });
  }

  render() {
    const {
      children,
    } = this.props;


    return (
      <div ref={this.slider} className="slider">
        {this.renderControls()}
        <div
          ref={this.inner}
          className="inner"
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
          style={{
            transform: `matrix(1,0,0,1,${this.state.action.amount},0)`,
            transition: this.state.action.transition,
          }}
        >
          {this.renderChildren(children)}
        </div>
      </div>
    );
  }


  renderControls() {
    const {
      controls: Controls,
    } = this.props;

    return <Controls onNextClick={this.onNextClick} onBackClick={this.onBackClick} />;
  }

  renderChildren(children) {
    if (!this.state.mounted) return null;

    const {
      slideWidth,
      renderStart,
      renderEnd,
    } = this.state;

    const wrappedChildren = this.wrapChildren(children, slideWidth);
    return wrappedChildren.slice(Math.max(renderStart, 0), Math.min(renderEnd, children.length));
  }

  wrapChildren(children, slideWidth) {
    return Array.from(children)
      .map((child, index) => (
      <div key={child.key} className="slide" data-index={index} style={{ flex: `0 0 33.3%` }}>
        {child}
      </div>
      ));
  }
}

