
export * from "../shared_js/utils.js"

export function shortId(id: string): string {
	return id.substring(0, id.indexOf("-"));
}
