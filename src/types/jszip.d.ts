import JSZip from 'jszip';

declare module 'jszip' {
  interface JSZipGeneratorOptions<T extends JSZip.OutputType> {
    password?: string;
  }
}

export default JSZip; 