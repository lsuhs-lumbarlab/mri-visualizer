declare module 'dcmjs' {
  export const data: {
    DicomMetaDictionary: {
      naturalizeDataset: (dataset: any) => any;
    };
    DicomMessage: {
      readFile: (buffer: Uint8Array) => { dict: any };
    };
  };
}