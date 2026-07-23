import { useEffect } from "react";

const useTitle = (title: string) => {
  useEffect(() => {
    document.title = `Just Share Care | ${title}`;
  });
  return null;
};

export default useTitle;
