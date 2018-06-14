/* eslint-disable */
import React, { Component } from 'react';
import { JssProvider as DefaultJssProvider, createGenerateClassName } from 'react-jss';

const generateClassName = createGenerateClassName();

export default class JssProvider extends Component {
  static propTypes = {};

  static defaultProps = {};

  render() {
    return (
      <DefaultJssProvider generateClassName={generateClassName}>
        {this.props.children}
      </DefaultJssProvider>
    );
  }
}
