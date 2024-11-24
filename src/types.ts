export interface ResponseMap {
  [path: string]: {
    [method: string]: {
      [payload: string]: {
        status: number;
        body: string;
      };
    };
  };
}
