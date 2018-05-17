import React, { Component } from 'react';
import Carousel from './comps/Carousel';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>React Carousel</h1>
        <hr />
        <Carousel 
          tilesToShow={3} 
          slideDuration={500} 
          easing={'ease'} 
          ultraMode={true} // TO IMPLEMENT
          infiniteScroll={false} //TO IMPLEMENT
          className="poop">
          {[...Array(10)].map((_, index) => (
            <div key={index}>
              <h3>I am a title: {index} </h3>
              <img src="http://via.placeholder.com/350x150" />
            </div>
          ))}
        </Carousel>
      </div>
    );
  }
}

export default App;
