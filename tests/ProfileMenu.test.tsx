import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileMenu from '../src/components/ProfileMenu';

describe('ProfileMenu', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when user is not logged in', () => {
    localStorage.setItem('demoLoggedIn', 'false');
    const { container } = render(<ProfileMenu handle="testuser" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when user is logged in', () => {
    localStorage.setItem('demoLoggedIn', 'true');
    render(<ProfileMenu handle="testuser" />);
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('uses default handle when not provided', () => {
    localStorage.setItem('demoLoggedIn', 'true');
    render(<ProfileMenu />);
    expect(screen.getByText('@alexcodes')).toBeInTheDocument();
  });

  it('opens menu when clicked', async () => {
    localStorage.setItem('demoLoggedIn', 'true');
    const user = userEvent.setup();
    render(<ProfileMenu handle="testuser" />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('closes menu when clicking outside', async () => {
    localStorage.setItem('demoLoggedIn', 'true');
    const user = userEvent.setup();
    render(
      <div>
        <ProfileMenu handle="testuser" />
        <div data-testid="outside">Outside</div>
      </div>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    
    const outside = screen.getByTestId('outside');
    await user.click(outside);
    
    await waitFor(() => {
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
    });
  });

  it('has correct profile link', async () => {
    localStorage.setItem('demoLoggedIn', 'true');
    const user = userEvent.setup();
    render(<ProfileMenu handle="johndoe" />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const profileLink = screen.getByText('My Profile');
    expect(profileLink.closest('a')).toHaveAttribute('href', '/profile/johndoe');
  });

  it('displays avatar when avatarUrl is provided', () => {
    localStorage.setItem('demoLoggedIn', 'true');
    render(<ProfileMenu handle="testuser" avatarUrl="https://example.com/avatar.jpg" />);
    
    const avatar = screen.getByAltText('avatar');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('displays fallback avatar when no avatarUrl provided', () => {
    localStorage.setItem('demoLoggedIn', 'true');
    const { container } = render(<ProfileMenu handle="testuser" />);
    
    const fallbackAvatar = container.querySelector('.bg-linear-to-br');
    expect(fallbackAvatar).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    localStorage.setItem('demoLoggedIn', 'true');
    render(<ProfileMenu handle="testuser" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates aria-expanded when menu opens', async () => {
    localStorage.setItem('demoLoggedIn', 'true');
    const user = userEvent.setup();
    render(<ProfileMenu handle="testuser" />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
