import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableBio from '../src/components/EditableBio';

describe('EditableBio', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders initial bio text', () => {
    render(<EditableBio handle="testuser" initialBio="Hello world!" />);
    expect(screen.getByText('Hello world!')).toBeInTheDocument();
  });

  it('shows edit button in view mode', () => {
    render(<EditableBio handle="testuser" initialBio="Test bio" />);
    const editButton = screen.getByLabelText('Edit bio');
    expect(editButton).toBeInTheDocument();
  });

  it('switches to edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Test bio" />);
    
    const editButton = screen.getByLabelText('Edit bio');
    await user.click(editButton);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays textarea with current bio value in edit mode', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Original bio" />);
    
    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Original bio');
  });

  it('updates character count as user types', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="" maxLength={50} />);
    
    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello');
    
    expect(screen.getByText(/45/)).toBeInTheDocument(); // 50 - 5
  });

  it('shows warning when character limit is exceeded', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Test bio" maxLength={20} />);

    await user.click(screen.getByLabelText('Edit bio'));
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'This is way too long!!'); // 22 chars to exceed 20
    
    const counter = screen.getByText(/-2 characters left/);
    expect(counter).toHaveClass('text-rose-400');
  });  it('saves bio to localStorage when Save is clicked', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="johndoe" initialBio="Original" />);
    
    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Updated bio');
    
    await user.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(localStorage.getItem('profile:johndoe:bio')).toBe('Updated bio');
    });
  });

  it('updates displayed bio after saving', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Original" />);
    
    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'New bio text');
    
    await user.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(screen.getByText('New bio text')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('cancels editing without saving changes', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Original bio" />);
    
    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Changed text');
    
    await user.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.getByText('Original bio')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('disables Save button when bio is too long', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Short" maxLength={50} />);

    await user.click(screen.getByLabelText('Edit bio'));
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'x'.repeat(60)); // Exceed maxLength
    
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('disables Save button when bio is empty', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Original" />);
    
    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('disables Save button when no changes made', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Same bio" />);

    await user.click(screen.getByLabelText('Edit bio'));
    
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('loads saved bio from localStorage on mount', async () => {
    localStorage.setItem('profile:saveduser:bio', 'Saved bio text');
    
    render(<EditableBio handle="saveduser" initialBio="Initial bio" />);
    
    await waitFor(() => {
      expect(screen.getByText('Saved bio text')).toBeInTheDocument();
    });
  });

  it('trims whitespace when saving', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Original" />);
    
    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '  Trimmed bio  ');
    
    await user.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(localStorage.getItem('profile:testuser:bio')).toBe('Trimmed bio');
    });
  });

  it('uses custom maxLength when provided', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="Test" maxLength={100} />);

    await user.click(screen.getByLabelText('Edit bio'));
    
    expect(screen.getByText(/96 characters left/)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <EditableBio handle="testuser" initialBio="Test" className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows placeholder text in textarea', async () => {
    const user = userEvent.setup();
    render(<EditableBio handle="testuser" initialBio="" />);

    await user.click(screen.getByLabelText('Edit bio'));
    
    const textarea = screen.getByPlaceholderText(/Tell people what you.*re building/i);
    expect(textarea).toBeInTheDocument();
  });
});
