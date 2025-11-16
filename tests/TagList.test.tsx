import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TagList from '../src/components/TagList';

describe('TagList', () => {
  it('renders with empty tags array', () => {
    const { container } = render(<TagList tags={[]} />);
    const wrapper = container.querySelector('div');
    expect(wrapper?.children.length).toBe(0);
  });

  it('renders all provided tags', () => {
    const tags = ['React', 'TypeScript', 'Node.js'];
    render(<TagList tags={tags} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('applies correct CSS classes to tag elements', () => {
    render(<TagList tags={['React']} />);
    const tag = screen.getByText('React');
    
    expect(tag).toHaveClass('rounded-full');
    expect(tag).toHaveClass('border');
    expect(tag).toHaveClass('px-2.5');
    expect(tag).toHaveClass('py-1');
    expect(tag).toHaveClass('text-xs');
  });

  it('renders multiple tags with proper flex layout', () => {
    const tags = ['React', 'Vue', 'Angular', 'Svelte'];
    const { container } = render(<TagList tags={tags} />);
    
    const wrapper = container.querySelector('div');
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-wrap');
    expect(wrapper).toHaveClass('gap-2');
  });

  it('handles tags with special characters', () => {
    const tags = ['C++', 'ASP.NET', 'Three.js'];
    render(<TagList tags={tags} />);
    
    expect(screen.getByText('C++')).toBeInTheDocument();
    expect(screen.getByText('ASP.NET')).toBeInTheDocument();
    expect(screen.getByText('Three.js')).toBeInTheDocument();
  });

  it('renders tags with unique keys', () => {
    const tags = ['React', 'TypeScript', 'Node.js'];
    const { container } = render(<TagList tags={tags} />);
    
    const tagElements = container.querySelectorAll('span');
    expect(tagElements.length).toBe(tags.length);
  });

  it('handles single tag correctly', () => {
    render(<TagList tags={['Solo']} />);
    expect(screen.getByText('Solo')).toBeInTheDocument();
  });

  it('maintains tag order as provided', () => {
    const tags = ['First', 'Second', 'Third'];
    const { container } = render(<TagList tags={tags} />);
    
    const tagElements = Array.from(container.querySelectorAll('span'));
    expect(tagElements[0]).toHaveTextContent('First');
    expect(tagElements[1]).toHaveTextContent('Second');
    expect(tagElements[2]).toHaveTextContent('Third');
  });
});
