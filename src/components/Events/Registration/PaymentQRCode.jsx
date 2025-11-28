"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function PaymentQRCode({ eventSlug }) {
	const [paymentSettings, setPaymentSettings] = useState(undefined);

	// Fetch payment settings
	useEffect(() => {
		const fetchSettings = async () => {
			const { data } = await api.settings["payment-settings"][eventSlug].get();
			setPaymentSettings(data);
		};
		fetchSettings();
	}, [eventSlug]);

	if (paymentSettings === undefined) {
		return (
			<div className="text-center">
				<div className="mx-auto mb-4 h-44 w-44 animate-pulse rounded-lg bg-zinc-800" />
				<p className="text-xs text-zinc-400">Loading payment details...</p>
			</div>
		);
	}

	if (!paymentSettings) {
		return (
			<div className="text-center">
				<p className="text-sm text-zinc-400">
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
			<p className="text-xs text-zinc-400 sm:text-sm">
				UPI ID: {paymentSettings.upiId}
			</p>
		</div>
	);
}
