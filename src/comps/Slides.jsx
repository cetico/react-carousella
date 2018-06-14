import React from 'react';
import PropTypes from 'prop-types';

const colorMap = [];

function generateColors(length) {
  for (let i = 0; i <= length; i += 1) {
    colorMap.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
  }
}

function WrapChildren({
  slidesToShow, children, renderStart, renderEnd,
}) {
  if (colorMap.length === 0) {
    generateColors(children.length);
  }

  const width = 100 / slidesToShow;

  return Array.from(children).map((child, index) => {
    if (index < renderStart || index > renderEnd) return null;
    return (
      <div
        key={child.key}
        className="slide"
        data-index={child.key}
        style={{
          flex: `0 0 ${width}%`,
          backgroundColor: colorMap[index],
        }}
      >
        {child}
      </div>
    );
  });
}

const Slides = props => (
  <React.Fragment>
    <WrapChildren {...props}>{props.children}</WrapChildren>
  </React.Fragment>
);

Slides.propTypes = {
  children: PropTypes.node,
  slidesToShow: PropTypes.number,
};

Slides.defaultProps = {
  children: null,
  slidesToShow: 2,
};

export default Slides;
