const SCROLL_STORAGE_PREFIX = 'portfolio:scroll:'
const VIEWPORT_ANCHOR_RATIO = 0.38

function getScrollStorageKey() {
  return `${SCROLL_STORAGE_PREFIX}${window.location.pathname}`
}

function getMaxScrollY() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
}

export function clampScrollY(y) {
  return Math.max(0, Math.min(getMaxScrollY(), y))
}

function getSectionRecords() {
  return Array.from(document.querySelectorAll('main section[id]'))
    .map((section) => {
      const rect = section.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const height = Math.max(1, rect.height)
      return { id: section.id, top, height, bottom: top + height }
    })
    .filter(({ id, height }) => id && height > 1)
}

function findAnchorSection(anchorY) {
  const sections = getSectionRecords()
  if (!sections.length) return null

  const containing = sections.find(({ top, bottom }) => anchorY >= top && anchorY <= bottom)
  if (containing) return containing

  return sections.reduce((best, section) => {
    const distance = Math.abs(anchorY - section.top)
    return !best || distance < best.distance ? { ...section, distance } : best
  }, null)
}

export function captureScrollPosition() {
  const y = Math.round(window.scrollY)
  const maxY = getMaxScrollY()
  const viewportOffset = window.innerHeight * VIEWPORT_ANCHOR_RATIO
  const anchorY = y + viewportOffset
  const section = findAnchorSection(anchorY)

  return {
    y,
    ratio: maxY > 0 ? y / maxY : 0,
    anchor: section
      ? {
          id: section.id,
          progress: Math.max(0, Math.min(1, (anchorY - section.top) / section.height)),
          viewportRatio: VIEWPORT_ANCHOR_RATIO,
        }
      : null,
    at: Date.now(),
  }
}

export function resolveScrollY(record) {
  if (!record) return 0

  const anchor = record.anchor
  if (anchor?.id && Number.isFinite(anchor.progress)) {
    const section = document.getElementById(anchor.id)
    if (section) {
      const rect = section.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const height = Math.max(1, rect.height)
      const viewportOffset = window.innerHeight * (anchor.viewportRatio ?? VIEWPORT_ANCHOR_RATIO)
      return clampScrollY(top + height * anchor.progress - viewportOffset)
    }
  }

  if (Number.isFinite(record.ratio)) {
    return clampScrollY(record.ratio * getMaxScrollY())
  }

  return clampScrollY(Number.isFinite(record.y) ? record.y : 0)
}

export function readSavedScrollPosition() {
  try {
    const raw = window.sessionStorage.getItem(getScrollStorageKey())
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveScrollPosition() {
  try {
    window.sessionStorage.setItem(getScrollStorageKey(), JSON.stringify(captureScrollPosition()))
  } catch {
    /* storage can be unavailable in private or restricted contexts */
  }
}
