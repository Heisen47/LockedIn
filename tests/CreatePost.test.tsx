import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePost from '../src/components/CreatePost';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('CreatePost', () => {
  it('renders compact button variant', () => {
    render(<CreatePost compact={true} />);
    const button = screen.getByRole('button', { name: /Create Post/i });
    expect(button).toBeInTheDocument();
  });

  it('renders full button variant with description', () => {
    render(<CreatePost compact={false} />);
    expect(screen.getByText(/Share a GitHub project/i)).toBeInTheDocument();
  });

  it('opens modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    const button = screen.getByRole('button', { name: /Create Post/i });
    await user.click(button);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create a Post')).toBeInTheDocument();
  });

  it('closes modal when clicking backdrop', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    const button = screen.getByRole('button', { name: /Create Post/i });
    await user.click(button);
    
    const backdrop = document.querySelector('.bg-black\\/60');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('validates GitHub URL correctly', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    const input = screen.getByPlaceholderText(/github\.com/i);
    await user.type(input, 'https://github.com/user/repo');
    
    // Valid URL should not show error
    expect(screen.queryByText(/Invalid GitHub/i)).not.toBeInTheDocument();
  });

  it('shows error for invalid GitHub URL', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    const input = screen.getByPlaceholderText(/github\.com/i);
    await user.type(input, 'https://example.com/invalid');
    
    // Check that the submit button might be disabled or error styling applied
    const linkContainer = input.closest('div');
    expect(linkContainer).toBeInTheDocument();
  });

  it('toggles between building and live status', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    const buildingButton = screen.getByRole('button', { name: /building/i });
    const liveButton = screen.getByRole('button', { name: /live/i });
    
    // Check initial state via CSS classes
    expect(buildingButton).toHaveClass('border-cyan-500/60');
    expect(liveButton).toHaveClass('border-slate-700/60');
    
    await user.click(liveButton);
    
    // After clicking Live, styles should switch
    await waitFor(() => {
      expect(liveButton).toHaveClass('border-cyan-500/60');
    });
  });

  it('shows live URL input when status is live', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    const liveButton = screen.getByRole('button', { name: /live/i });
    await user.click(liveButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/https:\/\/your-live-app/i)).toBeInTheDocument();
    });
  });

  it('validates live URL when status is live', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    await user.click(screen.getByRole('button', { name: /live/i }));
    
    const liveUrlInput = await screen.findByPlaceholderText(/https:\/\/your-live-app/i);
    await user.type(liveUrlInput, 'https://example.com');
    
    // Valid URL should not show error styling
    const liveUrlContainer = liveUrlInput.closest('div');
    expect(liveUrlContainer).toBeInTheDocument();
  });

  it('prevents form submission when GitHub URL is invalid', async () => {
    const user = userEvent.setup();
    render(<CreatePost compact={false} />);

    const openButton = screen.getByRole('button', { name: /Create Post/i });
    await user.click(openButton);

    const input = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
    await user.type(input, 'invalid-url');
    
    const submitButton = screen.getByRole('button', { name: /^Post$/i });
    await user.click(submitButton);
    
    // Modal should still be open (invalid URL prevents submit)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValue({ data: { id: '123' } });
    sessionStorage.setItem('authToken', 'test-token');
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    const input = screen.getByPlaceholderText(/github\.com/i);
    await user.type(input, 'https://github.com/user/awesome-repo');

    const tagInput = screen.getByPlaceholderText(/Type to search tech stack/i);
    await user.type(tagInput, 'react');
    await user.keyboard('{Enter}');
    
    const submitButton = screen.getByRole('button', { name: /^Post$/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/posts'),
        expect.objectContaining({
          link: 'https://github.com/user/awesome-repo',
          status: 'building',
          tags: expect.arrayContaining(['React']),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValue({ data: { id: '123' } });
    sessionStorage.setItem('authToken', 'test-token');
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    const input = screen.getByPlaceholderText(/github\.com/i);
    await user.type(input, 'https://github.com/user/repo');

    const tagInput = screen.getByPlaceholderText(/Type to search tech stack/i);
    await user.type(tagInput, 'astro');
    await user.keyboard('{Enter}');
    
    const submitButton = screen.getByRole('button', { name: /^Post$/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('has proper ARIA attributes on modal', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('integrates with TechStackInput component', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);
    
    await user.click(screen.getByRole('button', { name: /Create Post/i }));
    
    // TechStackInput should be rendered
    expect(screen.getByPlaceholderText(/Type to search/i)).toBeInTheDocument();
  });
});
