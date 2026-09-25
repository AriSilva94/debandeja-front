export function formatCnpj(digits: string | null) {
  if (!digits) return "";
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function formatCep(digits: string | null) {
  if (!digits) return "";
  return digits.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}
