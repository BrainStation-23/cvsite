
import { useRef, useEffect } from 'react';

interface UseShadowDOMOptions {
  html: string;
  styles?: string;
}

export const useShadowDOM = ({ html, styles }: UseShadowDOMOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;

    // Create shadow root if it doesn't exist
    if (!shadowRootRef.current) {
      try {
        shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
      } catch (error) {
        console.warn('Shadow DOM not supported, falling back to regular DOM');
        // Fallback: use regular innerHTML
        containerRef.current.innerHTML = html;
        return;
      }
    }

    const shadowRoot = shadowRootRef.current;

    // Clear previous content
    shadowRoot.innerHTML = '';

    // Add base styles for better rendering
    const baseStyles = `
      :host {
        display: block;
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      * {
        box-sizing: border-box;
      }
    `;

    // Create style element
    if (styles || baseStyles) {
      const styleElement = document.createElement('style');
      styleElement.textContent = baseStyles + (styles || '');
      shadowRoot.appendChild(styleElement);
    }

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = html;
    shadowRoot.appendChild(contentDiv);

  }, [html, styles]);

  return containerRef;
};
