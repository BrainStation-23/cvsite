
import { useRef, useEffect } from 'react';

interface UseShadowDOMOptions {
  html: string;
  styles?: string;
}

export const useShadowDOM = ({ html, styles }: UseShadowDOMOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      console.log('Shadow DOM: No container element');
      return;
    }

    if (!html) {
      console.log('Shadow DOM: No HTML content, clearing container');
      // Clear container if no content
      if (shadowRootRef.current) {
        shadowRootRef.current.innerHTML = '';
      } else if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      return;
    }

    console.log('Shadow DOM: Processing HTML:', html.substring(0, 100) + '...');
    console.log('Shadow DOM: Processing styles:', styles?.substring(0, 100) + '...');

    // Create shadow root if it doesn't exist
    if (!shadowRootRef.current) {
      try {
        shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
        console.log('Shadow DOM: Created shadow root');
      } catch (error) {
        console.warn('Shadow DOM not supported, falling back to regular DOM');
        // Fallback: use regular innerHTML
        containerRef.current.innerHTML = html;
        return;
      }
    }

    const shadowRoot = shadowRootRef.current;

    // Always clear previous content before adding new content
    shadowRoot.innerHTML = '';

    // Add base styles for better rendering
    const baseStyles = `
      :host {
        display: block;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        width: 100%;
        height: 100%;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
      }
    `;

    // Create and add style element
    const styleElement = document.createElement('style');
    styleElement.textContent = baseStyles + (styles || '');
    shadowRoot.appendChild(styleElement);
    console.log('Shadow DOM: Added styles');

    // Create content container and add HTML
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = html;
    shadowRoot.appendChild(contentDiv);
    console.log('Shadow DOM: Added HTML content');

  }, [html, styles]); // Re-run effect when html or styles change

  // Cleanup function to handle component unmount
  useEffect(() => {
    return () => {
      if (shadowRootRef.current) {
        shadowRootRef.current.innerHTML = '';
      }
    };
  }, []);

  return containerRef;
};
