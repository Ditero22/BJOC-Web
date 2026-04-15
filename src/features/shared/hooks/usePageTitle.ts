import { useEffect } from "react";

export const usePageTitle = (title: string, role?: string) => {
  useEffect(() => {
    const prevTitle = document.title;

    const systemName = role ? `BJOC ${role}` : "BJOC System";

    document.title = `${title} | ${systemName}`;

    return () => {
      document.title = prevTitle;
    };
  }, [title, role]);
};