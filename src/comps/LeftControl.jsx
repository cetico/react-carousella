import React, { Component } from 'react'

export class LeftControl extends Component {
  render() {
    return (
      <button onClick={this.props.onClick} className="control left">{'<'}</button>
    )
  }
}

export default LeftControl
