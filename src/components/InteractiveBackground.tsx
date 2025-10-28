import { motion } from 'framer-motion';
import { useState } from 'react';

export default function InteractiveBackground() {
	const [hoveredTile, setHoveredTile] = useState<string | null>(null);

	// Create a grid of tiles (fewer tiles = bigger tiles)
	const rows = 12;
	const cols = 12;

	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-40">
			<div className="grid h-full w-full" style={{
				gridTemplateColumns: `repeat(${cols}, 1fr)`,
				gridTemplateRows: `repeat(${rows}, 1fr)`,
			}}>
				{Array.from({ length: rows * cols }).map((_, index) => {
					const tileId = `tile-${index}`;
					const isHovered = hoveredTile === tileId;

					return (
						<motion.div
							key={tileId}
							className="pointer-events-auto relative border border-slate-700/40"
							onMouseEnter={() => setHoveredTile(tileId)}
							onMouseLeave={() => setHoveredTile(null)}
							animate={{
								borderColor: isHovered
									? 'rgba(6, 182, 212, 0.8)'
									: 'rgba(100, 116, 139, 0.25)',
								boxShadow: isHovered
									? '0 0 30px rgba(6, 182, 212, 0.6), inset 0 0 30px rgba(6, 182, 212, 0.3)'
									: '0 0 0px rgba(6, 182, 212, 0)',
								backgroundColor: isHovered
									? 'rgba(6, 182, 212, 0.05)'
									: 'transparent',
							}}
							transition={{
								duration: 0.3,
								ease: 'easeOut',
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}
