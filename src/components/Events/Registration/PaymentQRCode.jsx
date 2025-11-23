"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export default function PaymentQRCode({ eventSlug }) {
	// Fetch payment settings
	const paymentSettings = useQuery(api.settings.getPaymentSettings, {
		eventSlug,
	});

	if (paymentSettings === undefined) {
		return (
			<div className="text-center">
				<div className="mx-auto mb-4 h-44 w-44 animate-pulse rounded-lg bg-neutral-800" />
				<p className="text-xs text-neutral-400">Loading payment details...</p>
			</div>
		);
	}

	if (!paymentSettings) {
		return (
			<div className="text-center">
				<p className="text-sm text-neutral-400">
					Payment details will be displayed here
				</p>
			</div>
		);
	}

	return (
		<div className="text-center">
			<p className="mb-4 text-sm text-white sm:text-base">
				Scan to pay / Rs. {paymentSettings.amount} / person
			</p>
			<div className="mx-auto mb-4 w-fit rounded-lg bg-white p-3 sm:p-4">
				<Image
					src={paymentSettings.qrCodeUrl}
					alt="Payment QR Code"
					width={180}
					height={180}
					className="mx-auto h-32 w-32 object-contain sm:h-44 sm:w-44"
				/>
			</div>
			<p className="text-xs text-neutral-400 sm:text-sm">
				UPI ID: {paymentSettings.upiId}
			</p>
		</div>
	);
}
