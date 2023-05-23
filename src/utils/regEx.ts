export function isMail(mail: string): boolean {
  const pattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  return pattern.test(mail);
}
