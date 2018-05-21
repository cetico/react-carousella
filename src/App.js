import React, { Component } from 'react';
// import CarouselChris from './comps/Carousel2';
import Carousel from './comps/Carousel';


class App extends Component {

  state = {
    amount: 35
  }

  add = (e) => this.setState((prevState) => {
    return {
      amount: prevState.amount + 5
    }
  })


  render() {
    console.log(this.state.amount)
    return (
      <div className="App">
        <h1>React Carousel</h1>
        <hr />
        <button onClick={this.add}>add 5 more children</button>
        <Carousel 
          slidesToShow={3}
          slideAmount={3}
          spacing={10}
          easing={'ease'}
          height={'equal'}
          // controls={Controls}
          slideDuration={500}> 
          {[...Array(this.state.amount)].map((_, i) => {

            if(i === 0) {
              return (

                <div key={i}>
              <h1>I'm {i}. What's up. Wooohooo, im extra big! wooo</h1>
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

        {/* <CarouselChris
          tilesToShow={5} 
          slideDuration={500} 
          easing={'ease'} 
          loopMode={true} // TO IMPLEMENT
          infiniteScroll={false} //TO IMPLEMENT
          className="poop">
          {[...Array(50)].map((_, index) => (
            <div key={index}>
              <h3>I am a title: {index} </h3>
              <div className='cover' />
            </div>
          ))}
        </CarouselChris> */}
      </div>
    );
  }
}

export default App;
