let source: HTMLImageElement | undefined;

export function setLightboxSource(image: HTMLImageElement | undefined) {
  source = image;
}

export function getLightboxSource() {
  return source?.isConnected ? source : undefined;
}

export function clearLightboxSource() {
  source = undefined;
}
