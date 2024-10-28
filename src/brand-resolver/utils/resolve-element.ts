/**
 * Wait element ready state
 * @param element
 */
export async function resolveElement(element: HTMLElement): Promise<HTMLElement> {
  return new Promise<HTMLElement>(async resolve => {
    if ((element as any).updateComplete) {
      await (element as any).updateComplete;
    }
    setTimeout(() => resolve(element as HTMLElement), 10);
  })
}