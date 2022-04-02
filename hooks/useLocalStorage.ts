import { Dispatch, DispatchWithoutAction, SetStateAction, useCallback, useEffect, useState } from 'react'

const stringify = <T>(value: T): string | null => {
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}
const unStringify = <T>(value: string | null): T | null => {
  if (value === null) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const triggerStorageEvent = () => dispatchEvent(new StorageEvent('storage', {}))

/**
 * `useLocalStorage` can be use in place of `useState`.
 *
 * The main difference is that the `key` argument is used to retrieve the right information.
 * The state will remain between refreshes; so you have to take care of what values you store in it.
 *
 * It triggers an event so every components that use this hook will be updated.
 * And as a bonus, it works in all tabs opened on your domain.
 *
 * The hooks returns a third item in the array, which is to remove the state from `localStorage`.
 * When value is unset or not existant in `localStorage`, all states will be back to the `fallbackValue`
 *
 * @param  {string} key
 * @param  {T} fallbackValue
 */
export const useLocalStorage = <T = unknown>(
  key: string,
  fallbackValue: T
): [T, Dispatch<SetStateAction<T>>, DispatchWithoutAction] => {
  // TODO: better to store stringified values, as they can be compared with ===
  const [value, setValue] = useState<T>(fallbackValue)

  const setStorageValue = useCallback(
    (newValue: SetStateAction<T>) => {
      if (typeof newValue === 'function') {
        // https://github.com/microsoft/TypeScript/issues/37663
        newValue = (newValue as (prev: T) => T)(value)
      }
      const newValueAsString = stringify<T>(newValue)
      if (newValueAsString) global.localStorage.setItem(key, newValueAsString)
      triggerStorageEvent()
    },
    [key]
  )

  const deleteStorageValue = useCallback(() => {
    global.localStorage.removeItem(key)
    triggerStorageEvent()
  }, [])

  useEffect(() => {
    const getItemFromStorage = () => {
      const newValueAsString = global.localStorage.getItem(key)
      const newValue = unStringify<T>(newValueAsString)
      // this is always true as T is probably not a primitive
      if (newValue !== value) setValue(newValue ?? fallbackValue)
    }
    getItemFromStorage()
    global.addEventListener('storage', getItemFromStorage)
    return () => global.removeEventListener('storage', getItemFromStorage)
  }, [key])

  return [value, setStorageValue, deleteStorageValue]
}
