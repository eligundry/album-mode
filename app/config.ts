const config = {
  cacheControl: {
    public: `public, max-age=${60 * 60 * 24}, s-maxage=${60 * 60 * 24}`,
    private: `private, max-age=${60 * 60 * 12}`,
  },
}

export default config
