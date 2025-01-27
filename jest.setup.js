// グローバルなモックの設定
global.File = class {
  constructor(bits, name, options = {}) {
    this.bits = bits;
    this.name = name;
    this.options = options;
  }
  arrayBuffer() {
    return Promise.resolve(Buffer.from(this.bits));
  }
}; 