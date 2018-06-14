import React, { Component } from 'react';
// import { Button } from '@material-ui/core';
import Carousel from './Carousel';
import './Root.css';
/* eslint-disable */

/* 
ERR.
3 5 
8 10
0 2


*/

const Button = ({children}) => <button>{children}</button>

class Controls extends React.Component {
  state = {
    backEnabled: false,
    nextEnabled: true,
  };

  onBackEnabled = bool => {
    this.setState({
      backEnabled: bool,
    });
  };

  onNextEnabled = bool => {
    this.setState({
      nextEnabled: bool,
    });
  };

  render() {
    const { onBackClick, onNextClick } = this.props;
    const { nextEnabled, backEnabled } = this.state;
    return (
      <React.Fragment>
        <button
          onClick={onBackClick}
          className={backEnabled ? 'control back' : 'control back disabled'}
        >
          {'<'}
        </button>
        <button
          onClick={onNextClick}
          className={nextEnabled ? 'control next' : 'control next disabled'}
        >
          {'>'}
        </button>
      </React.Fragment>
    );
  }
}

class Root extends Component {
  state = {
    amount: 12,
    slidesToShow: 3,
    slideAmount: 3,
  };

  add = e =>
    this.setState(prevState => ({
      amount: prevState.amount + 5,
    }));
  remove = e =>
    this.setState(prevState => ({
      amount: prevState.amount - 5,
    }));

  slides = (e, amount) =>
    this.setState(prevState => ({
      slidesToShow: prevState.slidesToShow + amount,
    }));

  render() {
    const { classes } = this.props;
    return (
      <div className="App">
        <header>
          <h1>React Carousel</h1>
        </header>
        <div className="buttons">
          <Button className="button" variant="outlined" onClick={this.add}>
            add 5 more children
          </Button>
          <Button className="button" variant="outlined" onClick={this.remove}>
            remove 5 more children
          </Button>
          <Button className="button" variant="outlined" onClick={e => this.slides(e, +1)}>
            add slides
          </Button>
          <Button className="button" variant="outlined" onClick={e => this.slides(e, -1)}>
            remove slides
          </Button>
        </div>
        <Carousel
          slidesToShow={this.state.slidesToShow}
          slideAmount={this.state.slideAmount}
          spacing={10}
          controls={Controls}
          slideDuration={500}
        >
          {[...Array(this.state.amount)].map((_, i) => {
            if (i === 0) {
              return (
                <div key={i}>
                  <h1>Slide {i}</h1>
                  <div className="circle" />
                </div>
              );
            }
            return (
              <div key={i}>
                <h1>Slide {i}</h1>
                <div className="circle" />
              </div>
            );
          })}
        </Carousel>
      </div>
    );
  }
}

export default Root;
