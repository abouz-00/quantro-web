import { GET, POST } from '../route';

describe('auth/[...nextauth]/route', () => {
  it('exports GET and POST handlers', () => {
    expect(GET).toBeDefined();
    expect(POST).toBeDefined();
  });
});
