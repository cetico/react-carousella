import React from 'react';

const styles = {
  outer: {
    overflow: 'hidden',
  },
  inner: {
    whiteSpace: 'nowrap',
    transition: 'transform 0.4s ease',
  },
  slide: {
    boxSizing: 'border-box',
    display: 'inline-block',
    padding: 8,
  },
};

export default class CarouselChris extends React.Component {
  state = {
    index: 0,
  };

  prev() {
    const offset = this.state.index > 0 ? 0 : 0;
    this.refs.inner.style.transform = `translateX(${offset}%)`;

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.setState({ index: Math.max(0, this.state.index - this.props.tilesToShow) }, () => {
        const newOffset = this.state.index > 0 ? -100 : 0;

        this.refs.inner.style.transition = '';
        this.refs.inner.style.transform = `translateX(${newOffset}%)`;

        setTimeout(() => {
          this.refs.inner.style.transition = styles.inner.transition;
        }, 15);
      });
    }, 400);
  }

  next() {
    const offset = this.state.index > 0 ? -200 : -100;
    this.refs.inner.style.transform = `translateX(${offset}%)`;

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.setState({ index: Math.min(this.props.children.length, this.state.index + this.props.tilesToShow)  }, () => {
        const newOffset = this.state.index > 0 ? -100 : 0;

        this.refs.inner.style.transition = '';
        this.refs.inner.style.transform = `translateX(${newOffset}%)`;

        setTimeout(() => {
          this.refs.inner.style.transition = styles.inner.transition;
        }, 15);
      });
    }, 400);
  }

  render() {
    const { children, tilesToShow } = this.props;

    return (
      <div style={styles.outer}>
        <div style={styles.inner} ref="inner">
          {React.Children.map(children, (child, index) => {
            const fromIndex = this.state.index - tilesToShow;
            const toIndex   = this.state.index + (tilesToShow * 2);

            if (index < fromIndex || index > toIndex) {
              return null;
            }

            return (
              <div style={{ ...styles.slide, width: `${100 / tilesToShow}%` }}>
                {child}
              </div>
            );
          })}
        </div>
        <div style={styles.prevButton} onClick={() => this.prev()}>Prev</div>
        <div style={styles.nextButton} onClick={() => this.next()}>Next</div>
      </div>
    );
  }
}
