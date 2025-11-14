import Image from "next/image";

export default function PaymentQRCode() {
	return (
		<div className="text-center">
			<p className="mb-4 text-sm text-white sm:text-base">
				Scan to pay / Rs. 50 / person
			</p>
			<div className="mx-auto mb-4 w-fit rounded-lg bg-white p-3 sm:p-4">
				<Image
					src="/DevsocHero.png"
					alt="Payment QR Code"
					width={180}
					height={180}
					className="mx-auto h-32 w-32 object-contain sm:h-44"
				/>
			</div>
			<p className="text-xs text-neutral-400 sm:text-sm">
				UPI ID: opsubham609@oksbi
			</p>
		</div>
	);
}
