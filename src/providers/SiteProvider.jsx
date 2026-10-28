"use client";
import { createContext, useContext } from "react";
const SiteContext = createContext(null);
export function SiteProvider({ site, children }) {
	return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}
export function useSite() {
	const site = useContext(SiteContext);
	if (!site) throw new Error("Website settings are unavailable");
	return site;
}
