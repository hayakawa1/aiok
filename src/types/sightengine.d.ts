declare module 'sightengine' {
  interface SightengineSuccess {
    status: 'success';
    nudity: {
      raw: number;
      safe: number;
      suggestive: number;
    };
    offensive: number;
  }

  interface SightengineError {
    status: 'failure';
    error: {
      type: string;
      code: number;
      message: string;
    };
  }

  type SightengineResult = SightengineSuccess | SightengineError;

  class Sightengine {
    constructor(api_user: string, api_secret: string);
    check(models: string[]): {
      set_url: (url: string) => Promise<SightengineResult>;
    };
  }

  export default Sightengine;
} 