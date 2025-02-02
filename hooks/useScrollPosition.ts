import { useRef, useEffect, useCallback } from "react";

export const useScrollPosition = (
	elementRef: React.RefObject<HTMLElement>,
	threshold = 2
) => {
	const isAtBottomRef = useRef(false);

	const checkIfAtBottom = useCallback(() => {
		if (!elementRef.current) return false;
		const { scrollHeight, scrollTop, clientHeight } = elementRef.current;
		return Math.abs(scrollHeight - scrollTop - clientHeight) < threshold;
	}, [elementRef, threshold]);

	const updateScrollState = useCallback(() => {
		isAtBottomRef.current = checkIfAtBottom();
	}, [checkIfAtBottom]);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		const handleScroll = () => {
			updateScrollState();
		};

		element.addEventListener("scroll", handleScroll, { passive: true });
		updateScrollState(); // Initial check

		return () => {
			element.removeEventListener("scroll", handleScroll);
		};
	}, [elementRef, updateScrollState]);

	return {
		isAtBottom: () => isAtBottomRef.current,
		checkIfAtBottom,
		updateScrollState,
	};
};
