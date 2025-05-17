import type { Address } from "postal-mime";

export function getAddressDesc(sender: Address | undefined): string {
    if (sender === undefined) return ""
    if (sender.name) {
        return `${sender.name} <${sender.address}>`;
    }
    return sender.address ?? "";
}