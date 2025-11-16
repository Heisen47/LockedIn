import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoteButtons from '../src/components/VoteButtons';

describe('VoteButtons', () => {
  it('renders with initial score', () => {
    render(<VoteButtons initial={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with default score of 0', () => {
    render(<VoteButtons />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('increments score on upvote', async () => {
    const user = userEvent.setup();
    render(<VoteButtons initial={10} />);
    
    const upvoteButton = screen.getByLabelText('Upvote');
    await user.click(upvoteButton);
    
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('decrements score on downvote', async () => {
    const user = userEvent.setup();
    render(<VoteButtons initial={10} />);
    
    const downvoteButton = screen.getByLabelText('Downvote');
    await user.click(downvoteButton);
    
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('toggles upvote off when clicked twice', async () => {
    const user = userEvent.setup();
    render(<VoteButtons initial={10} />);
    
    const upvoteButton = screen.getByLabelText('Upvote');
    await user.click(upvoteButton);
    expect(screen.getByText('11')).toBeInTheDocument();
    
    await user.click(upvoteButton);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('toggles downvote off when clicked twice', async () => {
    const user = userEvent.setup();
    render(<VoteButtons initial={10} />);
    
    const downvoteButton = screen.getByLabelText('Downvote');
    await user.click(downvoteButton);
    expect(screen.getByText('9')).toBeInTheDocument();
    
    await user.click(downvoteButton);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('switches from upvote to downvote correctly', async () => {
    const user = userEvent.setup();
    render(<VoteButtons initial={10} />);
    
    const upvoteButton = screen.getByLabelText('Upvote');
    const downvoteButton = screen.getByLabelText('Downvote');
    
    await user.click(upvoteButton);
    expect(screen.getByText('11')).toBeInTheDocument();
    
    await user.click(downvoteButton);
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('applies active styles when upvoted', async () => {
    const user = userEvent.setup();
    render(<VoteButtons initial={0} />);
    
    const upvoteButton = screen.getByLabelText('Upvote');
    await user.click(upvoteButton);
    
    expect(upvoteButton).toHaveClass('border-pink-400/60');
    expect(upvoteButton).toHaveClass('text-pink-300');
  });

  it('applies active styles when downvoted', async () => {
    const user = userEvent.setup();
    render(<VoteButtons initial={0} />);
    
    const downvoteButton = screen.getByLabelText('Downvote');
    await user.click(downvoteButton);
    
    expect(downvoteButton).toHaveClass('border-cyan-400/60');
    expect(downvoteButton).toHaveClass('text-cyan-300');
  });
});
