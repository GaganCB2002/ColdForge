import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const store = {
      isAuthenticated: true,
      isLoading: false,
      user: { full_name: 'Test User', email: 'test@test.com' },
      logout: vi.fn(),
    };
    return selector ? selector(store) : store;
  }),
}));

vi.mock('../store/useThemeStore', () => ({
  useThemeStore: vi.fn((selector) => {
    const store = { theme: 'dark' };
    return selector ? selector(store) : store;
  }),
}));

function renderAppLayout(initialRoute = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AppLayout', () => {
  it('renders sidebar navigation with main links', () => {
    renderAppLayout();
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders the user name in the header', () => {
    renderAppLayout();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders the child route content', () => {
    renderAppLayout();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renders the ColdForge branding in sidebar', () => {
    renderAppLayout();
    const brandElements = screen.getAllByText('ColdForge');
    expect(brandElements.length).toBeGreaterThan(0);
  });
});
