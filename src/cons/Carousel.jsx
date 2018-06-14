import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DefaultControls from './DefaultControls';
import Inner from './Inner';
import './carousel.css';

export default class Carousel extends Component {
  static propTypes = {
    children: PropTypes.node,
    controls: PropTypes.func,
    slidesToShow: PropTypes.number,
  };

  static defaultProps = {
    children: null,
    controls: DefaultControls,
    slidesToShow: 2,
  };

  state = {
    nextEnabled: true,
    backEnabled: true,
  };

  onNextClick = this.onNextClick.bind(this);
  onBackClick = this.onBackClick.bind(this);
  onBackEnabled = this.onBackEnabled.bind(this);
  onNextEnabled = this.onNextEnabled.bind(this);

  onNextClick(e) {
    this.inner.current.onNextClick(e);
  }

  onBackClick(e) {
    this.inner.current.onBackClick(e);
  }

  onBackEnabled(bool) {
    this.controls.current.onBackEnabled(bool);
  }

  onNextEnabled(bool) {
    this.controls.current.onNextEnabled(bool);
  }

  outer = React.createRef();
  inner = React.createRef();
  controls = React.createRef();

  render() {
    const {
      controls: Controls, slidesToShow, children, ...props
    } = this.props;

    const { backEnabled, nextEnabled } = this.state;

    return (
      <React.Fragment>
        <div className="carousel" ref={this.outer}>
          <Controls
            ref={this.controls}
            onNextClick={this.onNextClick}
            onBackClick={this.onBackClick}
            nextEnabled={nextEnabled}
            backEnabled={backEnabled}
          />
          <Inner
            ref={this.inner}
            onBackEnabled={this.onBackEnabled}
            onNextEnabled={this.onNextEnabled}
            slidesToShow={slidesToShow}
            {...props}
          >
            {children}
          </Inner>
        </div>
      </React.Fragment>
    );
  }
}
