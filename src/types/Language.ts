// Single response of Language entity
export type Language = {
  /**
   * A unique code that identifies the language
   * @minLength 2
   * @maxLength 2
   */
  code: string;
  /** Indicates if the language is deletable */
  isDeletable: boolean;
  /**
   * Language name
   * @minLength 3
   * @maxLength 50
   */
  name: string;
};
