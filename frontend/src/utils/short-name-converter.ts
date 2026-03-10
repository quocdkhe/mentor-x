export function shortVietnameseName(fullName: string) {
  const removeAccent = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

  const words = removeAccent(fullName.toLowerCase()).trim().split(/\s+/);

  if (words.length === 0) return "";

  const lastName = words[words.length - 1];
  const initials = words
    .slice(0, -1)
    .map((w) => w[0].toUpperCase())
    .join("");

  return lastName.charAt(0).toUpperCase() + lastName.slice(1) + initials;
}
