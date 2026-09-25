const SALES_WHATSAPP = "5516997351101";

export function salesWhatsappUrl(message: string) {
  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
