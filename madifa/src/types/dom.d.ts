interface Window {
  matchMedia(query: string): MediaQueryList
  document: Document
  location: Location
}

interface Document {
  getElementById(id: string): HTMLElement | null
}

interface HTMLInputElement extends HTMLElement {
  value: string
  type: string
  placeholder: string
}

interface HTMLFormElement extends HTMLElement {
  onsubmit: (event: Event) => void
}

interface Event {
  preventDefault(): void
  target: EventTarget | null
}

interface EventTarget {
  value?: string
} 