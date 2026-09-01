import { useEffect } from 'react';

/**
 * Custom hook to dynamically set the browser tab title (document.title).
 * Appends the application name 'Girnar Stock AI'.
 *
 * @param title The page title to display in the tab
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} | Girnar Stock AI`;
    } else {
      document.title = 'Girnar Stock AI';
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
