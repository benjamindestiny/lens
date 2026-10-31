import { extractText, getDocumentProxy } from "unpdf";
import { parseOffice } from "officeparser";

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

export async function extractPptxText(buffer: ArrayBuffer): Promise<string> {
  const ast = await parseOffice(Buffer.from(buffer));
  const result = await ast.to("text");
  return result.value;
}

export async function extractTextFromFile(
  buffer: ArrayBuffer,
  filename: string
): Promise<string> {
  if (/\.pdf$/i.test(filename)) return extractPdfText(buffer);
  if (/\.pptx$/i.test(filename)) return extractPptxText(buffer);
  throw new Error("Unsupported file type. Use PDF or PPTX.");
}
