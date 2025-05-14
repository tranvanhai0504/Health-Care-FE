import { remark } from "remark";
import html from "remark-html";

export const convertMarkdown = async (content: string) => {
  const processedContent = await remark().use(html).process(content);
  let contentHtml = processedContent.toString();
  contentHtml = contentHtml.replaceAll("\\n", "<br/>");

  return contentHtml;
};
