import React, { Component } from 'react'

export class LeftControl extends Component {
  render() {
    return (
      <React.Fragment>
        {this.props.show ? 
        <button onClick={this.props.onClick} className="control left">{'<'}</button>
        :
        null}
      </React.Fragment>
    )
  }
}

export default LeftControl
