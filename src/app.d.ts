declare global {
  namespace App {}
  interface Document {
    startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> };
  }
}
export {};
