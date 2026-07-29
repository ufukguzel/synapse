import {act, create} from 'react-test-renderer';
import {ErrorBoundary} from '../src/components/common/ErrorBoundary';

const Boom = () => {
  throw new Error('kaboom');
};

const Ok = () => null;

describe('ErrorBoundary', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => {
    // getDerivedStateFromError / componentDidCatch log to console.error.
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => spy.mockRestore());

  it('renders children when nothing throws', () => {
    let tree!: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <ErrorBoundary>
          <Ok />
        </ErrorBoundary>,
      );
    });
    // No fallback button present.
    expect(tree.root.findAllByProps({testID: 'error-reload'})).toHaveLength(0);
  });

  it('shows the recovery fallback when a child throws', () => {
    let tree!: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
    });
    // Fallback rendered with the reload control.
    expect(tree.root.findAllByProps({testID: 'error-reload'}).length).toBeGreaterThan(0);
  });
});
