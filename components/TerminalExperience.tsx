import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollPosition } from "@/hooks/useScrollPosition";

// Improve the scroll utility
const ScrollUtility = {
	isAtBottom: (element: HTMLElement | null): boolean => {
		if (!element) return false;
		const { scrollHeight, scrollTop, clientHeight } = element;
		return Math.abs(scrollHeight - scrollTop - clientHeight) <= 1;
	},

	scrollToBottom: (element: HTMLElement | null) => {
		if (!element) return;
		// Use a more precise scrolling mechanism
		const targetScroll = element.scrollHeight - element.clientHeight;
		if (Math.abs(element.scrollTop - targetScroll) > 1) {
			element.scrollTop = targetScroll;
		}
	},
};

// Replace the useScrollLock hook with this new implementation
const useScrollLock = () => {
	const lock = useCallback(() => {
		// Don't modify scroll position, just prevent scrolling
		document.body.style.overflow = "hidden";
	}, []);

	const unlock = useCallback(() => {
		document.body.style.overflow = "";
	}, []);

	useEffect(() => {
		return () => {
			// Ensure we clean up any locked state
			document.body.style.overflow = "";
		};
	}, []);

	return { lock, unlock };
};

const Taskbar = ({
	minimizedWindows,
	onRestore,
}: {
	minimizedWindows: { id: string; title: string }[];
	onRestore: (id: string) => void;
}) => (
	<motion.div
		initial={{ y: 100 }}
		animate={{ y: 0 }}
		className="fixed bottom-0 left-0 right-0 h-16 bg-purple-950/50 backdrop-blur-xl border-t border-purple-500/20 flex items-center px-4 gap-2 z-50 overflow-x-auto">
		<div className="flex gap-2 items-center min-w-0 flex-shrink-0">
			{minimizedWindows.map((window) => (
				<button
					key={window.id}
					onClick={() => onRestore(window.id)}
					className="px-3 py-1 bg-purple-900/30 rounded text-sm text-purple-200/70 hover:bg-purple-800/30 whitespace-nowrap">
					{window.title}
				</button>
			))}
		</div>
		<div className="ml-auto text-purple-200/30 text-xs hidden sm:block">
			Try clicking around...
		</div>
	</motion.div>
);

interface TerminalWindowProps {
	children: [React.ReactNode, React.ReactNode, React.ReactNode];
	position: { x: number; y: number };
	size: { width: number; height: number };
	isFullScreen: boolean;
	onPositionChange: (position: { x: number; y: number }) => void;
	onSizeChange: (size: { width: number; height: number }) => void;
	onFullScreenChange: (isFullScreen: boolean) => void;
	isActive: boolean;
	onActivate: () => void;
	terminalContentRef: React.RefObject<HTMLDivElement>; // Add this prop
	inputRef: React.RefObject<HTMLTextAreaElement>; // Add this line
	onTouchStart: (e: React.TouchEvent) => void;
	onTouchMove: (e: React.TouchEvent) => void;
	onTouchEnd: () => void;
}

interface ResizeState {
	isResizing: boolean;
	wasAtBottom: boolean;
	type: "left" | "right" | "bottom" | "bottom-right" | null;
	startPos: { x: number; y: number };
	startSize: { width: number; height: number };
}

const TEXTAREA_BASE_HEIGHT = 24; // Base height in pixels

// Add this utility function at the top level
const isMobileDevice = () => {
	return typeof window !== "undefined" && window.innerWidth < 768;
};

// Update the TerminalWindow component
const TerminalWindow = ({
	children,
	position,
	size,
	isFullScreen,
	onPositionChange,
	onSizeChange,
	onFullScreenChange,
	isActive,
	onActivate,
	terminalContentRef, // Add this prop
	inputRef, // Add this prop
	onTouchStart,
	onTouchMove,
	onTouchEnd,
}: TerminalWindowProps) => {
	// Replace all drag related state with these two simple states
	const [isDragging, setIsDragging] = useState(false);
	const dragOffset = useRef({ x: 0, y: 0 });
	const { lock: lockScroll, unlock: unlockScroll } = useScrollLock();

	const [resizeState, setResizeState] = useState<ResizeState>({
		isResizing: false,
		wasAtBottom: false,
		type: null,
		startPos: { x: 0, y: 0 },
		startSize: { width: 0, height: 0 },
	});

	// Keep track of animation frame ID for cleanup
	const animationFrameRef = useRef<number>(0);

	// Add handleMouseDown for resize operations
	const handleMouseDown = (
		e: React.MouseEvent,
		type: "left" | "right" | "bottom" | "bottom-right"
	) => {
		if (isFullScreen) return;

		e.preventDefault();
		e.stopPropagation();
		onActivate();

		setResizeState({
			isResizing: true,
			wasAtBottom: ScrollUtility.isAtBottom(terminalContentRef.current),
			type,
			startPos: { x: e.clientX, y: e.clientY },
			startSize: { width: size.width, height: size.height },
		});
	};

	const handleDragStart = (e: React.MouseEvent) => {
		if (isFullScreen || (e.target as HTMLElement).closest("button")) return;

		e.preventDefault();
		e.stopPropagation(); // Stop event propagation
		onActivate();

		const startX = e.clientX - position.x;
		const startY = e.clientY - position.y;

		const handleDrag = (e: MouseEvent) => {
			e.preventDefault(); // Prevent default behavior

			requestAnimationFrame(() => {
				onPositionChange({
					x: e.clientX - startX,
					y: e.clientY - startY,
				});
			});
		};

		const handleDragEnd = () => {
			document.removeEventListener("mousemove", handleDrag);
			document.removeEventListener("mouseup", handleDragEnd);
		};

		document.addEventListener("mousemove", handleDrag);
		document.addEventListener("mouseup", handleDragEnd);
	};

	// Remove the old drag effect and state
	// Single effect for drag handling
	useEffect(() => {
		if (!isDragging) return;

		const handleDrag = (e: MouseEvent) => {
			requestAnimationFrame(() => {
				onPositionChange({
					x: e.clientX - dragOffset.current.x,
					y: e.clientY - dragOffset.current.y,
				});
			});
		};

		const handleDragEnd = () => setIsDragging(false);

		document.addEventListener("mousemove", handleDrag);
		document.addEventListener("mouseup", handleDragEnd);

		return () => {
			document.removeEventListener("mousemove", handleDrag);
			document.removeEventListener("mouseup", handleDragEnd);
		};
	}, [isDragging, onPositionChange]);

	// Add fullscreen scroll prevention using the scroll lock hook
	useEffect(() => {
		if (isFullScreen) {
			lockScroll();
		} else {
			unlockScroll();
		}

		// Cleanup on unmount
		return () => {
			if (isFullScreen) {
				unlockScroll();
			}
		};
	}, [isFullScreen, lockScroll, unlockScroll]);

	useEffect(() => {
		if (!resizeState.isResizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			const deltaX = e.clientX - resizeState.startPos.x;
			const deltaY = e.clientY - resizeState.startPos.y;

			// Cancel any pending animation frame
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			// Schedule new size calculation and scroll update
			animationFrameRef.current = requestAnimationFrame(() => {
				switch (resizeState.type) {
					case "right":
						onSizeChange({
							width: Math.max(400, resizeState.startSize.width + deltaX),
							height: size.height,
						});
						break;
					case "left":
						const newWidth = Math.max(
							400,
							resizeState.startSize.width - deltaX
						);
						onSizeChange({
							width: newWidth,
							height: size.height,
						});
						onPositionChange({
							x:
								resizeState.startPos.x +
								(resizeState.startSize.width - newWidth),
							y: position.y,
						});
						break;
					case "bottom":
					case "bottom-right":
						onSizeChange({
							width:
								resizeState.type === "bottom-right"
									? Math.max(400, resizeState.startSize.width + deltaX)
									: size.width,
							height: Math.max(200, resizeState.startSize.height + deltaY),
						});
						break;
				}

				// Maintain scroll position if it was at bottom initially
				if (resizeState.wasAtBottom && terminalContentRef.current) {
					ScrollUtility.scrollToBottom(terminalContentRef.current);
				}
			});
		};

		const handleMouseUp = () => {
			setResizeState((prev) => ({
				...prev,
				isResizing: false,
				type: null,
			}));

			// Cancel any pending animation frame
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = 0;
			}
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			// Cleanup any pending animation frame
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [
		resizeState,
		onSizeChange,
		onPositionChange,
		size.height,
		size.width,
		terminalContentRef,
		position.y,
	]);

	// Window resize handler
	useEffect(() => {
		const handleWindowResize = () => {
			if (terminalContentRef.current) {
				const wasAtBottom = ScrollUtility.isAtBottom(
					terminalContentRef.current
				);
				if (wasAtBottom) {
					requestAnimationFrame(() => {
						ScrollUtility.scrollToBottom(terminalContentRef.current);
					});
				}
			}
		};

		window.addEventListener("resize", handleWindowResize);
		return () => window.removeEventListener("resize", handleWindowResize);
	}, [terminalContentRef]);

	// Add state to track mouse down time and position
	const mouseDownRef = useRef({ time: 0, x: 0, y: 0 });

	// Update click handler for auto-focus
	const handleTerminalClick = (e: React.MouseEvent) => {
		// Get time and distance since mouse down
		const timeSinceMouseDown = Date.now() - mouseDownRef.current.time;
		const distanceX = Math.abs(e.clientX - mouseDownRef.current.x);
		const distanceY = Math.abs(e.clientY - mouseDownRef.current.y);

		// Only focus if:
		// 1. It's a quick click (less than 200ms)
		// 2. Mouse hasn't moved much (not dragging)
		// 3. It's not a double click
		// 4. It's not on a button
		if (
			timeSinceMouseDown < 200 &&
			distanceX < 5 &&
			distanceY < 5 &&
			e.detail === 1 &&
			(isFullScreen || !(e.target as HTMLElement).closest("button"))
		) {
			if (inputRef.current) {
				inputRef.current.focus();
				const length = inputRef.current.value.length;
				requestAnimationFrame(() => {
					inputRef.current?.setSelectionRange(
						Math.max(17, length),
						Math.max(17, length)
					);
				});
			}
		}
		onActivate();
	};

	// Add mouse down handler
	const handleTerminalMouseDown = (e: React.MouseEvent) => {
		mouseDownRef.current = {
			time: Date.now(),
			x: e.clientX,
			y: e.clientY,
		};
	};

	return (
		<>
			{isFullScreen && (
				<>
					<div
						className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
						style={{
							zIndex: 999,
						}}
					/>
					<div
						className="fixed inset-0 flex items-center justify-center"
						style={{
							zIndex: 1000,
						}}
						onClick={(e) => {
							if (e.target === e.currentTarget) {
								onFullScreenChange(false);
							}
						}}>
						<motion.div
							initial={{ scale: 0.95, opacity: 0, y: 20 }}
							animate={{
								scale: 1,
								opacity: 1,
								y: 0,
								transition: {
									type: "spring",
									stiffness: 300,
									damping: 25,
								},
							}}
							exit={{ scale: 0.95, opacity: 0, y: 20 }}
							style={{
								width: "90%",
								height: "85%",
								maxWidth: "1600px",
								maxHeight: "900px",
								position: "relative",
								zIndex: 1001,
							}}
							onClick={handleTerminalClick} // Add click handler here
							onMouseDown={handleTerminalMouseDown} // Add mouse down handler
							className="backdrop-blur-xl bg-purple-900/10 rounded-lg shadow-2xl border border-purple-500/20 overflow-hidden flex flex-col">
							{/* Header */}
							<div
								className="flex items-center gap-2 p-3 bg-purple-950/50 border-b border-purple-500/20 sticky top-0 z-10 terminal-header"
								onMouseDown={handleDragStart}
								style={{ cursor: isFullScreen ? "default" : "move" }}>
								<div className="flex gap-2 z-10">{children[0]}</div>
								<div className="flex-1 text-right text-purple-200/70 text-sm select-none">
									{children[1]}
								</div>
							</div>

							{/* Content */}
							<div className="flex-1 overflow-hidden relative">
								{children[2]}
							</div>

							{/* Only show resize handles when not in fullscreen */}
							{!isFullScreen && (
								<>
									<div
										className={`absolute left-0 top-0 h-full cursor-w-resize hover:bg-purple-500/20 touch-manipulation resize-left ${
											isMobileDevice() ? "w-8" : "w-1"
										}`}
										onMouseDown={(e) => handleMouseDown(e, "left")}
									/>
									<div
										className={`absolute right-0 top-0 h-full cursor-e-resize hover:bg-purple-500/20 touch-manipulation resize-right ${
											isMobileDevice() ? "w-8" : "w-1"
										}`}
										onMouseDown={(e) => handleMouseDown(e, "right")}
									/>
									<div
										className={`absolute bottom-0 left-0 w-full cursor-s-resize hover:bg-purple-500/20 touch-manipulation resize-bottom ${
											isMobileDevice() ? "h-8" : "h-1"
										}`}
										onMouseDown={(e) => handleMouseDown(e, "bottom")}
									/>
									<div
										className={`absolute bottom-0 right-0 cursor-se-resize hover:bg-purple-500/20 touch-manipulation resize-bottom-right ${
											isMobileDevice() ? "w-8 h-8" : "w-3 h-3"
										}`}
										onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
									/>
								</>
							)}
						</motion.div>
					</div>
				</>
			)}
			{!isFullScreen && (
				<motion.div
					initial={{ scale: 0.95, opacity: 0, y: 20 }}
					animate={{
						scale: 1,
						opacity: 1,
						y: 0,
						transition: {
							type: "spring",
							stiffness: 300,
							damping: 25,
						},
					}}
					exit={{ scale: 0.95, opacity: 0, y: 20 }}
					style={{
						position: "absolute",
						left: position.x,
						top: position.y,
						width: size.width,
						height: size.height,
						zIndex: isActive ? 10 : 1,
					}}
					onClick={handleTerminalClick}
					onMouseDown={handleTerminalMouseDown} // Add mouse down handler
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
					className="backdrop-blur-xl bg-purple-900/10 rounded-lg shadow-2xl border border-purple-500/20 overflow-hidden flex flex-col touch-manipulation">
					{/* Header */}
					<div
						className="flex items-center gap-2 p-3 bg-purple-950/50 border-b border-purple-500/20 sticky top-0 z-10 terminal-header"
						onMouseDown={handleDragStart}
						style={{ cursor: isFullScreen ? "default" : "move" }}>
						<div className="flex gap-2 z-10">{children[0]}</div>
						<div className="flex-1 text-right text-purple-200/70 text-sm select-none">
							{children[1]}
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-hidden relative">{children[2]}</div>

					{/* Only show resize handles when not in fullscreen */}
					{!isFullScreen && (
						<>
							<div
								className={`absolute left-0 top-0 h-full cursor-w-resize hover:bg-purple-500/20 touch-manipulation resize-left ${
									isMobileDevice() ? "w-8" : "w-1"
								}`}
								onMouseDown={(e) => handleMouseDown(e, "left")}
							/>
							<div
								className={`absolute right-0 top-0 h-full cursor-e-resize hover:bg-purple-500/20 touch-manipulation resize-right ${
									isMobileDevice() ? "w-8" : "w-1"
								}`}
								onMouseDown={(e) => handleMouseDown(e, "right")}
							/>
							<div
								className={`absolute bottom-0 left-0 w-full cursor-s-resize hover:bg-purple-500/20 touch-manipulation resize-bottom ${
									isMobileDevice() ? "h-8" : "h-1"
								}`}
								onMouseDown={(e) => handleMouseDown(e, "bottom")}
							/>
							<div
								className={`absolute bottom-0 right-0 cursor-se-resize hover:bg-purple-500/20 touch-manipulation resize-bottom-right ${
									isMobileDevice() ? "w-8 h-8" : "w-3 h-3"
								}`}
								onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
							/>
						</>
					)}
				</motion.div>
			)}
		</>
	);
};

const useResizeTextarea = (
	textareaRef: React.RefObject<HTMLTextAreaElement>,
	containerRef: React.RefObject<HTMLDivElement>
) => {
	const resize = useCallback(() => {
		if (!textareaRef.current || !containerRef.current) return;

		// Check if at bottom before resize
		const wasAtBottom = ScrollUtility.isAtBottom(containerRef.current);
		const originalHeight = textareaRef.current.style.height;

		textareaRef.current.style.height = `${TEXTAREA_BASE_HEIGHT}px`;
		const newHeight = textareaRef.current.scrollHeight;

		// Only update if height actually changed
		if (textareaRef.current.style.height !== `${newHeight}px`) {
			textareaRef.current.style.height = `${newHeight}px`;

			// Scroll to bottom after a short delay to ensure DOM has updated
			if (wasAtBottom) {
				requestAnimationFrame(() => {
					ScrollUtility.scrollToBottom(containerRef.current);
				});
			}
		} else {
			textareaRef.current.style.height = originalHeight;
		}
	}, [textareaRef, containerRef]);

	useEffect(() => {
		const textarea = textareaRef.current;
		const container = containerRef.current;
		if (!textarea || !container) return;

		const resizeObserver = new ResizeObserver(() => {
			const wasAtBottom = ScrollUtility.isAtBottom(container);
			resize();
			if (wasAtBottom) {
				requestAnimationFrame(() => {
					ScrollUtility.scrollToBottom(container);
				});
			}
		});

		resizeObserver.observe(textarea);
		resizeObserver.observe(container);

		const handleWindowResize = () => {
			const wasAtBottom = ScrollUtility.isAtBottom(container);
			resize();
			if (wasAtBottom) {
				requestAnimationFrame(() => {
					ScrollUtility.scrollToBottom(container);
				});
			}
		};

		window.addEventListener("resize", handleWindowResize);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", handleWindowResize);
		};
	}, [resize, textareaRef, containerRef]);

	return resize;
};

// Add this interface and commands object before the TerminalExperience component
interface CommandResponse {
	output: string;
	action?: () => void;
}

const AVAILABLE_COMMANDS: {
	[key: string]: (args: string[]) => CommandResponse;
} = {
	help: () => ({
		output: `
Available commands:
  help          - Show this help message
  clear         - Clear the terminal
  about         - Learn about me
  skills        - List my technical skills
  projects      - View my main projects
  contact       - Get my contact information
  github        - Open my GitHub profile
  linkedin      - Open my LinkedIn profile
  experience    - Show my work experience
  education     - Show my educational background
  whoami        - Who am I?
  date          - Show current date and time
`.trim(),
	}),

	clear: () => ({
		output: "",
		action: () => {
			// The action will be handled in the handleCommand function
			return;
		},
	}),

	about: () => ({
		output: `
Hi there! 👋 I'm a full-stack developer passionate about building elegant solutions.
I specialize in web development using modern technologies and best practices.
Type 'skills' to see my technical expertise or 'projects' to view my work.
`.trim(),
	}),

	skills: () => ({
		output: `
Technical Skills:
┌─────────────────┐
│ Frontend        │
├─────────────────┤
│ • React/Next.js │
│ • TypeScript    │
│ • Tailwind CSS  │
│ • Redux         │
└─────────────────┘
┌─────────────────┐
│ Backend         │
├─────────────────┤
│ • Node.js      │
│ • Python       │
│ • PHP/Symfony  │
│ • MySQL        │
└─────────────────┘
`.trim(),
	}),

	projects: () => ({
		output: `
🚀 Notable Projects:
1. Portfolio Website (Next.js, TypeScript)
   - Interactive terminal interface
   - Responsive design
   
2. E-Commerce Platform (Symfony)
   - Full-stack development
   - Payment integration
   
3. Harry Potter Trading Cards
   - Real-time card trading
   - Firebase integration

Type 'github' to see more projects!
`.trim(),
	}),

	contact: () => ({
		output: `
📫 Contact Information:
- Email: your.email@example.com
- LinkedIn: linkedin.com/in/yourprofile
- GitHub: github.com/yourusername
`.trim(),
	}),

	github: () => ({
		output: "Opening GitHub profile...",
		action: () => {
			window.open("https://github.com/yourusername", "_blank");
		},
	}),

	linkedin: () => ({
		output: "Opening LinkedIn profile...",
		action: () => {
			window.open("https://linkedin.com/in/yourprofile", "_blank");
		},
	}),

	experience: () => ({
		output: `
💼 Work Experience:
2023-Present | Senior Frontend Developer
- Leading development of React applications
- Mentoring junior developers

2021-2023 | Full Stack Developer
- Built scalable web applications
- Implemented CI/CD pipelines
`.trim(),
	}),

	education: () => ({
		output: `
🎓 Education:
2018-2022 | Bachelor's in Computer Science
- Major: Software Engineering
- GPA: 3.8/4.0
`.trim(),
	}),

	whoami: () => ({
		output: "ilan@portfolio",
	}),

	date: () => ({
		output: new Date().toLocaleString(),
	}),
};

// Add this interface near the top with other interfaces
interface TouchState {
	startX: number;
	startY: number;
	initialWidth: number;
	initialHeight: number;
	isResizing: boolean;
	resizeType: "left" | "right" | "bottom" | "bottom-right" | null;
}

const TerminalExperience = () => {
	// Add new state for input prompt visibility
	const [showPrompt, setShowPrompt] = useState(false);
	const [text, setText] = useState("");
	const [isMinimized, setIsMinimized] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [, setHasStartedTyping] = useState(false);
	const [minimizedWindows, setMinimizedWindows] = useState<
		{ id: string; title: string }[]
	>([]);
	const terminalRef = useRef<HTMLDivElement>(null);
	const [isActive, setIsActive] = useState(false);
	const [userInput, setUserInput] = useState("");
	const [hasFinishedTyping, setHasFinishedTyping] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(
		null
	) as React.RefObject<HTMLTextAreaElement>;
	const terminalContentRef = useRef<HTMLDivElement>(
		null
	) as React.RefObject<HTMLDivElement>;
	const wasScrolledToBottom = useRef(true);
	const [isTypingComplete, setIsTypingComplete] = useState(false);
	const [commandHistory, setCommandHistory] = useState<string>("");
	const isTypingRef = useRef(false);
	const activeInputRef = useRef<boolean>(false);
	const initialLoadRef = useRef(true);

	const { isAtBottom, updateScrollState } =
		useScrollPosition(terminalContentRef);

	const experience = useMemo(
		() => [
			"> Loading professional experience...",
			"> Portfolio Website (2025)",
			"  • Built using Next.js, TypeScript, and Tailwind CSS",
			"  • Implemented interactive terminal interface",
			"  • Responsive design for all devices",
			"> Symfony E-Commerce Website (2024)",
			"  • Created with Symfony and MySQL",
			"  • Features user authentication and real-time updates",
			"> Harry Potter Trading Card Website (2024)",
			"  • Built a platform for trading virtual Harry Potter cards",
			"  • Used Next.js, TypeScript and real-time Firebase database",
			"  • Implemented user authentication and card trading system",
			"> Currently perfecting my fullstack development skills...",
		],
		[]
	);

	const startTyping = useCallback(() => {
		if (isTypingRef.current) return;

		// Clear everything first
		setText("");
		setCommandHistory("");
		setIsTypingComplete(false);
		setHasFinishedTyping(false);
		setShowPrompt(false);
		isTypingRef.current = true;

		let currentIndex = 0;
		let currentChar = 0;
		let fullText = "";
		let animationFrameId: number;

		const typeText = () => {
			if (currentIndex >= experience.length) {
				isTypingRef.current = false;
				Promise.resolve()
					.then(() => setIsTypingComplete(true))
					.then(() => new Promise((resolve) => setTimeout(resolve, 500)))
					.then(() => {
						setHasFinishedTyping(true);
						setShowPrompt(true);
						// Ensure scroll after typing and prompt are complete
						requestAnimationFrame(() => {
							if (terminalContentRef.current) {
								ScrollUtility.scrollToBottom(terminalContentRef.current);
							}
						});
					});
				return;
			}

			const currentLine = experience[currentIndex];
			if (currentChar < currentLine.length) {
				fullText += currentLine[currentChar];
				setText(fullText);
				currentChar++;
			} else {
				fullText += "\n";
				setText(fullText);
				currentIndex++;
				currentChar = 0;
			}

			// Scroll to bottom after each character
			if (terminalContentRef.current) {
				ScrollUtility.scrollToBottom(terminalContentRef.current);
			}

			animationFrameId = requestAnimationFrame(typeText);
		};

		// Start with a clean delay
		const timeoutId = setTimeout(() => {
			animationFrameId = requestAnimationFrame(typeText);
		}, 400);

		return () => {
			clearTimeout(timeoutId);
			cancelAnimationFrame(animationFrameId);
			isTypingRef.current = false;
		};
	}, [experience]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && initialLoadRef.current) {
					initialLoadRef.current = false;
					setHasStartedTyping(true);
					startTyping();
				}
			},
			{ threshold: 0.3 }
		);

		if (terminalRef.current) {
			observer.observe(terminalRef.current);
		}

		return () => observer.disconnect();
	}, [startTyping]);

	// Move resize function to component level
	const resizeTextarea = useResizeTextarea(inputRef, terminalContentRef);

	const renderPrompt = () => (
		<span className="flex text-purple-400 whitespace-nowrap ">
			<span className="text-green-400">ilan</span>
			<span className="text-gray-400">@</span>
			<span className="text-purple-400">portfolio</span>
			<span className="text-gray-400">&gt; </span>
		</span>
	);

	// Inside TerminalExperience component, add this function
	const handleCommand = (command: string) => {
		const args = command.trim().toLowerCase().split(/\s+/);
		const cmd = args[0];

		if (!cmd) {
			return "";
		}

		const commandHandler = AVAILABLE_COMMANDS[cmd];
		if (!commandHandler) {
			return `Command not found: ${cmd}\nType 'help' to see available commands.`;
		}

		const response = commandHandler(args.slice(1));

		if (response.action) {
			response.action();
		}

		return response.output;
	};

	// Update the handleKeyDown function in TerminalExperience
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!hasFinishedTyping) return;

		// Prevent cursor from going before position 17
		if (inputRef.current && inputRef.current.selectionStart < 17) {
			inputRef.current.setSelectionRange(17, 17);
		}

		if (e.key === "Enter") {
			e.preventDefault();
			const input = userInput.trim();
			const promptHtml = `<span class="text-green-400">ilan</span><span class="text-gray-400">@</span><span class="text-purple-400">portfolio</span><span class="text-gray-400 mr-2">&gt; </span>`;

			// Handle the clear command specially
			if (input.toLowerCase() === "clear") {
				setCommandHistory("");
				setUserInput("");
				return;
			}

			const output = handleCommand(input);
			const escapedInput = input.replace(
				/[<>&"']/g,
				(char) =>
					({
						"<": "&lt;",
						">": "&gt;",
						"&": "&amp;",
						'"': "&quot;",
						"'": "&#39;",
					}[char] || char)
			);

			const newHistory = `${commandHistory}<div class="break-words">${promptHtml}${escapedInput}</div>\n${
				output ? `<div class="text-purple-200 mb-3">${output}</div>\n` : ""
			}`;

			Promise.resolve().then(() => {
				setCommandHistory(newHistory);
				setUserInput("");

				requestAnimationFrame(() => {
					if (inputRef.current) {
						inputRef.current.style.height = `${TEXTAREA_BASE_HEIGHT}px`;
					}
					if (terminalContentRef.current) {
						ScrollUtility.scrollToBottom(terminalContentRef.current);
					}
				});
			});
		}
	};

	const resetTerminal = useCallback(() => {
		setText("");
		setCommandHistory("");
		setHasStartedTyping(false);
		setHasFinishedTyping(false);
		setIsTypingComplete(false);
		setUserInput("");
		setIsActive(false);
		setShowPrompt(false); // Hide prompt on reset
	}, []);

	const { lock: lockScroll, unlock: unlockScroll } = useScrollLock();

	// Update the handleClose function
	const handleClose = () => {
		if (isFullScreen) {
			unlockScroll();
			setIsFullScreen(false);
		}
		resetTerminal();
		setIsVisible(false);
		setMinimizedWindows((windows) =>
			windows.filter((w) => w.id !== "terminal")
		);
	};

	// Update handleMinimize to remove fullscreen-related body modifications
	const handleMinimize = useCallback(() => {
		if (isFullScreen) {
			unlockScroll();
			setIsFullScreen(false);
		}

		setIsMinimized(true);
		setMinimizedWindows((windows) => [
			...windows.filter((w) => w.id !== "terminal"),
			{ id: "terminal", title: "Terminal" },
		]);

		if (inputRef.current) {
			inputRef.current.blur();
		}
	}, [isFullScreen, unlockScroll]);

	const focusInputAtEnd = () => {
		if (inputRef.current) {
			inputRef.current.focus();
			const length = inputRef.current.value.length;
			inputRef.current.setSelectionRange(length, length);
		}
	};

	const handleRestore = (id: string) => {
		if (id === "terminal") {
			setIsMinimized(false);
			setMinimizedWindows((windows) =>
				windows.filter((w) => w.id !== "terminal")
			);
			// Only focus if typing is complete
			if (isTypingComplete && hasFinishedTyping) {
				setTimeout(focusInputAtEnd, 100);
			}
		}
	};

	useEffect(() => {
		if (!isFullScreen || !terminalContentRef.current) return;

		const wasAtBottom =
			Math.abs(
				terminalContentRef.current.scrollHeight -
					terminalContentRef.current.scrollTop -
					terminalContentRef.current.clientHeight
			) < 2;

		const timeoutId = setTimeout(() => {
			if (inputRef.current) {
				resizeTextarea();
			}
			if (wasAtBottom && terminalContentRef.current) {
				terminalContentRef.current.scrollTop =
					terminalContentRef.current.scrollHeight;
				updateScrollState();
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [isFullScreen, isAtBottom, updateScrollState, resizeTextarea]);

	// Update the terminal content render function
	const renderTerminalContent = () => {
		// Update the handleTextareaChange function
		const handleTextareaChange = (
			e: React.ChangeEvent<HTMLTextAreaElement>
		) => {
			const value = e.target.value;
			if (value.length >= 17) {
				const wasAtBottom = ScrollUtility.isAtBottom(
					terminalContentRef.current
				);
				setUserInput(value.slice(17));

				if (inputRef.current) {
					inputRef.current.style.height = `${TEXTAREA_BASE_HEIGHT}px`;
					const scrollHeight = inputRef.current.scrollHeight;
					if (scrollHeight > TEXTAREA_BASE_HEIGHT) {
						inputRef.current.style.height = `${scrollHeight}px`;
					}
				}

				// Only scroll if we were at bottom before
				if (wasAtBottom) {
					requestAnimationFrame(() => {
						ScrollUtility.scrollToBottom(terminalContentRef.current);
					});
				}
			}
		};

		return (
			<div className="h-full flex flex-col flex-1">
				<div
					ref={terminalContentRef}
					className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-6 scrollbar terminal-content"
					style={{
						minHeight: "0", // Important: allows flex child to scroll
						height: "auto",
						paddingBottom: "1rem",
					}}
					onScroll={() => {
						if (terminalContentRef.current) {
							wasScrolledToBottom.current = ScrollUtility.isAtBottom(
								terminalContentRef.current
							);
						}
					}}>
					{/* Terminal output */}
					<motion.div
						className="whitespace-pre-wrap text-purple-200 mb-3 break-words w-full"
						dangerouslySetInnerHTML={{ __html: text }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.15 }}
					/>

					{isTypingComplete && hasFinishedTyping && showPrompt && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.15 }}
							className="w-full">
							<div
								className="whitespace-pre-wrap text-purple-200 break-words w-full"
								dangerouslySetInnerHTML={{ __html: commandHistory }}
							/>
							<div className="flex flex-wrap items-start w-full relative">
								<textarea
									ref={inputRef}
									value={"                 " + userInput}
									onChange={handleTextareaChange}
									onKeyDown={(e) => {
										if (e.key === "Backspace") {
											setTimeout(() => {
												if (!inputRef.current) return;
												const value = inputRef.current.value;
												if (value.length < 17) {
													inputRef.current.value =
														" ".repeat(17) + value.slice(0);
													inputRef.current.selectionStart = 17;
													inputRef.current.selectionEnd = 17;
												}
												resizeTextarea();
											}, 0);
										}
										handleKeyDown(e);
									}}
									onFocus={(e) => {
										activeInputRef.current = true;
										e.target.selectionStart = 17;
										e.target.selectionEnd = 17;
										resizeTextarea();
									}}
									className="w-full bg-transparent border-0 outline-none resize-none text-purple-200 p-0 font-mono leading-6 focus:ring-0 hover:bg-purple-500/5 break-words mb-3"
									spellCheck={false}
									style={{
										height: `${TEXTAREA_BASE_HEIGHT}px`,
										minHeight: `${TEXTAREA_BASE_HEIGHT}px`,
										transition: "background-color 0.15s",
										scrollbarWidth: "none",
										overflowY: "hidden",
									}}
								/>
								<div className="absolute left-0 top-0 pointer-events-none text-purple-200 font-mono whitespace-nowrap">
									{renderPrompt()}
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</div>
		);
	};

	// Update initial size state to be responsive
	const [size, setSize] = useState(() => {
		const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
		return {
			width: isMobile ? Math.min(320, window.innerWidth - 32) : 800,
			height: isMobile ? 400 : 500,
		};
	});

	// Add initial position state to center the terminal
	const [position, setPosition] = useState(() => {
		const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
		const width = isMobile ? Math.min(320, window.innerWidth - 32) : 800;
		const height = isMobile ? 400 : 500;

		return {
			x: typeof window !== "undefined" ? (window.innerWidth - width) / 2 : 0,
			y:
				typeof window !== "undefined"
					? Math.max(20, (window.innerHeight - height) / 2 - 100)
					: 0,
		};
	});

	// Add touch state ref
	const touchStateRef = useRef<TouchState>({
		startX: 0,
		startY: 0,
		initialWidth: 0,
		initialHeight: 0,
		isResizing: false,
		resizeType: null,
	});

	// Add window resize handler
	useEffect(() => {
		const handleResize = () => {
			const isMobile = window.innerWidth < 768;
			const newWidth = isMobile
				? Math.min(320, window.innerWidth - 32)
				: size.width;
			const newHeight = isMobile ? 400 : size.height;

			// Update size for mobile
			setSize(() => ({
				width: Math.min(newWidth, window.innerWidth - 32),
				height: newHeight,
			}));

			// Keep terminal centered and within bounds
			setPosition((prev) => ({
				x: Math.min(Math.max(0, prev.x), window.innerWidth - newWidth),
				y: Math.min(Math.max(20, prev.y), window.innerHeight - newHeight),
			}));
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [size.width, size.height]);

	// Update the handleOpenTerminal function
	const handleOpenTerminal = useCallback(() => {
		// Reset terminal state
		resetTerminal();
		setShowPrompt(false);
		isTypingRef.current = false;

		// Calculate new size based on screen size
		const isMobile = window.innerWidth < 768;
		const newWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 800;
		const newHeight = isMobile ? 400 : 500;

		// Set size
		setSize({
			width: newWidth,
			height: newHeight,
		});

		// Center the terminal
		setPosition({
			x: (window.innerWidth - newWidth) / 2,
			y: Math.max(20, (window.innerHeight - newHeight) / 2 - 100),
		});

		// Show terminal and start typing
		setIsVisible(true);
		setTimeout(() => {
			if (!isTypingRef.current) {
				setHasStartedTyping(true);
				startTyping();
			}
		}, 1200);
	}, [resetTerminal, startTyping]);

	// Add this function to check if we're dragging the header
	const isHeaderDrag = (target: HTMLElement) => {
		return target.closest(".terminal-header") !== null;
	};

	// Add these touch handlers for mobile support
	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (isFullScreen) return;

			const touch = e.touches[0];
			const target = e.target as HTMLElement;

			// Only allow dragging from the header on mobile
			if (isMobileDevice() && !isHeaderDrag(target)) {
				return;
			}

			e.preventDefault(); // Prevent page scroll

			// Check if touching resize handles
			const isLeftResize = target.classList.contains("resize-left");
			const isRightResize = target.classList.contains("resize-right");
			const isBottomResize = target.classList.contains("resize-bottom");
			const isBottomRightResize = target.classList.contains(
				"resize-bottom-right"
			);

			if (
				isLeftResize ||
				isRightResize ||
				isBottomResize ||
				isBottomRightResize
			) {
				touchStateRef.current = {
					startX: touch.clientX,
					startY: touch.clientY,
					initialWidth: size.width,
					initialHeight: size.height,
					isResizing: true,
					resizeType: isLeftResize
						? "left"
						: isRightResize
						? "right"
						: isBottomResize
						? "bottom"
						: "bottom-right",
				};
			} else {
				// Handle dragging
				touchStateRef.current = {
					startX: touch.clientX - position.x,
					startY: touch.clientY - position.y,
					initialWidth: size.width,
					initialHeight: size.height,
					isResizing: false,
					resizeType: null,
				};
			}
		},
		[isFullScreen, size, position]
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (isFullScreen || !touchStateRef.current) return;

			const target = e.target as HTMLElement;
			if (isMobileDevice() && !isHeaderDrag(target)) {
				return;
			}

			e.preventDefault(); // Prevent page scroll

			const touch = e.touches[0];

			if (touchStateRef.current.isResizing) {
				// Handle resizing
				const deltaX = touch.clientX - touchStateRef.current.startX;
				const deltaY = touch.clientY - touchStateRef.current.startY;

				switch (touchStateRef.current.resizeType) {
					case "left":
						const newWidth = Math.max(
							320,
							touchStateRef.current.initialWidth - deltaX
						);
						setSize((prev) => ({
							width: newWidth,
							height: prev.height,
						}));
						setPosition((prev) => ({
							x: touchStateRef.current.startX + deltaX,
							y: prev.y,
						}));
						break;
					case "right":
						setSize((prev) => ({
							width: Math.max(
								320,
								Math.min(
									touchStateRef.current.initialWidth + deltaX,
									window.innerWidth - position.x - 16
								)
							),
							height: prev.height,
						}));
						break;
					case "bottom":
						setSize((prev) => ({
							width: prev.width,
							height: Math.max(
								200,
								Math.min(
									touchStateRef.current.initialHeight + deltaY,
									window.innerHeight - position.y - 16
								)
							),
						}));
						break;
					// Add other resize cases as needed
				}
			} else {
				// Handle dragging
				const newX = touch.clientX - touchStateRef.current.startX;
				const newY = touch.clientY - touchStateRef.current.startY;

				setPosition({
					x: Math.max(0, Math.min(newX, window.innerWidth - size.width)),
					y: Math.max(0, Math.min(newY, window.innerHeight - size.height)),
				});
			}
		},
		[isFullScreen, setSize, setPosition, size, position]
	);

	// Update the handleFullScreen function in TerminalExperience
	const handleFullScreen = useCallback(() => {
		const wasAtBottom = ScrollUtility.isAtBottom(terminalContentRef.current);

		setIsFullScreen((prev) => {
			if (!prev) {
				lockScroll();
			} else {
				unlockScroll();
			}
			return !prev;
		});

		// Ensure the terminal content is visible and scrolled correctly
		requestAnimationFrame(() => {
			if (wasAtBottom && terminalContentRef.current) {
				ScrollUtility.scrollToBottom(terminalContentRef.current);
			}
		});
	}, [lockScroll, unlockScroll]);

	return (
		<div
			ref={terminalRef}
			className="relative min-h-screen">
			<AnimatePresence mode="wait">
				{isVisible && !isMinimized && (
					<TerminalWindow
						position={position}
						size={size}
						isFullScreen={isFullScreen}
						onPositionChange={setPosition}
						onSizeChange={setSize}
						onFullScreenChange={setIsFullScreen}
						isActive={isActive}
						onActivate={() => setIsActive(true)}
						terminalContentRef={terminalContentRef} // Pass the ref
						inputRef={inputRef} // Add this prop
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={() => {
							touchStateRef.current = {
								startX: 0,
								startY: 0,
								initialWidth: 0,
								initialHeight: 0,
								isResizing: false,
								resizeType: null,
							};
						}}>
						{/* Window controls */}
						<motion.div
							className="flex gap-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}>
							<button
								onClick={handleClose}
								className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors"
							/>
							<button
								onClick={handleMinimize}
								className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors"
							/>
							<button
								onClick={handleFullScreen}
								className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors"
							/>
						</motion.div>
						{/* Terminal title */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}>
							ilan@portfolio:~/experience
						</motion.div>
						{/* Terminal content */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="h-full">
							{renderTerminalContent()}
						</motion.div>
					</TerminalWindow>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{minimizedWindows.length > 0 && (
					<Taskbar
						minimizedWindows={minimizedWindows}
						onRestore={handleRestore}
					/>
				)}
			</AnimatePresence>
			<AnimatePresence>
				{!isVisible && (
					<motion.button
						key="reopen-button"
						initial={{ opacity: 0 }}
						animate={{
							opacity: 1,
							transition: { duration: 0.2 },
						}}
						exit={{
							opacity: 0,
							transition: { duration: 0.1 },
						}}
						whileHover={{ scale: 1.05 }}
						style={{ pointerEvents: isVisible ? "none" : "auto" }}
						onClick={handleOpenTerminal}
						className="fixed bottom-4 right-4 bg-purple-900/30 hover:bg-purple-800/30 rounded-full p-3 text-purple-200/70 transition-colors shadow-lg backdrop-blur-sm">
						<span className="sr-only">Open Terminal</span>
						<motion.svg
							className="w-6 h-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							animate={{
								rotate: [0, -5, 0],
							}}
							transition={{
								repeat: Infinity,
								duration: 1.5,
								ease: "easeInOut",
							}}>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 9l3 3-3 3m5 0h3"
							/>
						</motion.svg>
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
};

export default TerminalExperience;
