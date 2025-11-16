import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TechStackInput from '../src/components/TechStackInput';

describe('TechStackInput', () => {
  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    mockOnTagsChange.mockClear();
  });

  it('renders with placeholder text', () => {
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />);
    expect(screen.getByPlaceholderText(/Type to search/i)).toBeInTheDocument();
  });

  it('displays existing tags', () => {
    render(<TechStackInput tags={['React', 'TypeScript']} onTagsChange={mockOnTagsChange} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('filters suggestions based on input', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'react');
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  it('adds tag when suggestion is clicked', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'react');
    
    await waitFor(() => {
      const reactOption = screen.getByText('React');
      fireEvent.click(reactOption);
    });
    
    expect(mockOnTagsChange).toHaveBeenCalledWith(['React']);
  });

  it('removes tag when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={['React', 'Vue']} onTagsChange={mockOnTagsChange} />);
    
    const removeButtons = screen.getAllByLabelText(/Remove/i);
    await user.click(removeButtons[0]);
    
    expect(mockOnTagsChange).toHaveBeenCalledWith(['Vue']);
  });

  it('respects maxTags limit', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={['React', 'Vue', 'Angular']} onTagsChange={mockOnTagsChange} maxTags={3} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'node');
    
    // Should show max tags message
    expect(screen.getByText(/Maximum of 3 tags reached/i)).toBeInTheDocument();
  });

  it('adds custom tag when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} allowCustom={true} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'CustomFramework{Enter}');
    
    expect(mockOnTagsChange).toHaveBeenCalledWith(['CustomFramework']);
  });

  it('fills input with highlighted suggestion on Tab key', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i) as HTMLInputElement;
    await user.type(input, 'react');
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });
    
    await user.keyboard('{Tab}');
    
    await waitFor(() => {
      expect(input.value).toBe('React');
    });
  });

  it('navigates suggestions with arrow keys', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'node');
    
    await waitFor(() => {
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
    
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    
    // Check for active class (look for highlighted button text)
    const highlighted = screen.getByText('Node.js').closest('button');
    expect(highlighted).toHaveClass('bg-slate-800/70');
  });

  it('closes dropdown on Escape key', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'react');
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });
  });

  it('does not add duplicate tags', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={['React']} onTagsChange={mockOnTagsChange} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'react');
    
    await waitFor(() => {
      const reactOption = screen.getByText('React');
      fireEvent.click(reactOption);
    });
    
    // Should not call onTagsChange since React is already in tags
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });

  it('clears input after adding tag', async () => {
    const user = userEvent.setup();
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />);
    
    const input = screen.getByPlaceholderText(/Type to search/i) as HTMLInputElement;
    await user.type(input, 'vue');
    
    await waitFor(() => {
      const vueOption = screen.getByText('Vue');
      fireEvent.click(vueOption);
    });
    
    // Input should be cleared after adding tag
    expect(input.value).toBe('');
  });

  it('dispatches custom event when tags change in Astro context', async () => {
    const user = userEvent.setup();
    // Create container element with id for custom event dispatch
    const container = document.createElement('div');
    container.id = 'techstack-container';
    document.body.appendChild(container);
    
    const mockDispatch = vi.spyOn(container, 'dispatchEvent');
    
    render(<TechStackInput tags={[]} onTagsChange={mockOnTagsChange} />, { container });
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    await user.type(input, 'react');
    
    await waitFor(() => {
      const reactOption = screen.getByText('React');
      fireEvent.click(reactOption);
    });
    
    expect(mockDispatch).toHaveBeenCalled();
    mockDispatch.mockRestore();
    document.body.removeChild(container);
  });
});
