import { defaultCategories } from './categories'
import { initialLists } from './lists'
import { initialProjects } from './projects'
import { initialTasks } from './tasks'

/**
 * Dati dimostrativi usati SOLO al primo avvio (archivio inesistente).
 * Le date sono relative al momento dell'inizializzazione; da lì in poi vengono salvate
 * come date assolute e non vengono più ricalcolate.
 */
export function createSeedData() {
  const clone = (v) => JSON.parse(JSON.stringify(v))
  return {
    lists: clone(initialLists),
    tasks: clone(initialTasks),
    projects: clone(initialProjects),
    categories: clone(defaultCategories),
  }
}
