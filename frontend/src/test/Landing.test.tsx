import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

vi.mock('../store/useThemeStore', () => ({
  useThemeStore: vi.fn((selector) => {
    const store = { theme: 'dark', toggleTheme: vi.fn() };
    return selector ? selector(store) : store;
  }),
}));

function renderLanding() {
  return render(
    <BrowserRouter>
      <Landing />
    </BrowserRouter>
  );
}

describe('Landing Page', () => {
  it('renders the hero section with main heading', () => {
    renderLanding();
    expect(screen.getAllByText('ColdForge').length).toBeGreaterThan(0);
    expect(screen.getByText(/cold emails/i)).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    renderLanding();
    const links = screen.getAllByRole('link');
    const tryItFree = links.find(l => l.textContent?.includes('Try it free'));
    const signIn = links.find(l => l.textContent?.includes('Sign in'));
    expect(tryItFree).toBeTruthy();
    expect(signIn).toBeTruthy();
  });

  it('renders the feature section headings', () => {
    renderLanding();
    expect(screen.getByText('Everything included')).toBeInTheDocument();
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
  });

  it('renders the workflow section', () => {
    renderLanding();
    expect(screen.getByText('From zero to sent in five steps')).toBeInTheDocument();
    expect(screen.getByText('Create a project')).toBeInTheDocument();
    expect(screen.getByText('Generate & send')).toBeInTheDocument();
  });
});
