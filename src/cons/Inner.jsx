import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as utils from '../utils/helpers';
import Slides from '../comps/Slides';
// import _ from '../utils/lodash';

/* refractor state object shape. */

export default class Inner extends Component {
  static propTypes = {
    children: PropTypes.node,
    slidesToShow: PropTypes.number,
    slideDuration: PropTypes.number,
    slideAmount: PropTypes.number,
    easing: PropTypes.string,
    onNextEnabled: PropTypes.func,
    onBackEnabled: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    slidesToShow: 2,
    slideAmount: 1,
    slideDuration: 500,
    easing: 'ease',
    onNextEnabled: null,
    onBackEnabled: null,
  };

  state = {
    render: {
      active: 0,
      start: 0,
      end: this.props.slidesToShow * 2 - 1,
      prevStart: null,
      prevEnd: null,
      prevActive: null,
    },
    activeNode: null,
    touch: {
      startClientX: 0,
    },
    transform: {
      x: 0,
      startX: 0,
      currentTransition: 'transform 0s ease',
      transition: `transform ${this.props.slideDuration / 1000}s ${this.props.easing}`,
      transitioning: false,
    },
  };

  onTouchStart = this.onTouchStart.bind(this);
  onTouchMove = this.onTouchMove.bind(this);
  onTouchEnd = this.onTouchEnd.bind(this);
  onTransitionEnd = this.onTransitionEnd.bind(this);

  onNextClick() {
    // block event during transitioning.
    const state = {};

    if (this.state.transform.transitioning) {
      return null;
    }

    state.render = {
      ...this.state.render,
      active: Math.min(
        this.state.render.active + this.props.slideAmount,
        this.props.children.length - this.props.slidesToShow,
      ),
      prevActive: this.state.render.active,
      prevStart: this.state.render.start,
      prevEnd: this.state.render.end,
    };

    state.render.start = Math.max(state.render.active - this.props.slidesToShow, 0);
    state.render.end = Math.min(
      state.render.active + this.props.slidesToShow * 2 - 1,
      this.props.children.length,
    );
    state.activeNode = document.querySelector(`[data-index="${state.render.active}"]`);
    state.transform = {
      ...this.state.transform,
      currentTransition: 'transform 0s ease',
    };
    // this.props.onNextEnabled(true);

    this.inner.current.classList.add('transitioning');

    return this.setState(state, this.onAfterNextClick);
  }

  onAfterNextClick() {
    const nextNode = document.querySelector(`[data-index="${this.state.render.active}"]`);
    const renderStartChange = this.state.render.start - this.state.render.prevStart;

    const state = {
      nextNode,
    };

    if (this.state.render.prevStart !== this.state.render.start) {
      state.transform = {
        ...this.state.transform,
        x: this.state.transform.x + renderStartChange * nextNode.clientWidth,
      };
    }

    return this.setState(state, this.onAfterAferNextClick);
  }

  onAfterAferNextClick() {
    const state = {};
    state.transform = {
      ...this.state.transform,
      currentTransition: this.state.transform.transition,
      x: -this.state.nextNode.offsetLeft,
    };
    if (this.state.transform.x === -this.state.nextNode.offsetLeft) {
      state.transform.transitioning = false;
    } else {
      state.transform.transitioning = true;
    }
    return this.setState(state);
  }

  onBackClick() {
    // block event during transitioning.

    if (this.state.transform.transitioning) {
      return null;
    }

    const state = {
      render: {
        ...this.state.render,
        active: Math.max(this.state.render.active - this.props.slideAmount, 0),
        prevActive: this.state.render.active,
        prevStart: this.state.render.start,
        prevEnd: this.state.render.end,
      },
    };
    state.render.start = Math.max(state.render.active - this.props.slidesToShow, 0);
    state.render.end = Math.min(
      state.render.active + this.props.slidesToShow * 2 - 1,
      this.props.children.length,
    );
    state.activeNode = document.querySelector(`[data-index="${state.render.active}"]`);
    state.transform = {
      ...this.state.transform,
      currentTransition: 'transform 0s ease',
    };

    this.inner.current.classList.add('transitioning');

    return this.setState(state, this.onAfterBackClick);
  }

  onAfterBackClick() {
    const nextNode = document.querySelector(`[data-index="${this.state.render.active}"]`);
    const renderStartChange = this.state.render.start - this.state.render.prevStart;

    const state = {
      nextNode,
    };

    if (this.state.render.prevStart !== this.state.render.start) {
      state.transform = {
        ...this.state.transform,
        x: this.state.transform.x + renderStartChange * nextNode.clientWidth,
      };
    }

    return this.setState(state, this.onAfterAferBackClick);
  }

  onAfterAferBackClick() {
    const state = {
      transform: {
        ...this.state.transform,
        currentTransition: this.state.transform.transition,
        x: -this.state.nextNode.offsetLeft,
      },
    };
    if (this.state.transform.x === -this.state.nextNode.offsetLeft) {
      state.transform.transitioning = false;
    } else {
      state.transform.transitioning = true;
    }

    return this.setState(state);
  }

  onTransitionEnd(event) {
    if (event.target.classList.contains('inner')) {
      event.target.classList.remove('transitioning');
    }

    return this.setState(
      prevState => ({
        transform: {
          ...prevState.transform,
          transitioning: false,
        },
      }),
      this.onAfterTransitionEnd,
    );
  }

  onAfterTransitionEnd() {
    if (this.props.onBackEnabled) {
      if (this.state.render.active === 0) {
        this.props.onBackEnabled(false);
      } else {
        this.props.onBackEnabled(true);
      }
    }

    if (this.props.onNextEnabled) {
      if (this.state.render.active + this.props.slidesToShow >= this.props.children.length) {
        this.props.onNextEnabled(false);
      } else {
        this.props.onNextEnabled(true);
      }
    }
  }

  onTouchStart(event) {
    console.log('touch START')


    

    const state = {
      touch: {
        ...this.state.touch,
        startClientX: -event.touches[0].clientX,
      },
      transform: {
        ...this.state.transform,
        startX: this.state.transform.x,
        transitioning: false,
      },
    };

    // init if no activeNode to prevent Errors.
    if(!this.state.activeNode) {
      state.activeNode = document.querySelector('.slide')
    }

    return this.setState(state);
  }

  onTouchMove(event) {
    console.log('touch MOVE')
    const state = {
      transform: {
        ...this.state.transform,
        x: this.state.transform.startX + (this.state.touch.startClientX + event.touches[0].clientX),
      },
    };

    return this.setState(state, this.onAfterTouchMove);
  }

  onAfterTouchMove() {
    let state;
    let activeNode;
    let transInstant;

    const movedX = this.state.transform.startX - this.state.transform.x;
    const coords = utils.getPosition(this.inner.current);

    const nodeAtPoint = document
      .elementsFromPoint(coords.x + 1, coords.y + 1)
      .filter(node => node.classList.contains('slide'))[0];

    if (!nodeAtPoint) {
      activeNode = this.state.activeNode;
      transInstant = true;
    } else if (+nodeAtPoint.dataset.index + this.props.slidesToShow >= this.props.children.length) {
      activeNode = this.state.activeNode;
      // SMOOTHLY TRANSITION BACK.
      if((movedX > nodeAtPoint.clientWidth / 2)) {
        transInstant = true;
      }
    } else if (movedX > nodeAtPoint.clientWidth / 5) {
      activeNode = nodeAtPoint.nextElementSibling;
    } else {
      activeNode = nodeAtPoint;
    }

    if (transInstant) {
      state = {
        transform: {
          ...this.state.transform,
          x: -this.state.activeNode.offsetLeft,
          // (UX) apply transition to smoothly block movement.
          currentTransition: 'all 0.5s ease',
        },
      };
    } else {
      state = {
        render: {
          ...this.state.render,
          active: +activeNode.dataset.index,
        },
        transform: {
          ...this.state.transform,
          currentTransition: 'transform 0s ease',
        },
        activeNode,
      };
    }
    return this.setState(state);
  }

  onTouchEnd() {
    console.log('ON TOUCH END')
    const movedX = this.state.transform.startX - this.state.transform.x;
    const movedSlides = Math.ceil(Math.abs(movedX) / this.state.activeNode.clientWidth);

    const state = {
      render: {
        ...this.state.render,
        start: Math.max(this.state.render.active - this.props.slidesToShow, 0),
        end: Math.min(
          this.state.render.active + this.props.slidesToShow * 2 - 1,
          this.props.children.length,
        ),
      },
    };

    if (state.render.start !== this.state.render.start) {
      if (movedX < 0) {
        state.transform = {
          ...this.state.transform,
          x: this.state.transform.x - this.state.activeNode.clientWidth * movedSlides,
        };
      } else {
        state.transform = {
          ...this.state.transform,
          x: this.state.transform.x + this.state.activeNode.clientWidth * movedSlides,
        };
      }
    }

    return this.setState(state, this.onAfterTouchEnd);
  }

  onAfterTouchEnd() {
    const state = {
      render: {
        ...this.state.render,
      },
      transform: {
        ...this.state.transform,
        x: -this.state.activeNode.offsetLeft,
        currentTransition: this.state.transform.transition,
      },
    };
    return this.setState(state);
  }

  inner = React.createRef();

  render() {
    const { transform, render, activeNode } = this.state;

    const { slidesToShow } = this.props;

    return (
      <div
        className="inner"
        ref={this.inner}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
        onTransitionEnd={this.onTransitionEnd}
        style={{
          transform: `matrix(1,0,0,1,${transform.x},0)`,
          transition: transform.currentTransition,
        }}
      >
        <Slides
          slidesToShow={slidesToShow}
          renderStart={render.start}
          renderEnd={render.end}
          activeIndex={render.active}
          activeNode={activeNode}
        >
          {this.props.children}
        </Slides>
      </div>
    );
  }
}
