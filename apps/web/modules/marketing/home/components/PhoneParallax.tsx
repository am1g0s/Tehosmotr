"use client"

import { cn } from "@ui/lib"
import { useEffect, useRef } from "react"

interface PhoneParallaxProps {
	children: React.ReactNode
}

export function PhoneParallax({ children }: PhoneParallaxProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)

	useEffect(function attachMouseHandlers() {
		function handleMove(event: MouseEvent) {
			const el = containerRef.current
			if (!el) return
			const rect = el.getBoundingClientRect()
			const centerX = rect.left + rect.width / 2
			const centerY = rect.top + rect.height / 2
			const dx = (event.clientX - centerX) / rect.width
			const dy = (event.clientY - centerY) / rect.height

			const rotateY = Math.max(-12, Math.min(12, dx * 24))
			const rotateX = Math.max(-12, Math.min(12, -dy * 24))
			const translateZ = 24

			el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`
		}

		function reset() {
			const el = containerRef.current
			if (!el) return
			el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
		}

		window.addEventListener("mousemove", handleMove)
		window.addEventListener("mouseleave", reset)
		return () => {
			window.removeEventListener("mousemove", handleMove)
			window.removeEventListener("mouseleave", reset)
		}
	}, [])

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative w-[320px] h-[520px]",
				// Внешняя рамка телефона (корпус)
				"rounded-[44px] bg-gradient-to-b from-foreground/20 to-foreground/5 p-3",
				"ring-1 ring-foreground/20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]",
				// Анимация
				"transition-transform duration-200 ease-out will-change-transform"
			)}
			style={{ transformStyle: "preserve-3d" }}
		>
			{/* Корпус/бампер */}
			<div
				className="absolute inset-0 rounded-[42px] bg-foreground/15 ring-1 ring-inset ring-foreground/25"
				style={{ transform: "translateZ(2px)" }}
			/>

			{/* Боковые кнопки */}
			<div className="absolute left-[-2px] top-24 h-16 w-[3px] rounded-r bg-foreground/20" style={{ transform: "translateZ(6px)" }} />
			<div className="absolute right-[-2px] top-32 h-10 w-[3px] rounded-l bg-foreground/20" style={{ transform: "translateZ(6px)" }} />

			{/* Вырез (чёлка) */
			}
			<div
				className="absolute left-1/2 top-3 z-20 h-6 w-32 -translate-x-1/2 rounded-full bg-black/70 dark:bg-black/60"
				style={{ transform: "translateZ(10px)" }}
			/>

			{/* Рамка-безель и экран */}
			<div
				className="absolute inset-0 rounded-[38px] bg-black/60 dark:bg-black/70 p-2"
				style={{ transform: "translateZ(4px)" }}
			>
				<div className="absolute inset-2 overflow-hidden rounded-[30px] bg-black">
					{/* Статус-бар (время, индикаторы) */}
					<div className="absolute top-0 left-0 right-0 z-20 h-8 px-3 flex items-center justify-between text-white/90">
						<span className="text-[13px] font-medium tracking-wide">9:41</span>
						<div className="flex items-center gap-2">
							{/* Сотовая связь */}
							<svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
								<rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor"/>
								<rect x="5" y="6" width="3" height="6" rx="0.5" fill="currentColor"/>
								<rect x="10" y="4" width="3" height="8" rx="0.5" fill="currentColor"/>
								<rect x="15" y="2" width="3" height="10" rx="0.5" fill="currentColor"/>
							</svg>
							{/* Wi‑Fi */}
							<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
								<path d="M1 4.5C5.5 1 10.5 1 15 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
								<path d="M3 7C6.5 4.5 9.5 4.5 13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
								<path d="M6 9.5C7.5 8.5 8.5 8.5 10 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
							</svg>
							{/* Батарея */}
							<svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
								<rect x="1" y="2" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
								<rect x="3" y="4" width="12" height="4" rx="1" fill="currentColor"/>
								<rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor"/>
							</svg>
						</div>
					</div>
					{/* Область контента ниже статус-бара */}
					<div className="absolute inset-0 pt-8">
						{children}
					</div>
				</div>
			</div>

			{/* Нижний индикатор жестов */}
			<div
				className="pointer-events-none absolute bottom-3 left-1/2 z-20 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/50"
				style={{ transform: "translateZ(10px)" }}
			/>

			{/* Мягкое отражение */}
			<div
				className="pointer-events-none absolute inset-0 rounded-[44px]"
				style={{
					background:
						"radial-gradient(140px 140px at 50% 0%, rgba(255,255,255,0.08), rgba(0,0,0,0) 70%)",
					mixBlendMode: "soft-light",
					transform: "translateZ(12px)",
				}}
			/>
		</div>
	)
}

export default PhoneParallax


