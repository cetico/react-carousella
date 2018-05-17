import React, { Component } from 'react'

export class RightControl extends Component {
  render() {
    return (
      <button onClick={this.props.onClick} className="control right">{'>'}</button>      
    )
  }
}

export default RightControl
