declare module "micromatch" {
  const micromatch: {
    isMatch: (value: string, patterns: string | string[]) => boolean;
  };

  export default micromatch;
}