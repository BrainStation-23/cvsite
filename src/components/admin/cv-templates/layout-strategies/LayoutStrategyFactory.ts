
import { LayoutStrategy } from './LayoutStrategyInterface';
import { SingleColumnStrategy } from './SingleColumnStrategy';
import { MultiColumnStrategy } from './MultiColumnStrategy';

export class LayoutStrategyFactory {
  static createStrategy(layoutType: string): LayoutStrategy {
    switch (layoutType) {
      case 'sidebar':
      case 'two-column':
        return new MultiColumnStrategy();
      case 'single-column':
      default:
        return new SingleColumnStrategy();
    }
  }

  static getSupportedLayouts(): string[] {
    return ['single-column', 'two-column', 'sidebar'];
  }
}
