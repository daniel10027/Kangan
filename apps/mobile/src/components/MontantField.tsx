import { Text, TextInput, View } from "react-native";

export function MontantField({
  label,
  value,
  onChange,
  hint,
  error,
}: {
  label?: string;
  value: number | "";
  onChange: (v: number) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <View>
      {label && <Text className="mb-1.5 text-sm font-medium text-encre">{label}</Text>}
      <View className={`h-14 flex-row items-center rounded-field border px-4 ${error ? "border-piment" : "border-encre/15"}`}>
        <TextInput
          keyboardType="number-pad"
          value={value === "" ? "" : value.toLocaleString("fr-FR").replace(/,/g, " ")}
          onChangeText={(t) => {
            const digits = t.replace(/[^\d]/g, "");
            onChange(digits === "" ? 0 : Number(digits));
          }}
          placeholder="0"
          className="flex-1 text-lg font-semibold text-encre"
        />
        <Text className="text-sm font-medium text-encre/40">F CFA</Text>
      </View>
      {hint && !error && <Text className="mt-1 text-xs text-encre/50">{hint}</Text>}
      {error && <Text className="mt-1 text-xs font-medium text-piment">{error}</Text>}
    </View>
  );
}
