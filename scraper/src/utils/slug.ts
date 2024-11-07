import slugify from 'slugify';

export function generateSlug(name: string): string {
  // First replace Russian-specific patterns
  const preprocessed = name
    .toLowerCase()
    .replace(/квиз/g, 'quiz')
    .replace(/плиз/g, 'please')
    .replace(/1\?=!/g, 'one-question-is-fine')
    .replace(/¯\\_(ツ)_\/¯/g, ' shrug ')
    .replace(/\.\*/g, ' wildcard ')
    .replace(/\*/g, ' star ');

  slugify.extend({ '+': ' plus ' });

  return slugify(preprocessed, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'en',
  });
}
