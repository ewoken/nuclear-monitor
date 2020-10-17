class MemoryCache {
  constructor(logger) {
    this.cache = {};
    this.ttlIds = {};
    this.logger = logger;
  }

  setValue(key, value, ttl) {
    this.cache[key] = value;

    if (ttl) {
      this.addTTL(key, ttl);
    }
  }

  getValue(key) {
    return this.cache[key] || null;
  }

  deleteKey(key) {
    if (!this.cache[key]) {
      return null;
    }

    this.logger.info(`MemoryCache: delete ${key}`);
    const value = this.cache[key];
    delete this.cache[key];

    if (this.ttlIds[key]) {
      clearTimeout(this.ttlIds[key]);
      delete this.ttlIds[key];
    }
    return value;
  }

  addTTL(key, ttl) {
    if (this.ttlIds[key]) {
      clearTimeout(this.ttlIds[key]);
    }

    const id = setTimeout(() => {
      this.deleteKey(key);
    }, ttl);
    this.ttlIds[key] = id;
  }

  destroy() {
    Object.keys(this.ttlIds).forEach(clearTimeout);
  }
}

module.exports = MemoryCache;
