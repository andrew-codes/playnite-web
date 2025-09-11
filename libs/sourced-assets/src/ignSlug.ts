function ignSlug(release: { title: string }): string {
  return release.title
    .toLowerCase()
    .replace(/[.,!?<>/|\\:$\^&*(){}\[\]"';@#`~]|--+/g, '')
    .replace(/ /g, '-')
}

export { ignSlug }
