import { vi } from 'vitest';

// Unit tests load server modules in Node, outside React's server export condition.
vi.mock('server-only', () => ({}));
