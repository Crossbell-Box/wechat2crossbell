/* craco.config.js */

module.exports = {
  webpack: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": __dirname + "/src",
    },
    resolve: {
      fallback: {
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        url: require.resolve("url/"),
      },
    },
  },
};
