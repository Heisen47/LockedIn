import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FadeIn, SlideInLeft, SlideInRight, ScaleIn, StaggerContainer, StaggerItem } from '../src/components/Animations';

describe('Animation Components', () => {
  describe('FadeIn', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <FadeIn>
          <div>Test Content</div>
        </FadeIn>
      );
      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FadeIn className="custom-fade">
          <div>Content</div>
        </FadeIn>
      );
      expect(container.firstChild).toHaveClass('custom-fade');
    });

    it('renders with default delay of 0', () => {
      const { container } = render(
        <FadeIn>
          <div>Content</div>
        </FadeIn>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts custom delay prop', () => {
      const { container } = render(
        <FadeIn delay={0.5}>
          <div>Content</div>
        </FadeIn>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('SlideInLeft', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <SlideInLeft>
          <div>Slide Left</div>
        </SlideInLeft>
      );
      expect(getByText('Slide Left')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SlideInLeft className="slide-class">
          <div>Content</div>
        </SlideInLeft>
      );
      expect(container.firstChild).toHaveClass('slide-class');
    });

    it('accepts delay prop', () => {
      const { container } = render(
        <SlideInLeft delay={0.3}>
          <div>Content</div>
        </SlideInLeft>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('SlideInRight', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <SlideInRight>
          <div>Slide Right</div>
        </SlideInRight>
      );
      expect(getByText('Slide Right')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SlideInRight className="right-slide">
          <div>Content</div>
        </SlideInRight>
      );
      expect(container.firstChild).toHaveClass('right-slide');
    });
  });

  describe('ScaleIn', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <ScaleIn>
          <div>Scale Content</div>
        </ScaleIn>
      );
      expect(getByText('Scale Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ScaleIn className="scale-class">
          <div>Content</div>
        </ScaleIn>
      );
      expect(container.firstChild).toHaveClass('scale-class');
    });

    it('works with delay prop', () => {
      const { container } = render(
        <ScaleIn delay={0.2}>
          <div>Content</div>
        </ScaleIn>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('StaggerContainer', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <StaggerContainer>
          <div>Child 1</div>
          <div>Child 2</div>
        </StaggerContainer>
      );
      expect(getByText('Child 1')).toBeInTheDocument();
      expect(getByText('Child 2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <StaggerContainer className="stagger-wrapper">
          <div>Content</div>
        </StaggerContainer>
      );
      expect(container.firstChild).toHaveClass('stagger-wrapper');
    });

    it('works with multiple children', () => {
      const { getAllByText } = render(
        <StaggerContainer>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n}>Item {n}</div>
          ))}
        </StaggerContainer>
      );
      const items = getAllByText(/Item/);
      expect(items).toHaveLength(5);
    });
  });

  describe('StaggerItem', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <StaggerItem>
          <div>Stagger Item</div>
        </StaggerItem>
      );
      expect(getByText('Stagger Item')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <StaggerItem className="item-class">
          <div>Content</div>
        </StaggerItem>
      );
      expect(container.firstChild).toHaveClass('item-class');
    });

    it('works inside StaggerContainer', () => {
      const { getAllByText } = render(
        <StaggerContainer>
          <StaggerItem><div>Item 1</div></StaggerItem>
          <StaggerItem><div>Item 2</div></StaggerItem>
          <StaggerItem><div>Item 3</div></StaggerItem>
        </StaggerContainer>
      );
      const items = getAllByText(/Item/);
      expect(items).toHaveLength(3);
    });
  });

  describe('Integration', () => {
    it('combines multiple animation components', () => {
      const { getByText } = render(
        <FadeIn>
          <StaggerContainer>
            <StaggerItem>
              <ScaleIn>
                <div>Combined Animation</div>
              </ScaleIn>
            </StaggerItem>
          </StaggerContainer>
        </FadeIn>
      );
      expect(getByText('Combined Animation')).toBeInTheDocument();
    });

    it('handles nested animations with delays', () => {
      const { container } = render(
        <FadeIn delay={0.1}>
          <SlideInLeft delay={0.2}>
            <ScaleIn delay={0.3}>
              <div>Nested</div>
            </ScaleIn>
          </SlideInLeft>
        </FadeIn>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
