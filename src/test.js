export function getMaxString(string) {
  if (!string) {
    return 0;
  }
  if (string.length < 2) {
    return string.length;
  }
  let left = 0,
    right = 1,
    max = 0,
    str = "";
  while (left <= right && right < string.length) {
    str = str || string[left];
    if (str.includes(string[right])) {
      left += 1;
      right = left + 1;
      str = string[left];
    } else {
      str += string[right];
      right++;
    }
    max = str.length > max ? str.length : max;
  }
  return { max, str };
}

export const abc = "1111";
export const bbb = "2222";
// export { getMaxString };
