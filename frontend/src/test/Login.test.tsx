import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

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

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form with all required fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows a link to register page', () => {
    renderLogin();
    const link = screen.getByRole('link', { name: /create one/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });

  it('shows the app logo and title', () => {
    renderLogin();
    expect(screen.getByText('ColdForge')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders the quick autofill button for test account', () => {
    renderLogin();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Autofill')).toBeInTheDocument();
  });
});
