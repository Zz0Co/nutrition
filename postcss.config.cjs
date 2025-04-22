module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
      selectorBlackList: [],
      unitPrecision: 5,
      minPixelValue: 2,
      mediaQuery: false,
      exclude: /node_modules/i,
    },
  },
};