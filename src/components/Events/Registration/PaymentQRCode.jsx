"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/axios";

export default function PaymentQRCode({ eventSlug }) {
	const [paymentSettings, setPaymentSettings] = useState(undefined);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const res = await api.get("/settings/payment", {
					params: { eventSlug },
				});
				setPaymentSettings(res.data.data);
			} catch (error) {
				// console.error("Failed to fetch payment settings:", error);
				setPaymentSettings(null);
			}
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
				{paymentSettings.qrCodeUrl ? (
					<Image
						src={paymentSettings.qrCodeUrl}
						alt="Payment QR Code"
						width={180}
						height={180}
						className="mx-auto h-32 w-32 object-contain sm:h-44 sm:w-44"
					/>
				) : (
					<div className="flex h-32 w-32 items-center justify-center bg-zinc-100 text-xs text-zinc-500 sm:h-44 sm:w-44">
						QR Code Unavailable
					</div>
				)}
			</div>
			<p className="text-xs text-zinc-400 sm:text-sm">
				UPI ID: {paymentSettings.upiId}
			</p>
		</div>
	);
}
