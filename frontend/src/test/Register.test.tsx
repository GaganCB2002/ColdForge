import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

vi.mock('../lib/api', () => ({
  default: { post: vi.fn() },
}));

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const store = { login: vi.fn(), fetchUser: vi.fn() };
    return selector ? selector(store) : store;
  }),
}));

vi.mock('../store/useThemeStore', () => ({
  useThemeStore: vi.fn((selector) => {
    const store = { theme: 'dark', toggleTheme: vi.fn() };
    return selector ? selector(store) : store;
  }),
}));

function renderRegister() {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
}

describe('Register Page', () => {
  it('renders the registration form with all required fields', () => {
    renderRegister();
    expect(screen.getAllByPlaceholderText('you@example.com')[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders a link to login page', () => {
    renderRegister();
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });

  it('shows the app branding', () => {
    renderRegister();
    expect(screen.getByText('ColdForge')).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });
});
