/* eslint-env jest */
// v3 moved the bundled mock to the `./jest` subpath; its default export is a
// ready-to-use in-memory AsyncStorage instance.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest').default,
);

jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  const React = require('react');
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaView: ({children}) => React.createElement('View', null, children),
    useSafeAreaInsets: () => inset,
  };
});
