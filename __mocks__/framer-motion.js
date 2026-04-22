const React = require('react');

const MOTION_PROP_NAMES = new Set([
  'animate',
  'custom',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'exit',
  'initial',
  'layout',
  'layoutId',
  'transition',
  'variants',
  'viewport',
  'whileDrag',
  'whileFocus',
  'whileHover',
  'whileInView',
  'whileTap',
]);

const componentCache = new Map();

function stripMotionProps(props) {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !MOTION_PROP_NAMES.has(key)),
  );
}

function createMotionComponent(tag) {
  if (componentCache.has(tag)) {
    return componentCache.get(tag);
  }

  const MotionComponent = React.forwardRef(({ children, ...props }, ref) =>
    React.createElement(tag, { ...stripMotionProps(props), ref }, children),
  );

  MotionComponent.displayName = `MockMotion(${tag})`;
  componentCache.set(tag, MotionComponent);

  return MotionComponent;
}

const motion = new Proxy(
  {},
  {
    get(_, tag) {
      return createMotionComponent(tag);
    },
  },
);

module.exports = {
  __esModule: true,
  AnimatePresence: function AnimatePresence({ children }) {
    return React.createElement(React.Fragment, null, children);
  },
  motion,
  useAnimation: () => ({
    set: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useInView: () => true,
};