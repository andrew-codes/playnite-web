function slug(release: { title: string }): string {
  return release.title
    .toLowerCase()
    .replace(/[.,!?<>/|\\:$\^&*(){}\[\]"';@#`~]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export { slug }
