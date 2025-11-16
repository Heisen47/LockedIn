import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedSectionProps {
	children: ReactNode;
	delay?: number;
	className?: string;
}

export function FadeIn({ children, delay = 0, className = '' }: AnimatedSectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-100px' }}
			transition={{ duration: 0.6, delay, ease: 'easeOut' }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function SlideInLeft({ children, delay = 0, className = '' }: AnimatedSectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -30 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true, margin: '-100px' }}
			transition={{ duration: 0.6, delay, ease: 'easeOut' }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function SlideInRight({ children, delay = 0, className = '' }: AnimatedSectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true, margin: '-100px' }}
			transition={{ duration: 0.6, delay, ease: 'easeOut' }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function ScaleIn({ children, delay = 0, className = '' }: AnimatedSectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			whileInView={{ opacity: 1, scale: 1 }}
			viewport={{ once: true, margin: '-100px' }}
			transition={{ duration: 0.6, delay, ease: 'easeOut' }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function StaggerContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-100px' }}
			variants={{
				visible: {
					transition: {
						staggerChildren: 0.1,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: { opacity: 1, y: 0 },
			}}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
