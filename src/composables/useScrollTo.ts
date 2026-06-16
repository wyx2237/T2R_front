export function useScrollTo() {
  function scrollToElement(selector: string, offset = 80) {
    const el = document.querySelector(selector)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
      el.classList.add('flash-highlight')
      setTimeout(() => el.classList.remove('flash-highlight'), 1500)
    }
  }

  function scrollToId(id: string, offset = 80) {
    scrollToElement(`#${id}`, offset)
  }

  return { scrollToElement, scrollToId }
}
