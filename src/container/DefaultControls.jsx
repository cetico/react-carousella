import React from 'react';
import PropTypes from 'prop-types';

class DefaultControls extends React.Component {
  state = {
    backEnabled: false,
    nextEnabled: true,
  };

  onBackEnabled = (bool) => {
    this.setState({
      backEnabled: bool,
    });
  };

  onNextEnabled = (bool) => {
    this.setState({
      nextEnabled: bool,
    });
  };

  render() {
    const { onBackClick, onNextClick } = this.props;
    const { nextEnabled, backEnabled } = this.state;
    return (
      <React.Fragment>
        <button onClick={onBackClick} className={backEnabled ? 'back' : 'back disabled'}>
          back
        </button>
        <button onClick={onNextClick} className={nextEnabled ? 'next' : 'next disabled'}>
          next
        </button>
      </React.Fragment>
    );
  }
}
DefaultControls.propTypes = {
  onBackClick: PropTypes.func.isRequired,
  onNextClick: PropTypes.func.isRequired,
};

export default DefaultControls;
