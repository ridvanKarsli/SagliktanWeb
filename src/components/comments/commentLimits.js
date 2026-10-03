import { LIMITS } from '../../utils/validation.js'

// Backend'deki yorum içeriği üst sınırı (bkz. CommentRequest @Size) - tek
// kaynak utils/validation.js.
export const COMMENT_MAX_LENGTH = LIMITS.COMMENT_MAX
