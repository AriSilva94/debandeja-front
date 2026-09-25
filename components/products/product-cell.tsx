export function ProductCell({ name, sku }: { name: string; sku: string }) {
  return (
    <>
      <span className="font-medium text-gray-900">{name}</span>
      <span className="mt-0.25 block text-xs text-gray-400">{sku}</span>
    </>
  );
}
