import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import HomePage from '../pages/HomePage.jsx';

describe('HomePage', () => {
  it('renders main heading and showroom link', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const dashboardLinks = screen.getAllByRole('link', { name: /Dashboard/i });
    expect(dashboardLinks.length).toBeGreaterThanOrEqual(1);
  });
});
