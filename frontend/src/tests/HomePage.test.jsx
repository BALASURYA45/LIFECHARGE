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
    const showroomLinks = screen.getAllByRole('link', { name: /3D Showroom/i });
    expect(showroomLinks.length).toBeGreaterThanOrEqual(1);
  });
});
