import React, { Component } from 'react';
// import CarouselChris from './comps/Carousel2';
import Carousel from './container/Slider';
// import Carousel from './comps/Carousel3';

const Controls = (props) => (
  <React.Fragment>
      <button onClick={props.onBackClick} className="back">back</button>
      <button onClick={props.onNextClick} className="next">next</button>
    </React.Fragment>
)

class App extends Component {

  state = {
    amount: 22,
    slidesToShow: 3,
    slideAmount: 2
  }

  add = (e) => this.setState((prevState) => {
    return {
      amount: prevState.amount + 5
    }
  })

  slides = (e, amount) => this.setState((prevState) => {
    return {
      slidesToShow: prevState.slidesToShow + amount
    }
  })

  render() {
    return (
      <div className="App">
        <h1>React Carousel</h1>
        <hr />
        <button onClick={this.add}>add 5 more children</button>
        <button onClick={(e) => this.slides(e, +1)}>add slides</button>
        <button onClick={(e) => this.slides(e, -1)}>remove slides</button>
        <Carousel 
          slidesToShow={this.state.slidesToShow}
          slideAmount={this.state.slideAmount}
          spacing={10}
          controls={Controls}
          slideDuration={500}
        > 
          {[...Array(this.state.amount)].map((_, i) => {

            if(i === 0) {
              return (
              <div key={i}>
                <h1>I'm {i}. What's up.</h1>
                <div className={'img-' + i} />
              </div>
              )
            } else {
              return (
                <div key={i}>
              <h1>I'm {i}. What's up.</h1>
              <div className={'img-' + i} />
            </div>
              )
            }
          })}  
        </Carousel>
      </div>
    );
  }
}

export default App;
