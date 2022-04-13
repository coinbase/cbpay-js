import { createEmbeddedContent, EMBEDDED_IFRAME_ID } from './createEmbeddedContent';

describe('createEmbeddedContent', () => {
  it('creates iframe with given URL', () => {
    const iframe = createEmbeddedContent({ url: TEST_URL });
    expect(iframe.src).toMatch(TEST_URL);
  });

  it('gives the iframe a fixed ID', () => {
    const iframe = createEmbeddedContent({ url: TEST_URL });
    expect(iframe.id).toBe(EMBEDDED_IFRAME_ID);
  });

  it('should have default styles (full screen)', () => {
    const iframe = createEmbeddedContent({ url: TEST_URL });

    const { width, height, position, top, border, borderWidth } = iframe.style;
    expect(width).toBe('100%');
    expect(height).toBe('100%');
    expect(position).toBe('fixed');
    expect(top).toBe('0px');
    expect(border).toBe('0px');
    expect(borderWidth).toBe('0px');
  });

  it('allows overriding of some key style properties', () => {
    const iframe = createEmbeddedContent({
      url: TEST_URL,
      width: '50px',
      height: '30vh',
      position: 'absolute',
      top: '18px',
    });

    const { width, height, position, top, border, borderWidth } = iframe.style;
    expect(width).toBe('50px');
    expect(height).toBe('30vh');
    expect(position).toBe('absolute');
    expect(top).toBe('18px');
    // Border should not be changed
    expect(border).toBe('0px');
    expect(borderWidth).toBe('0px');
  });
});

const TEST_URL = 'https://foo.bar';
