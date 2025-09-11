import PhoneParallax from "@marketing/home/components/PhoneParallax"
import { Button } from "@ui/components/button"
import { ArrowRightIcon } from "lucide-react"
import Image from "next/image"
import heroImageDark from "../../../../public/images/hero-image-dark.png"
import heroImage from "../../../../public/images/hero-image.png"

export function Hero() {
	return (
		<div className="relative max-w-full overflow-x-hidden bg-linear-to-b from-0% from-card to-[50vh] to-background">
			<div className="absolute left-1/2 z-10 ml-[-500px] h-[500px] w-[1000px] rounded-full bg-linear-to-r from-primary to-bg opacity-20 blur-[150px]" />
			<div className="container relative z-20 pt-44 pb-12 lg:pb-16">
				<div className="mb-20 flex justify-center">
					<div className="mx-auto flex flex-wrap items-center justify-center rounded-full border border-highlight/30 p-px px-4 py-1 font-normal text-highlight text-sm shadow-sm">
						<span className="flex items-center gap-2 rounded-full font-semibold text-highlight">
							<span className="size-2 rounded-full bg-highlight" />
							Новинка:
						</span>
						<span className="ml-1 block font-medium text-foreground">
							Мобильное приложение GeoPhoto
						</span>
					</div>
				</div>

				<div className="grid items-center gap-10 lg:grid-cols-2">
					<div className="text-center lg:text-left">
						<h1 className="mx-auto lg:mx-0 max-w-3xl text-balance font-bold text-5xl lg:text-7xl">
							GeoPhoto — фото для техосмотра
						</h1>
						<p className="mx-auto lg:mx-0 mt-4 max-w-lg text-balance text-foreground/60 text-lg">
							Пока презентуем только мобильное приложение. Веб-кабинет появится позже.
						</p>
						<div className="mt-6 flex flex-col items-center lg:items-start justify-center lg:justify-start gap-3 md:flex-row">
							<Button size="lg" variant="primary" disabled>
								Скоро в App Store и Google Play
								<ArrowRightIcon className="ml-2 size-4" />
							</Button>
						</div>
					</div>
					<div className="relative mx-auto flex h-[520px] w-full max-w-[320px] items-center justify-center">
						<PhoneParallax>
							<Image
								src={heroImage}
								alt="Предпросмотр приложения GeoPhoto"
								className="pointer-events-none select-none block dark:hidden"
								priority
							/>
							<Image
								src={heroImageDark}
								alt="Предпросмотр приложения GeoPhoto (тёмная тема)"
								className="pointer-events-none select-none hidden dark:block"
								priority
							/>
						</PhoneParallax>
					</div>
				</div>
			</div>
		</div>
	);
}
