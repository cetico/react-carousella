import React, { Component } from 'react'

export class RightControl extends Component {
  render() {
    return (
      <React.Fragment>
        {this.props.show ? 
        <button onClick={this.props.onClick} className="control right">{'>'}</button> 
        :
        null}      
      </React.Fragment>
    )
  }
}

export default RightControl
