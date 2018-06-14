import React from 'react';

const styles = {
  prev: {
    position: 'absolute',
    top: '50%',
    left: 0,
    zIndex: 100,
  },
  next: {
    position: 'absolute',
    top: '50%',
    right: 0,
    zIndex: 100,
  },
};

const DefaultControls = props => (
  <React.Fragment>
    {!props.atStart && (
      <button onClick={props.onPrev} style={styles.prev}>
        {'<'}
      </button>
    )}
    {!props.atEnd && (
      <button onClick={props.onNext} style={styles.next}>
        {'>'}
      </button>
    )}
  </React.Fragment>
);

export default DefaultControls;
