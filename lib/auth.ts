export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("jwtToken", token)
  }
}

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwtToken")
  }
  return null
}

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwtToken")
  }
}

export const setUserId = (userId: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userId", userId)
  }
}

export const getUserId = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId")
  }
  return null
}