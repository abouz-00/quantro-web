import React from 'react';
import { render, screen } from '@testing-library/react';
import { CopyToast } from '../CopyToast';

describe('CopyToast', () => {
  it('renders nothing when show is false', () => {
    render(<CopyToast show={false} itemCount={1} />);
    expect(screen.queryByText(/Copied/)).not.toBeInTheDocument();
  });

  it('renders the toast with singular item when show is true and itemCount is 1', () => {
    render(<CopyToast show={true} itemCount={1} />);
    expect(screen.getByText('Copied 1 item to clipboard')).toBeInTheDocument();
  });

  it('renders the toast with plural items when show is true and itemCount is greater than 1', () => {
    render(<CopyToast show={true} itemCount={3} />);
    expect(screen.getByText('Copied 3 items to clipboard')).toBeInTheDocument();
  });

  it('renders the clipboard emoji', () => {
    render(<CopyToast show={true} itemCount={1} />);
    expect(screen.getByText('📋')).toBeInTheDocument();
  });
});
